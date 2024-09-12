function cleanName(name: string) {
  // 全角・半角スペースで名前を分割
  const parts = name.split(/\s+/);
  return parts.length > 1 ? parts[0] : name;
}

export function groupByAddress(data: [number, number, string, string][]) {
  const addressMap = new Map<string, [number, number, string, string]>();

  data?.forEach((entry) => {
    if (entry.length !== 4) return; // エントリが4つの要素を持っていない場合はスキップ
    const [latitude, longitude, name, address] = entry;
    const cleanedName = cleanName(name);

    // 同じ住所がまだ存在しない場合のみセット
    if (!addressMap.has(address)) {
      addressMap.set(address, [latitude, longitude, cleanedName, address]);
    }
  });

  return Array.from(addressMap.values());
}
