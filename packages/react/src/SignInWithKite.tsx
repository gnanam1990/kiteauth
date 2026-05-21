import { useState } from "react";
import { useAccount, useSignMessage, useConnect } from "wagmi";
import { buildMessage, generateNonce, type KiteAuthMessage } from "@kiteauth/core";

export interface SignInResult {
  address: string;
  message: string;
  signature: `0x${string}`;
  nonce: string;
}

export interface SignInWithKiteProps {
  domain?: string;
  uri?: string;
  statement?: string;
  expirationSeconds?: number;
  chainId?: number;
  onSignIn: (result: SignInResult) => void;
  onError?: (error: Error) => void;
  className?: string;
  children?: React.ReactNode;
}

export function SignInWithKite({
  domain,
  uri,
  statement = "I accept the KiteAuth Terms of Service",
  expirationSeconds = 600,
  chainId = 2366,
  onSignIn,
  onError,
  className,
  children,
}: SignInWithKiteProps) {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { signMessageAsync } = useSignMessage();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      if (!isConnected) {
        if (!connectors[0]) throw new Error("No wallet connector available");
        connect({ connector: connectors[0] });
        return;
      }
      if (!address) throw new Error("Wallet address unavailable");

      const nonce = generateNonce();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + expirationSeconds * 1000);
      const msg: KiteAuthMessage = {
        domain: domain ?? (typeof window !== "undefined" ? window.location.host : "localhost"),
        address,
        statement,
        uri: uri ?? (typeof window !== "undefined" ? window.location.origin : "http://localhost"),
        version: "1",
        chainId,
        nonce,
        issuedAt: now.toISOString(),
        expirationTime: expiresAt.toISOString(),
      };
      const message = buildMessage(msg);
      const signature = await signMessageAsync({ message });
      onSignIn({ address, message, signature, nonce });
    } catch (e) {
      onError?.(e as Error);
    } finally {
      setBusy(false);
    }
  }

  const defaultClasses =
    "px-6 py-3 rounded-md bg-[#9B8564] text-white font-medium hover:bg-[#8a755a] disabled:opacity-50 transition-colors";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={className ?? defaultClasses}
    >
      {children ?? (busy ? "Signing…" : isConnected ? "Sign in with Kite" : "Connect & Sign in")}
    </button>
  );
}
