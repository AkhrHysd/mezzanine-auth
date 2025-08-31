export function allowOrigin(origin: string, list?: string) {
  const allow = (list || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  let o: URL;
  try {
    o = new URL(origin);
  } catch {
    return false;
  }

  return allow.some((p) => {
    // パターンpをURLとして解釈できるなら分解、できなければ“ホストだけ”とみなす
    let pUrl: URL | null = null;
    try {
      pUrl = new URL(p);
    } catch {
      /* noop */
    }

    const pProtocol = pUrl?.protocol; // "https:" 等 / 省略可
    const pHost = (pUrl?.host || p).toLowerCase();

    const oProtocol = o.protocol; // "https:"
    const oHost = o.host.toLowerCase();

    // protocol が指定されている場合は一致必須、無指定なら無視
    const protocolOK = !pProtocol || pProtocol === oProtocol;

    // ワイルドカード "*.example.com"（"https://*.example.com" も可）
    if (pHost.startsWith("*.")) {
      const suffix = pHost.slice(1); // ".example.com"
      return protocolOK && oHost.endsWith(suffix);
    }

    // 完全一致（"https://site-a.com" / "site-a.com" どちらも可）
    if (pUrl) {
      // パターンに protocol があれば origin 完全一致でOK
      return protocolOK && oHost === pHost;
    } else {
      // ホストだけの指定
      return oHost === pHost;
    }
  });
}
