import { useEffect, useMemo, useRef, useState } from "react";
import logo from "../../assets/logo.png";
import bg from "../../assets/login-bg.png";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { showToast } from "../../utils/toastHelper";
import apiClient from "../../utils/apiClient";

function VerifyCode() {
  const [searchParams] = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputsRef = useRef([]);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const code = useMemo(() => otp.join("").trim(), [otp]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const handleChange = (idx, value) => {
    if (!/^[a-zA-Z0-9]?$/.test(value)) return; 
    const next = [...otp];
    next[idx] = value;
    setOtp(next);
    if (value && idx < inputsRef.current.length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace") {
      if (otp[idx]) {
        // clear current
        const next = [...otp];
        next[idx] = "";
        setOtp(next);
        return;
      }
      if (idx > 0) {
        inputsRef.current[idx - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowRight" && idx < inputsRef.current.length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData("text") || "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 6);
    if (!pasted) return;
    const next = Array(6)
      .fill("")
      .map((_, i) => pasted[i] || "");
    setOtp(next);
    const lastFilled = Math.min(pasted.length, 6) - 1;
    if (lastFilled >= 0) inputsRef.current[lastFilled]?.focus();
  };

  const onSubmit = async (e) => {
  e.preventDefault();
  
  if (otp.length !== 6) {
    showToast("warning", "Please enter a 6-digit OTP");
    return;
  }

  console.log(code);

  try {
    setSubmitting(true);
    setLoading(true);

    // const res = await axios.post(
    //   "http://localhost:5000/api/auth/verify-otp",
    //   { otp: code },
    //   { withCredentials: true }
    // );

    const res = await apiClient.post("/auth/verify-otp", {otp: code});

    if (res.data.success) {
      showToast("success", "OTP verified successfully!");

      setTimeout(() => navigate("/"), 600);
    } else {
      showToast("error", "Incorrect OTP");
    }
  } catch (err) {
    //  Catch backend or network errors
    showToast("error", "Something went wrong. Please try again.");
  } finally {
    setSubmitting(false);
    setLoading(false);
  }
};


  const resend = async () => {
    if (secondsLeft > 0) return;
    
    setSecondsLeft(60);
  };

  return (
    <div className="w-screen h-screen flex bg-gray-100 relative">
      {/* Top-left Logo (outside the form) */}
      <div className="absolute top-6 left-6 z-20 flex items-center">
        <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full mr-3">
          <img src={logo} alt="Logo" className="w-8 h-8" />
        </div>
        <span className="font-bold text-3xl text-[#313131]">Your Logo</span>
      </div>

      {/* Left Side - Verify Form */}
      <div className="w-full md:w-1/2 h-full flex items-center justify-center bg-white p-10">
        <div className="w-full max-w-md flex flex-col justify-center">
          {/* Title & Subtitle */}
          <h2 className="text-3xl font-bold text-[#313131] mb-1">Verification</h2>
          <p className="text-sm text-[#313131] opacity-75 leading-[1.5] mb-6">
            Enter the 6-character code we sent {emailFromQuery ? `to ${emailFromQuery}` : "to your email"}.
          </p>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  inputMode="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  ref={(el) => (inputsRef.current[idx] = el)}
                  className="w-10 h-12 sm:w-12 sm:h-12 md:w-14 md:h-14 flex-shrink-0 text-center text-lg md:text-xl border border-[#79747E] rounded-md focus:outline-none focus:border-[#3869EB] bg-white tracking-widest"
                />
              ))}
            </div>

            {/* Resend timer */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#313131] opacity-75">Didn’t receive the code?</span>
              {secondsLeft > 0 ? (
                <span className="text-[#313131] opacity-60">Resend in 0:{String(secondsLeft).padStart(2, "0")}</span>
              ) : (
                <button type="button" onClick={resend} className="text-[#3869EB] font-medium hover:underline cursor-pointer">
                  Resend code
                </button>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={code.length !== 6 || submitting}
              className="w-full py-2 mt-2 bg-[#3869EB] text-[#F3F3F3] rounded-md text-sm font-semibold hover:bg-[#2c5bc4] transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              Verify
            </button>
          </form>

          {/* Back to login */}
          <div className="text-center mt-4 text-xs">
            <span className="text-gray-700">Entered wrong email? </span>
            <Link to={"/"} className="text-[#3869EB] hover:underline font-medium text-xs">Go back</Link>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden md:flex w-1/2 h-full items-center justify-center bg-white relative">
        <img
          className="w-full h-full absolute rounded-lg object-contain"
          src={bg}
          alt="Verification"
        />
      </div>
    </div>
  );
}

export default VerifyCode;


