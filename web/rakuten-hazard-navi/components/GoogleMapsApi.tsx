import {
  AdvancedMarker,
  InfoWindow,
  Map,
  Marker,
  useApiIsLoaded,
  useMap,
} from '@vis.gl/react-google-maps';
import { FC, useEffect, useState } from 'react';
import { useInfoWindow } from '@/hooks/useInfoWindow';
import { useDeckGlLayers } from '@/hooks/useDeckGlLayers';
import useSWR from 'swr';
import axios from 'axios';
import { hazardmapApiMock } from '@/mocks/hazardmapApiMoack';
import { Callout } from '@radix-ui/themes';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import Loading from './Loading';
import { transformArray } from '@/utils/transformArray';
import Image from 'next/image';

type Props = {
  isExitFlag: boolean;
  hazardmapData: any;
  hazardmapDataLoading: boolean;
  shelterData: any;
  shelterDataLoading: boolean;
};

const GoogleMapsApi: FC<Props> = ({
  isExitFlag,
  hazardmapData,
  hazardmapDataLoading,
  shelterData,
  shelterDataLoading,
}) => {
  const map = useMap();
  const apiIsLoaded = useApiIsLoaded();

  // const { data: tmpHazardmapData, isLoading } = useSWR(
  //   `/api/hazardmapApi/${lat}/${lon}/${mapType}`,
  //   axios
  // );

  // const hazardmapData = tmpHazardmapData?.data;

  // オーバーレイをセット
  const overlayImage = hazardmapData?.image
    ? `data:image/png;base64,${hazardmapData.image}`
    : '';

  const overlayBounds = [
    hazardmapData?.bottom_left?.lon,
    hazardmapData?.bottom_left?.lat,
    hazardmapData?.top_right?.lon,
    hazardmapData?.top_right?.lat,
  ];

  const { layers, deck } = useDeckGlLayers({
    bounds: overlayBounds,
    image: overlayImage,
  });

  useEffect(() => {
    if (map) {
      deck.setMap(map);
    }
    return () => {
      deck.setMap(null);
    };
  }, [map]);

  useEffect(() => {
    deck.setProps({ layers });
  }, [layers]);

  // 中心をセット
  const currentPosition = {
    lat: (hazardmapData?.bottom_left?.lat + hazardmapData?.top_right?.lat) / 2,
    lng: (hazardmapData?.bottom_left?.lon + hazardmapData?.top_right?.lon) / 2,
  };

  // 制限エリアをセット
  const bounds = {
    north: hazardmapData?.top_right?.lat,
    south: hazardmapData?.bottom_left?.lat,
    east: hazardmapData?.top_right?.lon,
    west: hazardmapData?.bottom_left?.lon,
  };

  useEffect(() => {
    if (map) {
      // 制限範囲を適用
      map.setOptions({
        restriction: {
          latLngBounds: bounds, // 範囲を設定
          strictBounds: true, // ユーザーが範囲外にパンできないようにする
        },
        zoom: 12, // 初期ズームレベル
      });
    }
  }, [map]);

  // マーカーのツールチップハンドリングフック
  const { markerRef, marker, infoWindowShown } = useInfoWindow();
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);

  const handleMarkerClick = (index: number) => {
    setSelectedMarker(index);
  };

  const handleClose = () => {
    setSelectedMarker(null);
  };

  if (!apiIsLoaded || hazardmapDataLoading || shelterDataLoading)
    return (
      <div className="h-[65vh] w-screen  bg-white relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-[50%] -translate-y-[50%]">
          <Loading />
        </div>
      </div>
    );
  if (hazardmapData?.status === 404)
    return (
      <div className="h-[65vh] w-screen bg-gray-300 flex justify-center items-center">
        <div>
          <div className="w-full flex justify-center">
            <Image
              src="/undraw_faq_re_31cw.svg"
              width={200}
              height={200}
              alt=""
              style={{ objectFit: 'cover' }}
            />
          </div>
          <Callout.Root>
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              現在のエリアで該当するデータが存在しません。
            </Callout.Text>
          </Callout.Root>
        </div>
      </div>
    );
  return (
    <>
      <Map
        style={{ width: '100vw', height: '65vh' }}
        defaultCenter={currentPosition}
        defaultZoom={12}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        mapId="c0ad196a416ee5f8"
      />

      <Marker position={currentPosition} />
      {isExitFlag &&
        shelterData?.map((item: any, index: number) => {
          const transformedData = transformArray(item);
          return (
            <>
              <AdvancedMarker
                key={index}
                ref={markerRef}
                position={transformedData[0]}
                onClick={() => handleMarkerClick(index)}
              >
                <Image
                  src="/exit.svg"
                  width={50}
                  height={50}
                  alt=""
                  style={{ objectFit: 'cover' }}
                />
              </AdvancedMarker>
              {selectedMarker === index && infoWindowShown && (
                <InfoWindow
                  headerContent={<h3 className="text-black">◯✕体育館</h3>}
                  anchor={marker}
                  onClose={handleClose}
                >
                  <div className="p-2 bg-black text-black">
                    <h1>
                      テキストテキストテキストテキストテキストテキストテキストテキスト
                      テキストテキストテキスト
                    </h1>
                  </div>
                </InfoWindow>
              )}
            </>
          );
        })}
    </>
  );
};

export default GoogleMapsApi;
