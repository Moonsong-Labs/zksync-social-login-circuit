import process from "node:process";

export function env(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing ${key} env var`);
  }
  return value;
}

export function envOrDefault(key: string, defaultValue: string): string {
  const value = process.env[key];
  return value === undefined ? defaultValue : value;
}
