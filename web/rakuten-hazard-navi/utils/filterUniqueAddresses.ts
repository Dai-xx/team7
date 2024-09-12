function cleanName(name) {
  const parts = name.split('　');
  return parts.length > 1 ? parts[0] : name;
}

export function groupByAddress(data) {
  const addressMap = new Map();

  data?.forEach((entry) => {
    const [latitude, longitude, name, address] = entry;
    const cleanedName = cleanName(name);

    if (!addressMap.has(address)) {
      addressMap.set(address, [latitude, longitude, cleanedName, address]);
    }
  });

  return Array.from(addressMap.values());
}
