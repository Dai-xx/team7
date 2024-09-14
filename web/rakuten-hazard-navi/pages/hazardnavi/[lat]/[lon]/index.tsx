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
import { useMap } from '@vis.gl/react-google-maps';
import ShelterDialog from '@/components/ShelterDialog';

const mapType = [
  { id: '0', title: '地理データ', legend: 'null' },
  { id: '1', title: '洪水浸水想定区域', legend: '/legend/kouzui_shinsui.png' },
  { id: '2', title: '浸水継続時間', legend: '/legend/shinsui_keizoku.png' },
  {
    id: '3',
    title: '家屋倒壊等氾濫想定区域（氾濫流）',
    legend: 'null',
  },
  {
    id: '4',
    title: '家屋倒壊等氾濫想定区域（河岸侵食）',
    legend: 'null',
  },
  { id: '5', title: '内水浸水想定区域', legend: '/legend/naisui_shinsui.png' },
  {
    id: '6',
    title: '高潮浸水想定区域',
    legend: '/legend/takashio_shinsui.png',
  },
  { id: '7', title: '津波浸水想定', legend: '/legend/tsunami_shinsui.png' },
  {
    id: '8',
    title: '土砂災害警戒区域（土石流）',
    legend: '/legend/dosha_dosekiryu.png',
  },
  {
    id: '9',
    title: '土砂災害警戒区域（急傾斜地の崩壊）',
    legend: '/legend/dosha_kyukeisha.png',
  },
  {
    id: '10',
    title: '土砂災害警戒区域（地すべり）',
    legend: '/legend/dosha_jisuberi.png',
  },
  { id: '11', title: '雪崩危険箇所', legend: 'null' },
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

  const { xTile, yTile } = latLonToTile(center.lat, center.lon, 13);
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

  const toRightTileBounds = getTileBounds(topRight.x, topRight.y, 13);
  const bottomLefttTileBounds = getTileBounds(bottomLeft.x, bottomLeft.y, 13);

  // console.log(tileBounds);

  const shouldHazardFetch = center && center.lat && center.lon;

  const { data: tmpHazardmapData, isLoading: hazaradmapDataLoading } = useSWR(
    shouldHazardFetch
      ? `/api/hazardmapApi/${center.lat}/${center.lon}/${parseInt(selectedMapType, 10)}`
      : null,
    axios
  );

  const hazardmapData = tmpHazardmapData?.data;
  const reHazardmapData = {
    legend: mapType[hazardmapData?.mapType]?.legend,
    ...hazardmapData,
  };
  if (selectedMapType === '0' && hazardmapData) {
    hazardmapData.image = null;
  }

  const shouldShelterFetch =
    toRightTileBounds?.top_right?.lat &&
    toRightTileBounds?.top_right?.lon &&
    bottomLefttTileBounds?.bottom_left?.lat &&
    bottomLefttTileBounds?.bottom_left?.lon &&
    center?.lat &&
    center?.lon;

  const { data: tmpShelterData, isLoading: shelterDataLoading } = useSWR(
    shouldShelterFetch
      ? `/api/shelterApi?lat1=${toRightTileBounds.top_right.lat}&lon1=${toRightTileBounds.top_right.lon}&lat2=${bottomLefttTileBounds.bottom_left.lat}&lon2=${bottomLefttTileBounds.bottom_left.lon}&lat3=${center.lat}&lon3=${center.lon}`
      : null,
    axios
  );

  const shelterData = tmpShelterData?.data;
  const transformedShelterData = groupByAddress(shelterData);

  const map = useMap();
  const [selectedCard, setSelectedCard] = useState<number>();

  const handleMarkerClick = (lat: number, lng: number, index: number) => {
    if (map) {
      map.panTo({ lat, lng }); // マップの中心をマーカーの位置に移動
      map.setZoom(15); // ズームレベルを調整する場合
      setSelectedCard(index);
    }
  };

  const [open, setOpen] = useState(false);

  console.log('open', open);

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
          hazardmapData={reHazardmapData}
          hazardmapDataLoading={hazaradmapDataLoading}
          shelterData={transformedShelterData}
          shelterDataLoading={shelterDataLoading}
          center={center}
          selectedCard={selectedCard}
        />

        <p className="text-[8px] mx-1">出典：ハザードマップポータルサイト</p>
        <div className="mx-4">
          <div className="flex justify-end gap-3">
            <Select.Root defaultValue="0" onValueChange={handleValueChange}>
              <Select.Trigger />
              <Select.Content>
                <Select.Group>
                  <Select.Label>Map Type</Select.Label>
                  {mapType.map((item) => {
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
                  <button
                    key={index}
                    onClick={() => handleMarkerClick(item[0], item[1], index)}
                  >
                    <div
                      className={`${selectedCard === index ? 'border-[#009891]' : 'border-[#D9D9D9]'} border rounded-xl p-2`}
                    >
                      <div className="flex gap-2 items-center">
                        <div className="border-r border-[#009891] h-[35px]"></div>
                        <h3 className="text-sm">{item[2]}</h3>
                      </div>
                      <p className="text-xs text-[#9A9A9A] mt-1">{item[3]}</p>
                    </div>
                  </button>
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
            {/* <Link
              href={`/viewMore/${hazardmapData?.bottom_left?.lat}/${hazardmapData?.bottom_left?.lon}/${hazardmapData?.top_right?.lat}/${hazardmapData?.top_right?.lon}/${center.lat}/${center.lon}`}
            > */}
            <button
              onClick={() => setOpen(true)}
              className="bg-[#EDEDED] w-full py-3 rounded-full flex items-center justify-center"
            >
              <p>さらに表示</p>
              <IoIosArrowForward />
            </button>

            {/* </Link> */}
          </div>
        </div>
      </Theme>
      <ShelterDialog
        open={open}
        setOpen={setOpen}
        selectedCard={selectedCard}
        data={transformedShelterData}
        handleMarkerClick={handleMarkerClick}
      />
    </main>
  );
};
export default Detail;
