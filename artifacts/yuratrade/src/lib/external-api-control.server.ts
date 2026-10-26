export const EXTERNAL_APIS_DISABLED_MESSAGE =
  "Внешние API отключены владельцем приложения.";

export function externalApisDisabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return env.PRIME_EXTERNAL_APIS_DISABLED?.trim().toLowerCase() === "true";
}
