import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import bgImage from "../../../assets/images/Authentification.jpg";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const allowedEmails = [
    "maroua.bouain@skema.edu",
    "samira.moosavi@skema.edu",
    "steve.ataky@skema.edu",
    "cheikh.diokhane@skema.edu",
    "ouarda.ramdani@skema.edu",
    "latifa.idizi@skema.edu",
    "houleye.sowgosset@skema.edu",
    "celine.gobeill@skema.edu",
  ];

  const TEMP_PASSWORD = "Skema@2025!";

  const isValidSkemaEmail = (email) => {
    const regex = /^[a-zA-Z]+\.[a-zA-Z]+@skema\.edu$/;
    return regex.test(email);
  };

  const handleLogin = () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    if (!isValidSkemaEmail(email)) {
      setError("Email not allowed. Use firstname.lastname@skema.edu format.");
      return;
    }

    if (!allowedEmails.includes(email.toLowerCase())) {
      setError("Access denied. Please contact the administration to add you.");
      return;
    }

    if (password !== TEMP_PASSWORD) {
      setError("Incorrect password. Please use the temporary password provided.");
      return;
    }

    localStorage.setItem("authToken", "your-token");
    navigate("/hr");
  };

  return (
    <div
      className={styles.loginPage}
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className={styles.overlay}>
        <div className={styles.glassBox}>
          <div className={styles.leftGif}>
            <img
              src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjIweWFucWc5cWNhMm0zNXZobWxwdWlteGg1dzBwNWE3OWtnaTBpYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/tsYCcXey7FNqsxMgk3/giphy.gif"
              alt="AI animation"
            />
          </div>
          <div className={styles.rightForm}>
            <h2 className={styles.title}>
              OraculumHR awaits ...<br />
              Ready when you are 🚀
            </h2>

            <div className={styles.inputWrapper}>
              <input
                type="email"
                placeholder="Enter Email"
                className={styles.input}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
              />
            </div>

            <div className={styles.inputWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className={styles.eyeIcon}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button className={styles.button} onClick={handleLogin}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
