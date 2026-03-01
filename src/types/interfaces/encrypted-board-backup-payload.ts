export interface EncryptedBoardBackupPayload {
  v: 1;
  alg: "AES-GCM";
  iv: string;
  data: string;
}
