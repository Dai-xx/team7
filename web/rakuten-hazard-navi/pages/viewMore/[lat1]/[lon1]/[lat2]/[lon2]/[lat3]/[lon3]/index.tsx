import '@radix-ui/themes/styles.css';
import GoogleMapsApi from '@/components/GoogleMapsApi';
import { Theme, Select, Switch } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Image from 'next/image';
import { groupByAddress } from '@/utils/filterUniqueAddresses';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { useRouter } from 'next/router';

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
  const [lat1, setLat1] = useState(null);
  const [lon1, setLon1] = useState(null);
  const [lat2, setLat2] = useState(null);
  const [lon2, setLon2] = useState(null);
  const [lat3, setLat3] = useState(null);
  const [lon3, setLon3] = useState(null);

  useEffect(() => {
    // パスをスラッシュで分割
    const pathSegments = router.asPath.split('/');

    // URL パスに十分なセグメントがあるか確認
    if (pathSegments.length >= 7) {
      // 各座標値を取得
      const lat1Value = parseFloat(pathSegments[2]);
      const lon1Value = parseFloat(pathSegments[3]);
      const lat2Value = parseFloat(pathSegments[4]);
      const lon2Value = parseFloat(pathSegments[5]);
      const lat3Value = parseFloat(pathSegments[6]);
      const lon3Value = parseFloat(pathSegments[7]);

      // 数値として有効な場合のみセット
      if (!isNaN(lat1Value)) {
        setLat1(lat1Value);
      }
      if (!isNaN(lon1Value)) {
        setLon1(lon1Value);
      }
      if (!isNaN(lat2Value)) {
        setLat2(lat2Value);
      }
      if (!isNaN(lon2Value)) {
        setLon2(lon2Value);
      }
      if (!isNaN(lat3Value)) {
        setLat3(lat3Value);
      }
      if (!isNaN(lon3Value)) {
        setLon3(lon3Value);
      }
    }
  }, [router.asPath]);

  const { data: tmpShelterData, isLoading: shelterDataLoading } = useSWR(
    `/api/shelterApi?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}&lat3=${lat3}&lon3=${lon3}`,
    axios
  );

  const shelterData = tmpShelterData?.data;
  const transformedShelterData = groupByAddress(shelterData);
  console.log('shelterData', transformedShelterData);

  return (
    <main>
      <Theme accentColor="teal" hasBackground={true} className="mx-4">
        <header className="">
          <div className="relative w-[200px] h-[50px]">
            <Image
              src="/Rakuten_Team7_service_logo_removebg.png"
              fill
              alt=""
              style={{ objectFit: 'contain' }}
            />
          </div>
        </header>
        <button
          onClick={() => router.push(`/hazardnavi/${lat3}/${lon3}`)}
          className="text-[#9A9A9A] flex items-center"
        >
          <IoIosArrowBack size={22} />
          <p>戻る</p>
        </button>
        <div className="mt-3">
          <div className="grid grid-cols-3 place-content-center gap-x-1 gap-y-4 mt-2">
            {transformedShelterData && transformedShelterData.length > 0 ? (
              transformedShelterData.map((item, index) => {
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
        </div>
      </Theme>
    </main>
  );
};
export default Detail;
