// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword, confirmForgotPassword } from "./authService";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setCodeSent(true);
      alert("Password reset code sent to your email");
    } catch (error) {
      alert(`Failed to send reset code: ${error}`);
    }
  };

  const handleResetPassword = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      await confirmForgotPassword(email, code, newPassword);
      alert("Password reset successfully! Please sign in with your new password.");
      navigate("/login");
    } catch (error) {
      alert(`Failed to reset password: ${error}`);
    }
  };

  return (
    <div className="loginForm">
      <h1>Reset Password</h1>
      {!codeSent ? (
        <>
          <h4>Enter your email to receive a password reset code</h4>
          <form onSubmit={handleSendCode}>
            <div>
              <input
                className="inputText"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </div>
            <button type="submit">Send Reset Code</button>
          </form>
          <button type="button" onClick={() => navigate("/login")}>
            Back to Sign In
          </button>
        </>
      ) : (
        <>
          <h4>Enter the code sent to your email and your new password</h4>
          <form onSubmit={handleResetPassword}>
            <div>
              <input
                className="inputText"
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Verification Code"
                required
              />
            </div>
            <div>
              <input
                className="inputText"
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                required
              />
            </div>
            <div>
              <input
                className="inputText"
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                required
              />
            </div>
            <button type="submit">Reset Password</button>
          </form>
          <button type="button" onClick={() => setCodeSent(false)}>
            Resend Code
          </button>
        </>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
