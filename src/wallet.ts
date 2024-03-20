import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

export function genKeypair(secretKey: string) {
  if (secretKey == null || secretKey.length == 0) {
    throw new Error("Wallet error: The hexadecimal string should have an even length\n");
  }
  if (secretKey.length % 2 !== 0) {
    throw new Error("Wallet error: The hexadecimal string should have an even length\n");
  }

  const u8arr = new Uint8Array(secretKey.length / 2);

  for (let i = 0; i < secretKey.length; i += 2) {
    const byteValue = parseInt(secretKey.substring(i, i + 2), 16);
    if (isNaN(byteValue)) {
      throw new Error(`Wallet error: The hexadecimal string contains illegal characters: ${secretKey.substring(i, i + 2)}`);
    }
    u8arr[i / 2] = byteValue;
  }
  return Ed25519Keypair.fromSecretKey(u8arr);
}