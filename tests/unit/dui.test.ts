import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  DuiError,
  decryptDui,
  encryptDui,
  formatDui,
  fromPgBytea,
  hashDui,
  loadDuiKeys,
  normalizeDui,
  toPgBytea,
} from "@/lib/crypto";

// Claves generadas en cada corrida y DUI ficticios: nunca valores reales.
const env = { PII_ENCRYPTION_KEY: randomBytes(32).toString("base64"), PII_HASH_KEY: randomBytes(32).toString("base64") };
const keys = loadDuiKeys(env);
const DUI = "00000001-0";

describe("DUI", () => {
  it("normaliza y formatea", () => {
    expect(normalizeDui("00000001-0")).toBe("000000010");
    expect(normalizeDui(" 000000010 ")).toBe("000000010");
    expect(formatDui("000000010")).toBe("00000001-0");
    expect(() => normalizeDui("1234")).toThrow(DuiError);
  });

  it("cifra y descifra", () => {
    expect(decryptDui(encryptDui(DUI, keys), keys)).toBe("000000010");
  });

  it("dos cifrados del mismo DUI son distintos (IV aleatorio)", () => {
    expect(encryptDui(DUI, keys).equals(encryptDui(DUI, keys))).toBe(false);
  });

  it("el formato lleva versión, IV, etiqueta y no contiene el DUI en claro", () => {
    const cifrado = encryptDui(DUI, keys);
    expect(cifrado[0]).toBe(1);
    expect(cifrado.length).toBe(1 + 12 + 16 + 9);
    expect(cifrado.includes(Buffer.from("000000010"))).toBe(false);
  });

  it("falla si se altera un byte", () => {
    const cifrado = encryptDui(DUI, keys);
    cifrado[cifrado.length - 1] ^= 0xff;
    expect(() => decryptDui(cifrado, keys)).toThrow(DuiError);
  });

  it("falla con otra clave, sin revelar el DUI en el error", () => {
    const otra = loadDuiKeys({
      PII_ENCRYPTION_KEY: randomBytes(32).toString("base64"),
      PII_HASH_KEY: randomBytes(32).toString("base64"),
    });
    try {
      decryptDui(encryptDui(DUI, keys), otra);
      expect.unreachable();
    } catch (e) {
      expect(String((e as Error).message)).not.toContain("000000010");
    }
  });

  it("el HMAC es determinista y depende de la clave", () => {
    expect(hashDui(DUI, keys).equals(hashDui("000000010", keys))).toBe(true);
    const otra = loadDuiKeys({ ...env, PII_HASH_KEY: randomBytes(32).toString("base64") });
    expect(hashDui(DUI, keys).equals(hashDui(DUI, otra))).toBe(false);
  });

  it("rechaza claves ausentes, de largo incorrecto o iguales", () => {
    expect(() => loadDuiKeys({})).toThrow(DuiError);
    expect(() => loadDuiKeys({ ...env, PII_ENCRYPTION_KEY: randomBytes(16).toString("base64") })).toThrow(DuiError);
    expect(() => loadDuiKeys({ PII_ENCRYPTION_KEY: env.PII_HASH_KEY, PII_HASH_KEY: env.PII_HASH_KEY })).toThrow(DuiError);
  });

  it("convierte bytea de Postgres ida y vuelta", () => {
    const cifrado = encryptDui(DUI, keys);
    expect(fromPgBytea(toPgBytea(cifrado)).equals(cifrado)).toBe(true);
  });
});
