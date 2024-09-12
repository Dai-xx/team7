import '@radix-ui/themes/styles.css';
import GoogleMapsApi from '@/components/GoogleMapsApi';
import { Theme, Select, Switch } from '@radix-ui/themes';
import { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Image from 'next/image';
import { groupByAddress } from '@/utils/filterUniqueAddresses';
import { IoIosArrowForward } from 'react-icons/io';

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

type Coordinates = {
  lat: number;
  lon: number;
};

type HazardMapData = {
  bottom_left: Coordinates;
  image: string | null;
  status: number;
  top_right: Coordinates;
};

export default function Home() {
  const center = {
    lat: 35.4550426,
    lon: 139.6312741,
  };

  const [selectedMapType, setSelectedMapType] = useState<string>('0');
  const [isExitFlag, setIsExitFlag] = useState(true);

  const handleValueChange = (value: string) => {
    setSelectedMapType(value);
  };

  const {
    data: hazardmapData,
    error: hazardmapDataError,
    isLoading: hazaradmapDataLoading,
  } = useSWR<HazardMapData>(
    `/api/hazardmapApi/${center.lat}/${center.lon}/${parseInt(selectedMapType, 10)}`,
    axios
  );

  // データが取得できなかった場合の処理
  if (hazardmapDataError) {
    console.error('Error fetching hazard map data:', hazardmapDataError);
  }

  const {
    data: shelterData,
    error: shelterDataError,
    isLoading: shelterDataLoading,
  } = useSWR<[number, number, string, string][]>(
    `/api/shelterApi?lat1=${hazardmapData?.bottom_left?.lat}&lon1=${hazardmapData?.bottom_left?.lon}&lat2=${hazardmapData?.top_right?.lat}&lon2=${hazardmapData?.top_right?.lon}&lat3=${center.lat}&lon3=${center.lon}`,
    axios
  );

  // データが取得できなかった場合の処理
  if (shelterDataError) {
    console.error('Error fetching shelter data:', shelterDataError);
  }

  const transformedShelterData = groupByAddress(shelterData || []);

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
          hazardmapData={hazardmapData || ({} as HazardMapData)}
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
                  {mapTyep.map((item) => (
                    <Select.Item key={item.id} value={item.id}>
                      {item.title}
                    </Select.Item>
                  ))}
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
          <div className="grid grid-cols-3 place-content-center gap-1 mt-2">
            {transformedShelterData.length > 0
              ? transformedShelterData.slice(0, 3).map((item, index) => (
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
                ))
              : // データがない場合のプレースホルダー
                [...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="w-full h-[94px] bg-gray-200 animate-pulse rounded-xl"
                  ></div>
                ))}
          </div>

          <div className="mt-4">
            <button className="bg-[#EDEDED] w-full py-3 rounded-full flex items-center justify-center">
              <p>さらに表示</p>
              <IoIosArrowForward />
            </button>
          </div>
        </div>
      </Theme>
    </main>
  );
}
