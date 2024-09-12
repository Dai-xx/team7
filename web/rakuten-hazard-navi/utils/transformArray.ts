// utils/transformArray.js

/**
 * 配列を変換する関数
 * @param {Array} data - [lat, lng, name, address] 形式の配列
 * @returns {Array} - [{ lat, lng }, name, address] 形式の配列
 */
export const transformArray = (data: any) => {
  const [lat, lng, ...rest] = data;
  return [{ lat, lng }, ...rest];
};
