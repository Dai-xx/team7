import '@radix-ui/themes/styles.css';
import GoogleMapsApi from '@/components/GoogleMapsApi';
import { Theme, Select, Switch } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Image from 'next/image';
import { groupByAddress } from '@/utils/filterUniqueAddresses';
import { IoIosArrowForward } from 'react-icons/io';
import { useRouter } from 'next/router';
import Link from 'next/link';

const mapTyep = [
  { id: '0', title: '地理データ' },
  { id: '1', title: '洪水浸水想定区域' },
  { id: '2', title: '浸水継続時間' },
  { id: '3', title: '家屋倒壊等氾濫想定区域（氾濫流）' },
  { id: '4', title: '家屋倒壊等氾濫想定区域（河岸侵食）' },
  { id: '5', title: '内水浸水想定区域' },
  { id: '6', title: '高潮浸水想定区域' },
  { id: '7', title: '津波浸水想定' },
  { id: '8', title: '土砂災害警戒区域（土石流）' },
  { id: '9', title: '土砂災害警戒区域（急傾斜地の崩壊）' },
  { id: '10', title: '土砂災害警戒区域（地すべり）' },
  { id: '11', title: '雪崩危険箇所' },
];

const Detail = () => {
  const router = useRouter();
  const [lat, setLat] = useState<number>();
  const [lon, setLon] = useState<number>();

  useEffect(() => {
    // パスをスラッシュで分割
    const pathSegments = router.asPath.split('/');

    // URL パスに十分なセグメントがあるか確認
    if (pathSegments.length >= 4) {
      const latValue = parseFloat(pathSegments[2]);
      const lonValue = parseFloat(pathSegments[3]);

      // 数値として有効な場合のみセット
      if (!isNaN(latValue)) {
        setLat(latValue);
      }
      if (!isNaN(lonValue)) {
        setLon(lonValue);
      }
    }
  }, [router.asPath]);

  console.log('lat, lon', lat, lon);

  const center = {
    lat: lat,
    lon: lon,
  };

  const [selectedMapType, setSelectedMapType] = useState<string>('0');
  const [isExitFlag, setIsExitFlag] = useState(true);
  const handleValueChange = (value: string) => {
    setSelectedMapType(value); // 文字列として状態を更新
  };

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

  const { xTile, yTile } = latLonToTile(center.lat, center.lon, 12);
  const topRight = {
    x: xTile + 1,
    y: yTile - 1,
  };
  const bottomLeft = {
    x: xTile - 1,
    y: yTile + 1,
  };

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
  function getTileBounds(
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

  const toRightTileBounds = getTileBounds(topRight.x, topRight.y, 12);
  const bottomLefttTileBounds = getTileBounds(bottomLeft.x, bottomLeft.y, 12);

  // console.log(tileBounds);

  const { data: tmpHazardmapData, isLoading: hazaradmapDataLoading } = useSWR(
    `/api/hazardmapApi/${center.lat}/${center.lon}/${parseInt(selectedMapType, 10)}`,
    axios
  );

  const hazardmapData = tmpHazardmapData?.data;
  if (selectedMapType === '0' && hazardmapData) {
    hazardmapData.image = null;
  }

  const { data: tmpShelterData, isLoading: shelterDataLoading } = useSWR(
    `/api/shelterApi?lat1=${toRightTileBounds.top_right.lat}&lon1=${toRightTileBounds.top_right.lon}&lat2=${bottomLefttTileBounds.bottom_left.lat}&lon2=${bottomLefttTileBounds.bottom_left.lon}&lat3=${center.lat}&lon3=${center.lon}`, // パラメータが不正の場合にはリクエストを送信しない
    axios
  );

  const shelterData = tmpShelterData?.data;
  const transformedShelterData = groupByAddress(shelterData);

  console.log('');

  return (
    <main>
      <Theme accentColor="teal" hasBackground={true}>
        <header className="mx-4">
          <div className="relative w-[200px] h-[50px]">
            <Image
              src="/Rakuten_Team7_service_logo_removebg.png"
              fill
              alt=""
              style={{ objectFit: 'contain' }}
            />
          </div>
        </header>
        <GoogleMapsApi
          isExitFlag={isExitFlag}
          hazardmapData={hazardmapData}
          hazardmapDataLoading={hazaradmapDataLoading}
          shelterData={transformedShelterData}
          shelterDataLoading={shelterDataLoading}
          center={center}
        />

        <p className="text-[8px] mx-1">出典：ハザードマップポータルサイト</p>
        <div className="mx-4">
          <div className="flex justify-end gap-3">
            <Select.Root defaultValue="0" onValueChange={handleValueChange}>
              <Select.Trigger />
              <Select.Content>
                <Select.Group>
                  <Select.Label>Map Type</Select.Label>
                  {mapTyep.map((item) => {
                    return (
                      <Select.Item key={item.id} value={item.id}>
                        {item.title}
                      </Select.Item>
                    );
                  })}
                </Select.Group>
              </Select.Content>
            </Select.Root>
            <div className="flex items-center gap-1">
              <Image
                src="/exit.svg"
                width={30}
                height={30}
                alt=""
                style={{ objectFit: 'cover' }}
                className="mb-1"
              />
              <Switch
                defaultChecked
                onClick={() => setIsExitFlag(!isExitFlag)}
              />
            </div>
          </div>
          <h3 className="text-xs">近くの避難所：</h3>
          <div className="grid grid-cols-3 place-content-center gap-1 mt-2">
            {transformedShelterData && transformedShelterData.length > 0 ? (
              transformedShelterData.slice(0, 3).map((item, index) => {
                return (
                  <div
                    key={index}
                    className="border border-gray-[#D9D9D9] rounded-xl p-2"
                  >
                    <div className="flex gap-2 items-center">
                      <div className="border-r border-[#009891] h-[35px]"></div>
                      <h3 className="text-sm">{item[2]}</h3>
                    </div>
                    <p className="text-xs text-[#9A9A9A] mt-1">{item[3]}</p>
                  </div>
                );
              })
            ) : (
              // データがない場合のプレースホルダー
              <>
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="w-full h-[94px] bg-gray-200 animate-pulse rounded-xl"
                  ></div>
                ))}
              </>
            )}
          </div>

          <div className="mt-4">
            <Link
              href={`/viewMore/${hazardmapData?.bottom_left?.lat}/${hazardmapData?.bottom_left?.lon}/${hazardmapData?.top_right?.lat}/${hazardmapData?.top_right?.lon}/${center.lat}/${center.lon}`}
            >
              <button className="bg-[#EDEDED] w-full py-3 rounded-full flex items-center justify-center">
                <p>さらに表示</p>
                <IoIosArrowForward />
              </button>
            </Link>
          </div>
        </div>
      </Theme>
    </main>
  );
};
export default Detail;
