function latLonToTile(
  lat: number,
  lon: number,
  zoom: number
): { xTile: number; yTile: number } {
  // 経度からX座標を計算
  const xTile = Math.floor(((lon + 180) / 360) * 2 ** zoom);
  // 緯度をラジアンに変換
  const latRad = (lat * Math.PI) / 180;
  // 緯度からY座標を計算
  const yTile = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      2 ** zoom
  );

  return { xTile, yTile };
}

// タイルのX座標から経度を計算
function tileToLon(x: number, z: number): number {
  return (x / Math.pow(2, z)) * 360 - 180;
}

// タイルのY座標から緯度を計算
function tileToLat(y: number, z: number): number {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
  return (Math.atan(Math.sinh(n)) * 180) / Math.PI;
}

// タイルの左上(北西)と右下(南東)の緯度経度を計算
export function getTileBounds(
  x: number,
  y: number,
  z: number
): {
  top_left: { lat: number; lon: number };
  bottom_right: { lat: number; lon: number };
  top_right: { lat: number; lon: number };
  bottom_left: { lat: number; lon: number };
} {
  const north = tileToLat(y, z); // タイルの左上 (北緯)
  const south = tileToLat(y + 1, z); // タイルの右下 (南緯)
  const west = tileToLon(x, z); // タイルの左上 (西経)
  const east = tileToLon(x + 1, z); // タイルの右下 (東経)

  return {
    top_left: { lat: north, lon: west }, // 左上 (北西)
    bottom_right: { lat: south, lon: east }, // 右下 (南東)
    top_right: { lat: north, lon: east }, // 右上 (北東)
    bottom_left: { lat: south, lon: west }, // 左下 (南西)
  };
}
