import {
  isSquareConfigured,
  squareApplicationIdDiagnostics,
  squareApplicationSecretDiagnostics,
  squareCredentialMismatchMessage,
  squareCredentialsMatchEnvironment,
  squareEnvironment,
  squareOAuthRedirectUri,
  squareSetupHints,
} from "./config";

export type SquareSetupDiagnostics = {
  configured: boolean;
  environment: "sandbox" | "production";
  redirectUri: string;
  applicationId: ReturnType<typeof squareApplicationIdDiagnostics>;
  applicationSecret: Pick<
    ReturnType<typeof squareApplicationSecretDiagnostics>,
    "configured" | "looksLikeOAuthSecret" | "looksLikeAccessToken"
  >;
  credentialsMatchEnvironment: boolean;
  credentialMismatch: string | null;
  issues: string[];
  readyToConnect: boolean;
};

export function getSquareSetupDiagnostics(): SquareSetupDiagnostics {
  const applicationId = squareApplicationIdDiagnostics();
  const applicationSecret = squareApplicationSecretDiagnostics();
  const credentialsMatchEnvironment = squareCredentialsMatchEnvironment();
  const credentialMismatch = squareCredentialMismatchMessage();
  const issues: string[] = [];

  if (!isSquareConfigured()) {
    issues.push("Square application credentials are missing in Vercel.");
  }

  if (!credentialsMatchEnvironment && credentialMismatch) {
    issues.push(credentialMismatch);
  }

  if (applicationSecret.configured && !applicationSecret.looksLikeOAuthSecret) {
    if (applicationSecret.looksLikeAccessToken) {
      issues.push(
        "SQUARE_APPLICATION_SECRET looks like an access token. Use the OAuth Application secret from Square → OAuth."
      );
    } else {
      issues.push(
        "SQUARE_APPLICATION_SECRET does not look like a Square OAuth Application secret."
      );
    }
  }

  const redirectUri = squareOAuthRedirectUri();
  const setupHints = squareSetupHints();

  if (!process.env.SQUARE_OAUTH_STATE_SECRET?.trim() && !process.env.JWT_SECRET?.trim()) {
    issues.push(
      "Set SQUARE_OAUTH_STATE_SECRET in Vercel so Square OAuth callbacks can be verified reliably."
    );
  }

  return {
    configured: isSquareConfigured(),
    environment: squareEnvironment(),
    redirectUri,
    applicationId,
    applicationSecret: {
      configured: applicationSecret.configured,
      looksLikeOAuthSecret: applicationSecret.looksLikeOAuthSecret,
      looksLikeAccessToken: applicationSecret.looksLikeAccessToken,
    },
    credentialsMatchEnvironment,
    credentialMismatch,
    issues: [...new Set([...issues, ...setupHints])],
    readyToConnect:
      isSquareConfigured() &&
      credentialsMatchEnvironment &&
      applicationSecret.looksLikeOAuthSecret,
  };
}
