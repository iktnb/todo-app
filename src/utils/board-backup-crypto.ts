import { BOARD_BACKUP_PREFIX } from '../constants/storage'
import type { EncryptedBoardBackupPayload } from '../types/interfaces/encrypted-board-backup-payload'

const BACKUP_SECRET = 'flowanchor.board.backup.secret.v1'
const BACKUP_SALT = 'flowanchor.board.backup.salt.v1'

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

async function getBackupKey(): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(BACKUP_SECRET),
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      iterations: 210_000,
      salt: textEncoder.encode(BACKUP_SALT),
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encryptBackupPayload(value: unknown): Promise<string> {
  const key = await getBackupKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const plainBytes = textEncoder.encode(JSON.stringify(value))
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plainBytes,
  )
  const payload: EncryptedBoardBackupPayload = {
    v: 1,
    alg: 'AES-GCM',
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(encryptedBuffer)),
  }
  return `${BOARD_BACKUP_PREFIX}${JSON.stringify(payload)}`
}

export async function decryptBackupPayload(serialized: string): Promise<unknown> {
  if (!serialized.startsWith(BOARD_BACKUP_PREFIX)) {
    throw new Error('Invalid backup prefix')
  }

  const payloadCandidate: unknown = JSON.parse(serialized.slice(BOARD_BACKUP_PREFIX.length))
  if (
    typeof payloadCandidate !== 'object' ||
    payloadCandidate === null ||
    !('v' in payloadCandidate) ||
    payloadCandidate.v !== 1 ||
    !('alg' in payloadCandidate) ||
    payloadCandidate.alg !== 'AES-GCM' ||
    !('iv' in payloadCandidate) ||
    typeof payloadCandidate.iv !== 'string' ||
    !('data' in payloadCandidate) ||
    typeof payloadCandidate.data !== 'string'
  ) {
    throw new Error('Invalid backup payload')
  }

  const payload = payloadCandidate as EncryptedBoardBackupPayload
  const key = await getBackupKey()
  const iv = base64ToBytes(payload.iv)
  const encryptedData = base64ToBytes(payload.data)
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    encryptedData as BufferSource,
  )

  return JSON.parse(textDecoder.decode(decryptedBuffer))
}
