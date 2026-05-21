import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "./lib/wagmi";
import { SiteHeader } from "./components/site-header";
import { SiteFooter } from "./components/site-footer";
import { LiveDemo } from "./components/live-demo";
import { CodeBlock } from "./components/code-block";
import { InstallTabs } from "./components/install-tabs";
import { PreviewBadge } from "./components/preview-badge";
import { Playground } from "./components/playground";

const queryClient = new QueryClient();

type Page = "home" | "docs" | "playground";

const FRONTEND_SNIPPET = `import { SignInWithKite, useKiteAuth } from "@kiteauth/react";

function App() {
  const { user, login } = useKiteAuth();
  if (user) return <p>Hi {user.address.slice(0, 6)}…</p>;
  return (
    <SignInWithKite
      onSignIn={(r) =>
        login({ ...r, expiresAt: Date.now() + 10 * 60 * 1000 })
      }
    />
  );
}`;

const BACKEND_SNIPPET = `import { verifyKiteSignature } from "@kiteauth/verify";

const result = await verifyKiteSignature({
  message,             // the exact text the user signed
  signature,           // 0x… returned by the wallet
  expectedDomain: "kiteauth.dev",
  expectedChainId: 2366,
  knownNonces: redisSeenNonces,   // optional replay protection
});

if (result.valid) {
  // result.address is the verified Kite address
}`;

export default function App() {
  const [page, setPage] = useState<Page>("home");
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen flex flex-col">
          <SiteHeader page={page} onNavigate={setPage} />
          <main className="flex-1">
            {page === "home" && <Home />}
            {page === "docs" && <Docs />}
            {page === "playground" && <PlaygroundPage />}
          </main>
          <SiteFooter />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function Home() {
  return (
    <>
      <section className="kite-gradient border-b border-kite-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <p className="text-xs font-bold tracking-widest uppercase text-kite-primary mb-4">
            v0.1 · Sign-in-with-Kite
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-kite-fg max-w-3xl leading-[1.05]">
            Sign in with Kite.
          </h1>
          <p className="mt-5 text-lg text-kite-fg/70 max-w-2xl">
            One-line auth for any Kite-native app. Stateless, signature-based, no servers required.
            Like Sign-in-with-Ethereum, but warm.
          </p>
          <div className="mt-10 max-w-md">
            <LiveDemo />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { n: "1", t: "Connect wallet", d: "User clicks the button — wagmi opens whatever connector you've configured." },
            { n: "2", t: "Sign message", d: "We build an EIP-4361-style message and ask the wallet to sign it. No server roundtrip." },
            { n: "3", t: "Verify signature", d: "Your backend (or middleware) calls verifyKiteSignature to confirm address + freshness." },
          ].map((s) => (
            <div key={s.n} className="rounded-xl border border-kite-border bg-kite-card p-6">
              <span className="text-xs font-mono text-kite-primary">step {s.n}</span>
              <h3 className="mt-2 text-lg font-semibold text-kite-fg">{s.t}</h3>
              <p className="mt-2 text-sm text-kite-fg/65">{s.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-kite-border bg-kite-muted p-5 text-sm text-kite-fg/75">
          <p className="font-semibold text-kite-fg mb-2">Honest scope</p>
          <p>
            v0.1 ships frontend + verifier. <PreviewBadge /> AgentScore tier on sign-in, kpass session
            integration, ERC-1271 smart-wallet support, and OAuth-style scopes are planned for v0.2.
          </p>
        </div>
      </section>
    </>
  );
}

function Docs() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-kite-fg">Integration guide</h1>
        <p className="mt-2 text-sm text-kite-fg/65">
          Three packages, fully MIT-licensed, no API keys.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-kite-fg">1. Install</h2>
        <InstallTabs pkg="@kiteauth/react" />
        <p className="text-xs text-kite-fg/55">
          The verifier is a separate package — install <code className="font-mono">@kiteauth/verify</code> on
          the backend only.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-kite-fg">2. Frontend</h2>
        <p className="text-sm text-kite-fg/65">
          Wrap your app in <code className="font-mono">WagmiProvider</code>, then drop the button anywhere.
        </p>
        <CodeBlock code={FRONTEND_SNIPPET} language="tsx" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-kite-fg">3. Backend</h2>
        <p className="text-sm text-kite-fg/65">
          Verify the signed message anywhere Node/Edge runs. The verifier is stateless — nonce tracking is
          up to you (Redis recommended).
        </p>
        <CodeBlock code={BACKEND_SNIPPET} language="ts" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-kite-fg">Message format</h2>
        <p className="text-sm text-kite-fg/65">
          Identical structure to EIP-4361, with chain ID 2366 (Kite Mainnet).
        </p>
        <CodeBlock
          language="text"
          code={`kiteauth.dev wants you to sign in with your Kite account:

0xc82C2ADE9BbacF01C2168756Ce66E88F69676967

I accept the KiteAuth Terms of Service

URI: https://kiteauth.dev
Version: 1
Chain ID: 2366
Nonce: abc123def456
Issued At: 2026-05-21T12:34:56.789Z
Expiration Time: 2026-05-21T12:44:56.789Z`}
        />
      </section>
    </div>
  );
}

function PlaygroundPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-kite-fg">Verifier playground</h1>
        <p className="mt-2 text-sm text-kite-fg/65">
          Paste a KiteAuth message and its signature to confirm the signer.
        </p>
      </div>
      <Playground />
    </div>
  );
}
