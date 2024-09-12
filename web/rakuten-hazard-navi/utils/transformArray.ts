/**
 * 配列を変換する関数
 * @param {[number, number, string, string]} data - [lat, lng, name, address] 形式の配列
 * @returns {Array} - [{ lat: number, lng: number }, name: string, address: string] 形式の配列
 */
export const transformArray = (data: [number, number, string, string]) => {
  const [lat, lng, ...rest] = data;
  return [{ lat, lng }, ...rest];
};
