export function sanitizeDisplayName(input) {
  if (!input) {
    return "";
  }

  const normalized = String(input)
    .normalize("NFKC")
    .replace(/[^\p{L}0-9\s'-]/gu, "")
    .trim();

  if (!normalized) {
    return "";
  }

  return normalized
    .split(/\s+/u)
    .filter(Boolean)
    .map((segment) =>
      segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase(),
    )
    .join(" ");
}
