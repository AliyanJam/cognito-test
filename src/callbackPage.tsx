// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { handleOAuthCallback } from "./authService";

const CallbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasProcessed.current) return;

    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");
    const errorDescription = urlParams.get("error_description");

    // Handle OAuth errors
    if (error) {
      console.error("OAuth error:", error, errorDescription);
      alert(`Authentication failed: ${errorDescription || error}`);
      navigate("/login", { replace: true });
      return;
    }

    // Skip if no code in URL
    if (!code) {
      navigate("/login", { replace: true });
      return;
    }

    // Skip if already authenticated (tokens exist) and we've already processed
    const existingAccessToken = sessionStorage.getItem("accessToken");
    if (existingAccessToken) {
      navigate("/home", { replace: true });
      return;
    }

    hasProcessed.current = true;

    handleOAuthCallback(code)
      .then(() => {
        // Verify tokens are actually stored before navigating
        const accessToken = sessionStorage.getItem("accessToken");
        if (accessToken) {
          // Use window.location.href to force a full page reload
          // This ensures App.tsx re-evaluates isAuthenticated() with new tokens
          window.location.href = "/home";
        } else {
          throw new Error("Tokens were not stored properly");
        }
      })
      .catch((error) => {
        console.error("Authentication failed:", error);
        hasProcessed.current = false;
        alert("Authentication failed. Please try again.");
        navigate("/login", { replace: true });
      });
  }, [location.search, navigate]);

  return (
    <div>
      <h2>Processing authentication...</h2>
      <p>Please wait while we complete your sign-in.</p>
    </div>
  );
};

export default CallbackPage;
