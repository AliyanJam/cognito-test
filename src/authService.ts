// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  type InitiateAuthCommandInput,
  type SignUpCommandInput,
  type ConfirmSignUpCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import config from "./config.json";

export const cognitoClient = new CognitoIdentityProviderClient({
  region: config.region,
});

export const signIn = async (username: string, password: string) => {
  const params: InitiateAuthCommandInput = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: config.clientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  };
  try {
    const command = new InitiateAuthCommand(params);
    const { AuthenticationResult } = await cognitoClient.send(command);
    if (AuthenticationResult) {
      sessionStorage.setItem("idToken", AuthenticationResult.IdToken || "");
      sessionStorage.setItem(
        "accessToken",
        AuthenticationResult.AccessToken || ""
      );
      sessionStorage.setItem(
        "refreshToken",
        AuthenticationResult.RefreshToken || ""
      );
      return AuthenticationResult;
    }
  } catch (error) {
    console.error("Error signing in: ", error);
    throw error;
  }
};

export const signUp = async (email: string, password: string) => {
  const params: SignUpCommandInput = {
    ClientId: config.clientId,
    Username: email,
    Password: password,
    UserAttributes: [
      {
        Name: "email",
        Value: email,
      },
    ],
  };
  try {
    const command = new SignUpCommand(params);
    const response = await cognitoClient.send(command);
    console.log("Sign up success: ", response);
    return response;
  } catch (error) {
    console.error("Error signing up: ", error);
    throw error;
  }
};

export const confirmSignUp = async (username: string, code: string) => {
  const params: ConfirmSignUpCommandInput = {
    ClientId: config.clientId,
    Username: username,
    ConfirmationCode: code,
  };
  try {
    const command = new ConfirmSignUpCommand(params);
    await cognitoClient.send(command);
    console.log("User confirmed successfully");
    return true;
  } catch (error) {
    console.error("Error confirming sign up: ", error);
    throw error;
  }
};

export const signInWithGoogle = () => {
  const cognitoAuthUrl = `https://${config.cognitoDomain}/oauth2/authorize`;
  const params = new URLSearchParams({
    identity_provider: "Google",
    redirect_uri: config.redirectSignIn,
    response_type: "code",
    client_id: config.clientId,
    scope: "openid",
  });
  window.location.href = `${cognitoAuthUrl}?${params.toString()}`;
};

export const handleOAuthCallback = async (code: string) => {
  const cognitoTokenUrl = `https://${config.cognitoDomain}/oauth2/token`;

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.clientId,
    code: code,
    redirect_uri: config.redirectSignIn,
  });

  try {
    const response = await fetch(cognitoTokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Token exchange failed:", errorData);
      throw new Error(errorData.error || "Failed to exchange code for tokens");
    }

    const tokens = await response.json();

    sessionStorage.setItem("idToken", tokens.id_token || "");
    sessionStorage.setItem("accessToken", tokens.access_token || "");
    sessionStorage.setItem("refreshToken", tokens.refresh_token || "");

    return tokens;
  } catch (error) {
    console.error("Error exchanging code for tokens: ", error);
    throw error;
  }
};

export const signOut = async () => {
  const refreshToken = sessionStorage.getItem("refreshToken");

  // Revoke tokens on Cognito if refresh token exists
  if (refreshToken) {
    const cognitoRevokeUrl = `https://${config.cognitoDomain}/oauth2/revoke`;

    const params = new URLSearchParams({
      token: refreshToken,
      client_id: config.clientId,
    });

    try {
      const response = await fetch(cognitoRevokeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        console.error("Token revocation failed, but continuing with local logout");
      }
    } catch (error) {
      console.error("Error revoking token:", error);
      // Continue with local logout even if revocation fails
    }
  }

  // Clear local storage
  sessionStorage.clear();
};
