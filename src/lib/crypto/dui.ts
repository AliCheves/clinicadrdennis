// Cifrado del DUI (ADR-0009). AES-256-GCM con IV aleatorio y HMAC-SHA256 para detectar duplicados.
// Formato almacenado: versión (1 byte) ‖ IV (12) ‖ etiqueta (16) ‖ texto cifrado.
// Las claves vienen de variables de entorno y nunca se escriben en logs ni en mensajes de error.
// Solo para el servidor.

import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";

const VERSION = 0x01;
const IV_BYTES = 12;
const TAG_BYTES = 16;
const KEY_BYTES = 32;

export class DuiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuiError";
  }
}

export type DuiKeys = { encryptionKey: Buffer; hashKey: Buffer };

function decodeKey(value: string | undefined, name: string): Buffer {
  if (!value) throw new DuiError(`Falta la variable ${name}`);
  const key = Buffer.from(value, "base64");
  if (key.length !== KEY_BYTES) throw new DuiError(`${name} debe ser de ${KEY_BYTES} bytes en base64`);
  return key;
}

type DuiEnv = Record<string, string | undefined>;

export function loadDuiKeys(env: DuiEnv = process.env): DuiKeys {
  const encryptionKey = decodeKey(env.PII_ENCRYPTION_KEY, "PII_ENCRYPTION_KEY");
  const hashKey = decodeKey(env.PII_HASH_KEY, "PII_HASH_KEY");
  if (encryptionKey.equals(hashKey)) throw new DuiError("PII_ENCRYPTION_KEY y PII_HASH_KEY deben ser distintas");
  return { encryptionKey, hashKey };
}

// "01234567-8" o "012345678" → "012345678". Rechaza lo que no tenga 9 dígitos.
export function normalizeDui(input: string): string {
  const digits = input.replace(/[\s-]/g, "");
  if (!/^\d{9}$/.test(digits)) throw new DuiError("El DUI debe tener 9 dígitos");
  return digits;
}

export function formatDui(normalized: string): string {
  return `${normalized.slice(0, 8)}-${normalized.slice(8)}`;
}

export function encryptDui(dui: string, keys: DuiKeys): Buffer {
  const plain = Buffer.from(normalizeDui(dui), "utf8");
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", keys.encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(plain), cipher.final()]);
  return Buffer.concat([Buffer.from([VERSION]), iv, cipher.getAuthTag(), encrypted]);
}

export function decryptDui(stored: Buffer, keys: DuiKeys): string {
  if (stored.length < 1 + IV_BYTES + TAG_BYTES + 1 || stored[0] !== VERSION) {
    throw new DuiError("Formato de DUI cifrado no reconocido");
  }
  const iv = stored.subarray(1, 1 + IV_BYTES);
  const tag = stored.subarray(1 + IV_BYTES, 1 + IV_BYTES + TAG_BYTES);
  const data = stored.subarray(1 + IV_BYTES + TAG_BYTES);
  try {
    const decipher = createDecipheriv("aes-256-gcm", keys.encryptionKey, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    // Sin detalles: el error original podría acompañarse de datos del valor.
    throw new DuiError("No se pudo descifrar el DUI");
  }
}

export function hashDui(dui: string, keys: DuiKeys): Buffer {
  return createHmac("sha256", keys.hashKey).update(normalizeDui(dui), "utf8").digest();
}

// bytea de PostgREST ("\\x…") ↔ Buffer
export function fromPgBytea(value: string): Buffer {
  if (!value.startsWith("\\x")) throw new DuiError("bytea con formato inesperado");
  return Buffer.from(value.slice(2), "hex");
}

export function toPgBytea(value: Buffer): string {
  return `\\x${value.toString("hex")}`;
}
