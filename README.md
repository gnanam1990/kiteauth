# KiteAuth

> Sign-in-with-Kite — an EIP-4361-style ("Sign-In with Ethereum"-inspired) message-signing auth flow for Kite-native apps.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg)

## Overview

KiteAuth lets a user prove control of a Kite wallet address by signing a structured,
human-readable message — no passwords and no central auth server required to *prove*
identity. A client builds a one-time message (domain, address, nonce, expiry), the
wallet signs it, and a server-side verifier recovers the signer and checks the
constraints. The signature itself is the credential, so verification can run anywhere
viem runs (Node or edge runtimes). It is aimed at developers building apps on the Kite
network who want wallet-based sign-in.

The message format is modeled on EIP-4361 but is a KiteAuth-specific variant
("…wants you to sign in with your Kite account"), not a drop-in SIWE implementation.

## Features

- Framework-agnostic message builder and parser (`buildMessage` / `parseMessage`).
- Cryptographically secure nonce generation via the Web Crypto API.
- A React `<SignInWithKite>` button that connects an injected wallet and requests a signature.
- A `useKiteAuth()` hook for reading/writing a local session.
- A server-side verifier that recovers the signer, enforces expiry, and optionally
  checks the expected domain, chain ID, and nonce reuse — failing closed on any error.
- A Vite demo app showing the full flow.

## Tech stack

- **Language:** TypeScript (ESM + CJS builds via tsup)
- **Crypto / chain:** [viem](https://viem.sh) for signature verification and chain definitions
- **Frontend:** React 19, [wagmi](https://wagmi.sh) (injected connector), Vite, Tailwind CSS v4
- **Tooling:** pnpm workspaces, Vitest

## Architecture

This is a pnpm monorepo with three publishable packages and one demo app.

| Package | Purpose |
|---------|---------|
| [`@kiteauth/core`](./packages/core) | Framework-agnostic primitives: `buildMessage`, `parseMessage`, `generateNonce`, and the `KiteAuthMessage` type. No runtime dependencies. |
| [`@kiteauth/react`](./packages/react) | `<SignInWithKite>` button (uses wagmi to connect + sign) and the `useKiteAuth()` session hook. |
| [`@kiteauth/verify`](./packages/verify) | `verifyKiteSignature()` — the server-side trust boundary. Parses the message, checks expiry/domain/chain ID/nonce, and recovers the signer with viem. |
| [`apps/demo`](./apps/demo) | Vite + React reference app demonstrating sign-in end to end. |

Flow: `@kiteauth/react` builds and signs a message (via `@kiteauth/core`) in the
browser, then hands the message + signature to your server, which calls
`@kiteauth/verify` to confirm the signer.

## Getting started

### Prerequisites

- Node.js 18+
- pnpm 9 (the repo pins `pnpm@9.12.0` via `packageManager`)

### Installation

```bash
pnpm install
```

### Configuration

The packages and demo read no environment variables — there is nothing to configure
to run locally. The demo's chain settings (Kite Mainnet, chain ID `2366`, and Kite
Testnet, chain ID `2368`) are defined in code at `apps/demo/src/lib/kite-chain.ts`.

### Running

```bash
pnpm build          # build all packages (packages/*)
pnpm dev            # run the demo app at http://localhost:3000
```

`pnpm dev` runs `vite` for `apps/demo`. The demo consumes the packages via the
workspace, so run `pnpm build` first (or rely on the demo's own bundling) when
iterating on package output.

## Usage

### Frontend (React)

```tsx
import { SignInWithKite, useKiteAuth } from "@kiteauth/react";

function App() {
  const { user, login, logout } = useKiteAuth();

  if (user) {
    return (
      <>
        <p>Signed in as {user.address.slice(0, 6)}…</p>
        <button onClick={logout}>Sign out</button>
      </>
    );
  }

  return (
    <SignInWithKite
      // domain/uri default to window.location; chainId defaults to 2366
      onSignIn={(r) =>
        login({ ...r, expiresAt: Date.now() + 10 * 60 * 1000 })
      }
      onError={(e) => console.error(e)}
    />
  );
}
```

Wrap your app in a wagmi `WagmiProvider` (and a TanStack Query `QueryClientProvider`)
so the button can connect to an injected wallet and request a signature. See
`apps/demo/src/lib/wagmi.ts` for a working config.

### Backend (verification)

```ts
import { verifyKiteSignature } from "@kiteauth/verify";

// `message` and `signature` come from the client (the SignInResult).
const result = await verifyKiteSignature({
  message,
  signature,
  expectedDomain: "kiteauth.dev", // optional
  expectedChainId: 2366,          // optional
  // knownNonces: mySeenNonceSet,  // optional replay protection
});

if (result.valid) {
  // result.address is the verified signer; result.nonce is the message nonce.
} else {
  // result.reason explains why (e.g. "message expired", "invalid signature").
}
```

`verifyKiteSignature` never throws on bad input — malformed signatures and
unparseable messages return `{ valid: false, reason }`.

### Core (framework-agnostic)

```ts
import { buildMessage, parseMessage, generateNonce } from "@kiteauth/core";

const message = buildMessage({
  domain: "kiteauth.dev",
  address: "0x…",
  statement: "I accept the KiteAuth Terms of Service",
  uri: "https://kiteauth.dev",
  version: "1",
  chainId: 2366,
  nonce: generateNonce(),
  issuedAt: new Date().toISOString(),
  expirationTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
});
```

### Message format

```
kiteauth.dev wants you to sign in with your Kite account:

0xc82C2ADE9BbacF01C2168756Ce66E88F69676967

I accept the KiteAuth Terms of Service

URI: https://kiteauth.dev
Version: 1
Chain ID: 2366
Nonce: abc123def456
Issued At: 2026-05-21T12:34:56.789Z
Expiration Time: 2026-05-21T12:44:56.789Z
```

## Testing

```bash
pnpm --filter @kiteauth/verify test
```

The test suite (Vitest) lives in `@kiteauth/verify` and covers the verifier:
accepting a correctly signed fresh message, rejecting tampered/expired messages,
rejecting impersonation, enforcing the expected domain and chain ID, rejecting
reused nonces, and ensuring malformed signatures fail closed instead of throwing.

## Project structure

```
.
├── packages/
│   ├── core/       # @kiteauth/core   — message + nonce primitives
│   ├── react/      # @kiteauth/react  — <SignInWithKite> + useKiteAuth
│   └── verify/     # @kiteauth/verify — server-side verifier (+ tests)
├── apps/
│   └── demo/       # Vite + React reference app
├── pnpm-workspace.yaml
└── vercel.json     # deploys the demo (Vite) from the repo root
```

## Status

Early stage (`v0.1.0`), not yet published to a registry. The signing primitives and
the server-side verifier are real and tested.

Two honesty caveats:

- **The verifier is the trust boundary.** Only `@kiteauth/verify` cryptographically
  confirms a signer. Never trust a sign-in based on client state alone.
- **The React session is local convenience only.** `useKiteAuth()` stores the session
  in `localStorage` and only checks an `expiresAt` timestamp — it does **not**
  re-verify the signature. Treat it as UI state; gate any protected action on a
  server-side `verifyKiteSignature` call.

## License

MIT — see [LICENSE](./LICENSE).
