import User from "../models/User.js";
import bcrypt from "bcrypt";
import nodeMailer from "nodemailer";
import {sendResponse} from "../utils/response.js"
import otpGenerator from "otp-generator";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const process = globalThis.process;

export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) 
      return sendResponse(res, false, "User already exists", null, 400);

    const hashPassword = await bcrypt.hash(password, 10);

    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
    
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashPassword,
      isVerified: false,
      resetPasswordToken: undefined,   
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000,
      resetPasswordExpire: undefined
    });

    const transporter = nodeMailer.createTransport({
      service: "Gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: newUser.email,
      subject: "Verify Your Account - OTP",
      text: `Welcome! Your OTP code is: ${otp}. It will expire in 5 minutes.`,
    });
    
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: "10m" });
    res.cookie("verify_token", token, { httpOnly: true, sameSite: "lax" });

    sendResponse(res, true, "User registered. Please verify OTP sent to your email.", { userID: newUser._id }, 200);

  } catch (error) {
    sendResponse(res, false, { error: error.message }, null, 500);
  }
};


export const authStatus = (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    sendResponse(
      res,
      true,
      "User logged in successfully",
      { email: req.user.email, name: req.user.firstName },
      200
    );
  } else {
    sendResponse(res, false, "Unauthorized user", 401);
  }
};

export const logout = async (req, res) => {
  if (!req.user) {
    return sendResponse(res, false, "Unauthorized user", 401);
  }

  req.logout((err) => {
    if (err) {
      return sendResponse(res, false, "Logout error", 400);
    }

    // Destroy the session completely
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        return sendResponse(res, false, "Failed to destroy session", 500);
      }

      // Clear the session cookie from the browser
      res.clearCookie("connect.sid", {
        path: "/", 
        httpOnly: true, 
        sameSite: "lax"
      });

      return sendResponse(res, true, "Logout successful", 200);
    });
  });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    console.log("hello how are you", existingUser);

    if (!existingUser) {
      
      return sendResponse(res, false, "User does not exist", 404);
    }

    const resetToken = jwt.sign({id: existingUser._id}, process.env.JWT_SECRET, {expiresIn: "15m"});

    existingUser.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    existingUser.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await existingUser.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost'}/reset-password/${resetToken}`;

    // If user exists
    // const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
    // existingUser.otp = otp;
    // existingUser.otpExpires = Date.now() + 5 * 60 * 1000;
    // await existingUser.save();

    const transporter = nodeMailer.createTransport({
      service: "Gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: existingUser.email,
      subject: "Password Reset Request",
      html:`<p>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 15 minutes.</p>`,
    });

    return sendResponse(res, true, "Password reset email sent successfully.", 200);

  } catch (error) {
    console.error(error);
    return sendResponse(res, false, "Server error", 500);
  }
};


export const resetPassword = async (req, res) => {
  try {
    const resetToken = req.body.token;
    console.log("Reset token received:", resetToken);
    
    if (!resetToken) {
      return sendResponse(res, false, "Reset token is required", null, 400);
    }
    
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }, 
    });

    if (!user) return sendResponse(res, false, "Invalid or expired token", null, 400);
    
    const { password } = req.body;
    if (!password) return sendResponse(res, false, "Password required", null, 400);
    const hashPassword = await bcrypt.hash(password, 10);

    // Update password
    user.password = hashPassword; 
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return sendResponse(res, true, "Password reset successfully.");
  } catch (error) {
    console.error("Reset Password Error:", error);
    return sendResponse(res, false, "Server error", null, 500);
  }
};


export const verifySignupOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    // Read cookie
    const token = req.cookies.verify_token;
    if (!token) return sendResponse(res, false, "Token Missing", null, 401);

    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) return sendResponse(res, false, "User not found", null, 404);

    if (user.isVerified) {
      return sendResponse(res, false, "User already verified", null, 400);
    }

    console.log("User OTP:", user.otp);
    console.log("User OTP Expires:", user.otpExpires);
    console.log("Current Time:", Date.now());

    // Verify OTP validity
    if (user.otp !== otp || Date.now() > user.otpExpires) {
      return sendResponse(res, false, "Invalid or expired OTP", null, 400);
    }

    // Mark user verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // Clear cookie *after success*
    res.clearCookie("verify_token");

    return sendResponse(res, true, "Account verified successfully. You can now log in.", null, 200);
  } catch (error) {
    console.error("Verify OTP error:", error);
    return sendResponse(res, false, "Server error", null, 500);
  }
};



// export const checkAuth = (req, res, next) => {
//   if (req.isAuthenticated && req.isAuthenticated()) {
//     return next();
//   }
//   return res.status(401).json({ success: false, message: "Not authenticated" });
// };

