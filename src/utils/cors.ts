export function allowOrigin(origin: string, list?: string) {
  const allow = (list || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    const o = new URL(origin);
    return allow.some(
      (p) =>
        p === `${o.protocol}//${o.host}` || (p.startsWith("*.") && o.host.endsWith(p.slice(1))),
    );
  } catch {
    return false;
  }
}
