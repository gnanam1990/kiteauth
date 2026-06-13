import { verifyMessage } from "viem";
import { parseMessage } from "@kiteauth/core";

export interface VerifyOptions {
  message: string;
  signature: `0x${string}`;
  expectedDomain?: string;
  expectedChainId?: number;
  /** If provided, the verifier checks that the parsed nonce is NOT in this set. */
  knownNonces?: Set<string>;
}

export interface VerifyResult {
  valid: boolean;
  address?: string;
  nonce?: string;
  reason?: string;
}

export async function verifyKiteSignature(opts: VerifyOptions): Promise<VerifyResult> {
  const parsed = parseMessage(opts.message);
  if (!parsed) return { valid: false, reason: "invalid message format" };

  const expiresAt = new Date(parsed.expirationTime).getTime();
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return { valid: false, reason: "message expired" };
  }

  if (opts.expectedDomain && parsed.domain !== opts.expectedDomain) {
    return { valid: false, reason: `domain mismatch (expected ${opts.expectedDomain}, got ${parsed.domain})` };
  }

  if (opts.expectedChainId !== undefined && parsed.chainId !== opts.expectedChainId) {
    return { valid: false, reason: `chain ID mismatch (expected ${opts.expectedChainId}, got ${parsed.chainId})` };
  }

  if (opts.knownNonces?.has(parsed.nonce)) {
    return { valid: false, reason: "nonce reused" };
  }

  let valid: boolean;
  try {
    valid = await verifyMessage({
      address: parsed.address as `0x${string}`,
      message: opts.message,
      signature: opts.signature,
    });
  } catch {
    // viem throws on malformed signatures (bad length, invalid r/s/v).
    // Treat any such failure as an invalid signature rather than crashing
    // the caller — verification must always fail closed via the result object.
    return { valid: false, reason: "invalid signature" };
  }

  if (!valid) return { valid: false, reason: "invalid signature" };

  return { valid: true, address: parsed.address, nonce: parsed.nonce };
}
