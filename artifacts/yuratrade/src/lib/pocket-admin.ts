export const ADMIN_IDS = ["113510708", "92535291", "984367891"] as const;

export function isAdminId(value: string | null): boolean {
  return value !== null && (ADMIN_IDS as readonly string[]).includes(value);
}

export function isValidPocketOptionId(value: string | null): boolean {
  return value !== null && (/^\d{9}$/.test(value) || isAdminId(value));
}
