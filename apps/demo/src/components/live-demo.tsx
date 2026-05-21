import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { SignInWithKite, useKiteAuth, type SignInResult } from "@kiteauth/react";
import { Check, LogOut } from "lucide-react";

export function LiveDemo() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { user, login, logout } = useKiteAuth();
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<SignInResult | null>(null);

  function handleSignIn(result: SignInResult) {
    setError(null);
    setLastResult(result);
    const expiresAt = Date.now() + 10 * 60 * 1000;
    login({ ...result, expiresAt });
  }

  if (user) {
    return (
      <div className="rounded-xl border border-kite-border bg-kite-card p-6">
        <div className="flex items-center gap-2 text-kite-accent mb-3">
          <Check className="w-5 h-5" />
          <span className="font-semibold">Signed in with Kite</span>
        </div>
        <div className="space-y-2 text-sm font-mono">
          <div>
            <span className="text-kite-fg/50">address:</span>{" "}
            <span className="text-kite-fg">{user.address}</span>
          </div>
          <div>
            <span className="text-kite-fg/50">nonce:</span>{" "}
            <span className="text-kite-fg">{user.nonce}</span>
          </div>
          <div>
            <span className="text-kite-fg/50">signature:</span>{" "}
            <span className="text-kite-fg break-all">{user.signature.slice(0, 24)}…</span>
          </div>
          <div>
            <span className="text-kite-fg/50">expires:</span>{" "}
            <span className="text-kite-fg">{new Date(user.expiresAt).toLocaleString()}</span>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            disconnect();
            setLastResult(null);
          }}
          className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-kite-fg/70 hover:text-kite-destructive transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-kite-border bg-kite-card p-6 space-y-4">
      <SignInWithKite onSignIn={handleSignIn} onError={(e) => setError(e.message)} />
      {address && (
        <p className="text-xs text-kite-fg/60 font-mono">
          Wallet connected: {address.slice(0, 6)}…{address.slice(-4)} — click again to sign.
        </p>
      )}
      {error && (
        <p className="text-xs text-kite-destructive font-mono">error: {error}</p>
      )}
      {lastResult && !user && (
        <p className="text-xs text-kite-fg/60 font-mono">last nonce: {lastResult.nonce}</p>
      )}
    </div>
  );
}
