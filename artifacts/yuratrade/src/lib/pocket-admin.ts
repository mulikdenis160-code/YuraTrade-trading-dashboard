export const ADMIN_IDS = ["113510708", "92535291"] as const;

export function isAdminId(value: string | null): boolean {
  return value !== null && (ADMIN_IDS as readonly string[]).includes(value);
}
