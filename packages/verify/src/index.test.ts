import { describe, it, expect } from "vitest";
import { privateKeyToAccount } from "viem/accounts";
import { buildMessage } from "@kiteauth/core";
import { verifyKiteSignature } from "./index";

// Deterministic well-known test key (Hardhat account #1). Never used for real funds.
const account = privateKeyToAccount(
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
);

const iso = (offsetMs = 0) => new Date(Date.now() + offsetMs).toISOString();

function makeMessage(overrides: Partial<Parameters<typeof buildMessage>[0]> = {}) {
  return buildMessage({
    domain: "kiteauth.dev",
    address: account.address,
    statement: "I accept the KiteAuth Terms of Service",
    uri: "https://kiteauth.dev",
    version: "1",
    chainId: 2366,
    nonce: "abc123def456",
    issuedAt: iso(),
    expirationTime: iso(10 * 60 * 1000),
    ...overrides,
  });
}

describe("verifyKiteSignature", () => {
  it("accepts a correctly signed, fresh message", async () => {
    const message = makeMessage();
    const signature = await account.signMessage({ message });
    const r = await verifyKiteSignature({
      message,
      signature,
      expectedDomain: "kiteauth.dev",
      expectedChainId: 2366,
    });
    expect(r.valid).toBe(true);
    expect(r.address?.toLowerCase()).toBe(account.address.toLowerCase());
  });

  it("rejects a tampered message (signature no longer matches)", async () => {
    const message = makeMessage();
    const signature = await account.signMessage({ message });
    const tampered = message.replace(/Expiration Time: .*/, `Expiration Time: ${iso(60 * 60 * 1000)}`);
    const r = await verifyKiteSignature({ message: tampered, signature });
    expect(r.valid).toBe(false);
    expect(r.reason).toBe("invalid signature");
  });

  it("rejects an expired message", async () => {
    const message = makeMessage({
      issuedAt: iso(-20 * 60 * 1000),
      expirationTime: iso(-10 * 60 * 1000),
    });
    const signature = await account.signMessage({ message });
    const r = await verifyKiteSignature({ message, signature });
    expect(r.valid).toBe(false);
    expect(r.reason).toBe("message expired");
  });

  it("rejects a signature produced by a different account (no impersonation)", async () => {
    const attacker = privateKeyToAccount(
      "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
    );
    const message = makeMessage(); // claims `account` as the address
    const attackerSig = await attacker.signMessage({ message });
    const r = await verifyKiteSignature({ message, signature: attackerSig });
    expect(r.valid).toBe(false);
    expect(r.reason).toBe("invalid signature");
  });

  it("enforces the expected domain", async () => {
    const message = makeMessage({ domain: "evil.kiteauth.dev" });
    const signature = await account.signMessage({ message });
    const r = await verifyKiteSignature({ message, signature, expectedDomain: "kiteauth.dev" });
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(/domain mismatch/);
  });

  it("enforces the expected chain id", async () => {
    const message = makeMessage({ chainId: 1 });
    const signature = await account.signMessage({ message });
    const r = await verifyKiteSignature({ message, signature, expectedChainId: 2366 });
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(/chain ID mismatch/);
  });

  it("rejects reused nonces when knownNonces is supplied", async () => {
    const message = makeMessage({ nonce: "seen-before" });
    const signature = await account.signMessage({ message });
    const r = await verifyKiteSignature({
      message,
      signature,
      knownNonces: new Set(["seen-before"]),
    });
    expect(r.valid).toBe(false);
    expect(r.reason).toBe("nonce reused");
  });

  // Regression: malformed signatures must fail closed via the result object,
  // never throw (which would crash the documented backend integration / be a DoS).
  it.each(["0x", "0x00", "0xdeadbeef", `0x${"00".repeat(65)}`, `0x${"ff".repeat(65)}`, "not-hex"])(
    "returns valid:false (does not throw) for malformed signature %s",
    async (badSig) => {
      const message = makeMessage();
      const r = await verifyKiteSignature({ message, signature: badSig as `0x${string}` });
      expect(r.valid).toBe(false);
      expect(r.reason).toBe("invalid signature");
    },
  );

  it("rejects a message that does not parse", async () => {
    const r = await verifyKiteSignature({
      message: "not a kiteauth message",
      signature: "0xdeadbeef" as `0x${string}`,
    });
    expect(r.valid).toBe(false);
    expect(r.reason).toBe("invalid message format");
  });
});
