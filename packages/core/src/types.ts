export interface KiteAuthMessage {
  domain: string;
  address: string;
  statement?: string;
  uri: string;
  version: "1";
  chainId: number;
  nonce: string;
  issuedAt: string;
  expirationTime: string;
}
