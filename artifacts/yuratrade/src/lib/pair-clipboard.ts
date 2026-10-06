export function pairNameForClipboard(name: string) {
  return name.replace(/\s+OTC$/i, "").trim();
}

export function copyPairName(name: string) {
  const pairName = pairNameForClipboard(name);
  if (typeof document === "undefined") return Promise.reject(new Error("copy"));

  const area = document.createElement("textarea");
  area.value = pairName;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "0";
  area.style.left = "0";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.focus();
  area.select();
  area.setSelectionRange(0, pairName.length);
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  area.remove();
  if (copied) return Promise.resolve();
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(pairName);
  return Promise.reject(new Error("copy"));
}
