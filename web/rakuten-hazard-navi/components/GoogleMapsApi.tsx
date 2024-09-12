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
import { Callout } from '@radix-ui/themes';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import Loading from './Loading';
import { transformArray } from '@/utils/transformArray';
import Image from 'next/image';

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

type Shelter = {
  lat: number;
  lon: number;
  name: string;
  address: string;
};

type Props = {
  isExitFlag: boolean;
  hazardmapData: HazardMapData;
  hazardmapDataLoading: boolean;
  shelterData: Shelter[];
  shelterDataLoading: boolean;
  center: {
    lat: number;
    lon: number;
  };
};

const GoogleMapsApi: FC<Props> = ({
  isExitFlag,
  hazardmapData,
  hazardmapDataLoading,
  shelterData,
  shelterDataLoading,
  center,
}) => {
  const map = useMap();
  const apiIsLoaded = useApiIsLoaded();

  console.log('shelterData type', typeof shelterData);
  console.log('shelterData', shelterData);

  // オーバーレイをセット
  const overlayImage = hazardmapData?.image
    ? `data:image/png;base64,${hazardmapData.image}`
    : '';

  // GoogleMapsApiコンポーネント内
  const overlayBounds: [number, number, number, number] = [
    hazardmapData?.bottom_left?.lon ?? 0,
    hazardmapData?.bottom_left?.lat ?? 0,
    hazardmapData?.top_right?.lon ?? 0,
    hazardmapData?.top_right?.lat ?? 0,
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
    lat: center?.lat,
    lng: center?.lon,
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
  const { markerRef, marker } = useInfoWindow();
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
        shelterData?.map((item, index: number) => {
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
                  width={25}
                  height={25}
                  alt=""
                  style={{ objectFit: 'cover' }}
                />
              </AdvancedMarker>
              {selectedMarker === index && InfoWindow && (
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
