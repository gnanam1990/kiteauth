import type { KiteAuthMessage } from "./types";

export function buildMessage(m: KiteAuthMessage): string {
  const statement = m.statement ?? "";
  return `${m.domain} wants you to sign in with your Kite account:

${m.address}

${statement}

URI: ${m.uri}
Version: ${m.version}
Chain ID: ${m.chainId}
Nonce: ${m.nonce}
Issued At: ${m.issuedAt}
Expiration Time: ${m.expirationTime}`;
}

export function parseMessage(raw: string): KiteAuthMessage | null {
  const lines = raw.split("\n");
  if (lines.length < 8) return null;

  const headerMatch = lines[0].match(/^(.+?) wants you to sign in with your Kite account:$/);
  if (!headerMatch) return null;
  const domain = headerMatch[1];

  const address = lines[2]?.trim();
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) return null;

  const statement = lines[4] ?? "";

  const kv: Record<string, string> = {};
  for (let i = 5; i < lines.length; i++) {
    const line = lines[i];
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const k = line.slice(0, idx).trim();
    const v = line.slice(idx + 1).trim();
    kv[k] = v;
  }

  if (!kv["URI"] || !kv["Version"] || !kv["Chain ID"] || !kv["Nonce"] || !kv["Issued At"] || !kv["Expiration Time"]) {
    return null;
  }
  if (kv["Version"] !== "1") return null;
  const chainId = Number(kv["Chain ID"]);
  if (!Number.isFinite(chainId)) return null;

  return {
    domain,
    address,
    statement: statement || undefined,
    uri: kv["URI"],
    version: "1",
    chainId,
    nonce: kv["Nonce"],
    issuedAt: kv["Issued At"],
    expirationTime: kv["Expiration Time"],
  };
}
