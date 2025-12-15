// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useNavigate } from "react-router-dom";
import { signOut } from "./authService";

function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
      .join(""),
  );
  return JSON.parse(jsonPayload);
}

const HomePage = () => {
  const navigate = useNavigate();
  const idToken = parseJwt(sessionStorage.idToken.toString());
  const accessToken = parseJwt(sessionStorage.accessToken.toString());
  console.log(
    `Amazon Cognito ID token encoded: ${sessionStorage.idToken.toString()}`,
  );
  console.log("Amazon Cognito ID token decoded: ");
  console.log(idToken);
  console.log(
    `Amazon Cognito access token encoded: ${sessionStorage.accessToken.toString()}`,
  );
  console.log("Amazon Cognito access token decoded: ");
  console.log(accessToken);
  console.log("Amazon Cognito refresh token: ");
  console.log(sessionStorage.refreshToken);
  console.log(
    "Amazon Cognito example application. Not for use in production applications.",
  );
  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const fetchUserMe = async () => {
    try {
      const accessToken = sessionStorage.getItem("accessToken");
      const response = await fetch("http://localhost:3000/users/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch user:", response.status, response.statusText);
        const errorText = await response.text();
        console.error("Error response:", errorText);
        return;
      }

      const userData = await response.json();
      console.log("User data from /users/me:", userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  return (
    <div>
      <h1>Hello World</h1>
      <p>See console log for Amazon Cognito user tokens.</p>
      <button type="button" onClick={fetchUserMe}>
        Fetch User Data
      </button>
      <button type="button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default HomePage;
