import express from "express";
import { signup, authStatus, logout, forgotPassword , resetPassword, verifySignupOTP } from "../controllers/authController.js";
import passport from "passport";
import User from "../models/User.js";
import { sendResponse } from "../utils/response.js";

const router = express.Router();

// register
router.post("/signup", signup);
// login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return sendResponse(res, false, { message: info?.message || "Login failed" }, 400);

    // Log user in and create session
    req.login(user, (err) => {
      if (err) return sendResponse(res, false, "Login failed", null, 500);
      console.log("User session after login:", req.session);
      console.log("User object:", req.user);

      return sendResponse(res, true, "Login successful", {
        email: user.email,
        name: user.firstName
      }, 200);
    });
  })(req, res, next);
});


// auth status
router.post("/status" , authStatus);
// logout
router.post("/logout" , logout);

// 2FA OTP
router.post("/verify-otp", verifySignupOTP);

router.post("/forgot-password" , forgotPassword);

// router.post("/forgot-password/verify-otp" , FPverifyOTP);

router.post("/reset-password", resetPassword);

// router.get("/data", checkAuth, (req, res) => {
//   sendResponse(res, true , "protected data", {user: req.user});
// });


export default router;
