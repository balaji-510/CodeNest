import { useState } from "react";
import "../styles1/Login.css";
import { useNavigate } from "react-router-dom";
// import { flushSync } from "react-dom"; // Removed unused import
import { login, register } from "../services/api";

function AuthLogin() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [selectedRole, setSelectedRole] = useState("student");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "", // Keep email for registration if needed, but for login we use username
    password: "",
    teacherCode: "",
    branch: "CSE", // Default branch
  });

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      if (isLoggedIn) {
        // Login Logic
        const response = await login(formData.username, formData.password);

        // Use the role from the backend response (which is now in localStorage too, but let's use the one from response for immediate check if available, or just check localStorage)
        // actually api.login returns response.data
        const role = response.role || localStorage.getItem('userRole');

        console.log(`Logged in as ${role}`);

        if (role === "teacher") {
          navigate("/mentor-dashboard");
        } else {
          navigate(`/dashboard/${formData.username}`);
        }
      } else {
        // Register Logic
        const registerData = {
          username: formData.username,
          password: formData.password,
          email: formData.email,
          first_name: formData.firstname,
          last_name: formData.lastname,
          role: selectedRole,
          teacher_code: selectedRole === 'teacher' ? formData.teacherCode : "",
          branch: selectedRole === 'student' ? formData.branch : "CSE"
        };

        await register(registerData);
        alert("Registration successful! Please login.");
        setIsLoggedIn(true);
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        // specific error from backend
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          // Handle object errors (e.g. {username: ["A user with that username already exists."]})
          const messages = Object.values(errorData).flat().join(" ");
          setError(messages || "Registration failed. Please try again.");
        } else {
          setError(typeof errorData === 'string' ? errorData : "An error occurred.");
        }
      } else {
        setError("Invalid credentials or server error");
      }
    }
  }

  return (
    <div className="loginpage animate-fade-in">
      <div className="left">
        <div className="titlebox">
          <p className="login-title">
            Code<span>Nest</span>
          </p>
          <p className="login-subtitle">
            Your Gateway to Coding Excellence
          </p>
        </div>
      </div>
      <div className="right">
        <div className="loginbox">
          <h2>{isLoggedIn ? "Welcome Back" : "Create your Codenest account"}</h2>

          {/* Role Selection */}
          <div className="role-selector">
            <button
              type="button"
              className={`role-btn ${selectedRole === 'student' ? 'active' : ''}`}
              onClick={() => setSelectedRole('student')}
            >
              Student
            </button>
            <button
              type="button"
              className={`role-btn ${selectedRole === 'teacher' ? 'active' : ''}`}
              onClick={() => setSelectedRole('teacher')}
            >
              Teacher
            </button>
          </div>


          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            {!isLoggedIn && (
              <>
                <input
                  type="text"
                  placeholder="First Name"
                  className="input"
                  name="firstname"
                  onChange={handleChange}
                  value={formData.firstname}
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="input"
                  name="lastname"
                  onChange={handleChange}
                  value={formData.lastname}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  className="input"
                  onChange={handleChange}
                  value={formData.email}
                  required
                />
                {selectedRole === 'teacher' && (
                  <input
                    type="password"
                    placeholder="Teacher Registration Code"
                    name="teacherCode"
                    className="input"
                    onChange={handleChange}
                    value={formData.teacherCode}
                    required
                  />
                )}
                {selectedRole === 'student' && (
                  <select
                    name="branch"
                    className="input"
                    onChange={handleChange}
                    value={formData.branch}
                    required
                  >
                    <option value="CSE">CSE</option>
                    <option value="CSM">CSM</option>
                    <option value="CSD">CSD</option>
                    <option value="ECE">ECE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                  </select>
                )}
              </>
            )}
            <input
              type="text"
              placeholder={isLoggedIn ? "Username or Email" : "Username"}
              name="username"
              className="input"
              onChange={handleChange}
              value={formData.username}
              required
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              className="input"
              onChange={handleChange}
              value={formData.password}
              required
            />
            <button type="submit">
              {isLoggedIn ? "Login" : "Join CodeNest"}
            </button>
            <p onClick={() => setIsLoggedIn(!isLoggedIn)} className="toggle-auth">
              {isLoggedIn
                ? "Don't have an account? Sign Up"
                : "Already have an account? Login"}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
export default AuthLogin;
