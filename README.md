# KiteAuth

Sign-in-with-Kite — EIP-4361-style auth for Kite-native apps. Stateless, signature-based, no servers required.

Live demo: deploy from `apps/demo`.

## Packages

| Package | Purpose |
|--------|---------|
| [`@kiteauth/core`](./packages/core) | Framework-agnostic message + nonce primitives |
| [`@kiteauth/react`](./packages/react) | `<SignInWithKite>` button + `useKiteAuth()` hook |
| [`@kiteauth/verify`](./packages/verify) | Server-side signature verifier (Node / Edge) |

## Quick start

```bash
pnpm install
pnpm build
pnpm dev          # opens the demo at http://localhost:3000
```

### Frontend

```tsx
import { SignInWithKite, useKiteAuth } from "@kiteauth/react";

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
}
```

Wrap your app in a `WagmiProvider` so the button can talk to the wallet.

### Backend

```ts
import { verifyKiteSignature } from "@kiteauth/verify";

const result = await verifyKiteSignature({
  message,
  signature,
  expectedDomain: "kiteauth.dev",
  expectedChainId: 2366,
});

if (result.valid) {
  // result.address is verified
}
```

## Message format

EIP-4361 inspired, adapted for Kite (Chain ID 2366):

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

## Scope

| In v0.1 | Planned v0.2 |
|---------|--------------|
| Wallet sign-in + verify | AgentScore tier on sign-in |
| Local-only session | kpass session integration |
| EOA signatures | ERC-1271 smart wallet support |
| | OAuth-style scopes |
| | Express / Hono / Next middleware helpers |

## License

MIT
