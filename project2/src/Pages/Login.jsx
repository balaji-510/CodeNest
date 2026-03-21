import { useState } from "react";
import "../styles1/Login.css";
import { useNavigate } from "react-router-dom";
import { login, register } from "../services/api";
import API_BASE from "../config";

// Signup has 3 steps: 'form' → 'otp' → done (redirects to login)
function AuthLogin() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [selectedRole, setSelectedRole] = useState("student");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [signupStep, setSignupStep] = useState("form"); // 'form' | 'otp'
  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    teacherCode: "",
    branch: "CSE",
    gender: "",
  });

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // Step 1: send OTP
  async function handleSendOtp(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!formData.email) {
      setError("Please enter your email address.");
      return;
    }

    setOtpLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/send-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send OTP.");
        return;
      }
      setInfo(`OTP sent to ${formData.email}. Check your inbox (or server console in dev).`);
      setSignupStep("otp");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  }

  // Step 2: verify OTP then register
  async function handleVerifyAndRegister(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!otpValue || otpValue.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setOtpLoading(true);
    try {
      // Verify OTP
      const verifyRes = await fetch(`${API_BASE}/api/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          otp: otpValue,
        }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        setError(verifyData.error || "OTP verification failed.");
        return;
      }

      // OTP verified — now register
      const registerData = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        first_name: formData.firstname,
        last_name: formData.lastname,
        role: selectedRole,
        teacher_code: selectedRole === "teacher" ? formData.teacherCode : "",
        branch: selectedRole === "student" ? formData.branch : "CSE",
        gender: formData.gender,
      };

      await register(registerData);
      setInfo("Account created! Please log in.");
      setSignupStep("form");
      setIsLoggedIn(true);
      setFormData({ firstname: "", lastname: "", username: "", email: "", password: "", teacherCode: "", branch: "CSE", gender: "" });
      setOtpValue("");
    } catch (err) {
      if (err.response?.data) {
        const d = err.response.data;
        const msg = typeof d === "object" ? Object.values(d).flat().join(" ") : String(d);
        setError(msg || "Registration failed.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    try {
      const response = await login(formData.username, formData.password);
      const role = response.role || localStorage.getItem("userRole");
      if (role === "teacher") {
        navigate("/mentor-dashboard");
      } else {
        navigate(`/dashboard/${formData.username}`);
      }
    } catch (err) {
      if (err.response?.data) {
        const d = err.response.data;
        const msg = typeof d === "object" ? Object.values(d).flat().join(" ") : String(d);
        setError(msg || "Invalid credentials.");
      } else {
        setError("Invalid credentials or server error.");
      }
    }
  }

  function switchToSignup() {
    setIsLoggedIn(false);
    setSignupStep("form");
    setError("");
    setInfo("");
    setOtpValue("");
  }

  function switchToLogin() {
    setIsLoggedIn(true);
    setSignupStep("form");
    setError("");
    setInfo("");
    setOtpValue("");
  }

  return (
    <div className="loginpage animate-fade-in">
      <div className="left">
        <div className="titlebox">
          <p className="login-title">Code<span>Nest</span></p>
          <p className="login-subtitle">Your Gateway to Coding Excellence</p>
        </div>
      </div>

      <div className="right">
        <div className="loginbox">
          <h2>
            {isLoggedIn
              ? "Welcome Back"
              : signupStep === "otp"
              ? "Verify Your Email"
              : "Create your CodeNest account"}
          </h2>

          {/* Role selector — only on signup form step */}
          {!isLoggedIn && signupStep === "form" && (
            <div className="role-selector">
              <button type="button" className={`role-btn ${selectedRole === "student" ? "active" : ""}`} onClick={() => setSelectedRole("student")}>Student</button>
              <button type="button" className={`role-btn ${selectedRole === "teacher" ? "active" : ""}`} onClick={() => setSelectedRole("teacher")}>Teacher</button>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
          {info && <div className="info-message">{info}</div>}

          {/* LOGIN FORM */}
          {isLoggedIn && (
            <form onSubmit={handleLogin}>
              <input type="text" placeholder="Username or Email" name="username" className="input" onChange={handleChange} value={formData.username} required />
              <input type="password" placeholder="Password" name="password" className="input" onChange={handleChange} value={formData.password} required />
              <button type="submit">Login</button>
              <p onClick={switchToSignup} className="toggle-auth">Don't have an account? Sign Up</p>
            </form>
          )}

          {/* SIGNUP STEP 1: fill form + send OTP */}
          {!isLoggedIn && signupStep === "form" && (
            <form onSubmit={handleSendOtp}>
              <input type="text" placeholder="First Name" className="input" name="firstname" onChange={handleChange} value={formData.firstname} required />
              <input type="text" placeholder="Last Name" className="input" name="lastname" onChange={handleChange} value={formData.lastname} required />
              <input type="text" placeholder="Username" name="username" className="input" onChange={handleChange} value={formData.username} required />
              <input type="email" placeholder="Email" name="email" className="input" onChange={handleChange} value={formData.email} required />
              <input type="password" placeholder="Password" name="password" className="input" onChange={handleChange} value={formData.password} required />
              {selectedRole === "teacher" && (
                <input type="password" placeholder="Teacher Registration Code" name="teacherCode" className="input" onChange={handleChange} value={formData.teacherCode} required />
              )}
              {selectedRole === "student" && (
                <select name="branch" className="input" onChange={handleChange} value={formData.branch} required>
                  <option value="CSE">CSE</option>
                  <option value="CSM">CSM</option>
                  <option value="CSD">CSD</option>
                  <option value="ECE">ECE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                </select>
              )}
              <select name="gender" className="input" onChange={handleChange} value={formData.gender} required>
                <option value="" disabled>Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <button type="submit" disabled={otpLoading}>
                {otpLoading ? "Sending OTP..." : "Send Verification OTP"}
              </button>
              <p onClick={switchToLogin} className="toggle-auth">Already have an account? Login</p>
            </form>
          )}

          {/* SIGNUP STEP 2: enter OTP */}
          {!isLoggedIn && signupStep === "otp" && (
            <form onSubmit={handleVerifyAndRegister}>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1rem", textAlign: "center" }}>
                Enter the 6-digit code sent to <strong>{formData.email}</strong>
              </p>
              <input
                type="text"
                placeholder="Enter OTP"
                className="input"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                style={{ letterSpacing: "0.4rem", fontSize: "1.4rem", textAlign: "center" }}
                required
              />
              <button type="submit" disabled={otpLoading}>
                {otpLoading ? "Verifying..." : "Verify & Create Account"}
              </button>
              <p
                onClick={handleSendOtp}
                className="toggle-auth"
                style={{ cursor: otpLoading ? "not-allowed" : "pointer" }}
              >
                Didn't receive it? Resend OTP
              </p>
              <p onClick={() => { setSignupStep("form"); setError(""); setInfo(""); }} className="toggle-auth">
                ← Back to signup form
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthLogin;
