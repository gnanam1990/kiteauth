import { useState } from "react";
import { verifyKiteSignature, type VerifyResult } from "@kiteauth/verify";

export function Playground() {
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [busy, setBusy] = useState(false);

  async function verify() {
    setBusy(true);
    setResult(null);
    try {
      const r = await verifyKiteSignature({
        message,
        signature: signature as `0x${string}`,
      });
      setResult(r);
    } catch (e) {
      setResult({ valid: false, reason: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-kite-fg/60 mb-1.5">
          Signed message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={10}
          placeholder="kiteauth.dev wants you to sign in with your Kite account: ..."
          className="w-full px-3 py-2 rounded-md border border-kite-border bg-kite-card font-mono text-xs focus:outline-none focus:border-kite-primary"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-kite-fg/60 mb-1.5">
          Signature (0x…)
        </label>
        <input
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="0x…"
          className="w-full px-3 py-2 rounded-md border border-kite-border bg-kite-card font-mono text-xs focus:outline-none focus:border-kite-primary"
        />
      </div>
      <button
        onClick={verify}
        disabled={busy || !message || !signature}
        className="px-5 py-2 rounded-md bg-kite-primary text-white font-medium hover:bg-[#8a755a] disabled:opacity-50 transition-colors"
      >
        {busy ? "Verifying…" : "Verify"}
      </button>
      {result && (
        <div
          className={`rounded-md border p-4 ${
            result.valid
              ? "border-kite-accent/50 bg-kite-accent/5 text-kite-accent"
              : "border-kite-destructive/50 bg-kite-destructive/5 text-kite-destructive"
          }`}
        >
          <p className="font-semibold mb-1">{result.valid ? "✓ Valid" : "✗ Invalid"}</p>
          {result.address && <p className="text-xs font-mono">address: {result.address}</p>}
          {result.nonce && <p className="text-xs font-mono">nonce: {result.nonce}</p>}
          {result.reason && <p className="text-xs font-mono">reason: {result.reason}</p>}
        </div>
      )}
    </div>
  );
}
