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

type Props = {
  isExitFlag: boolean;
  hazardmapData: any;
  hazardmapDataLoading: boolean;
  shelterData: any;
  shelterDataLoading: boolean;
  center: {
    lat: number;
    lon: number;
  };
  selectedCard: number;
};

const GoogleMapsApi: FC<Props> = ({
  isExitFlag,
  hazardmapData,
  hazardmapDataLoading,
  shelterData,
  shelterDataLoading,
  center,
  selectedCard,
}) => {
  const map = useMap();
  const apiIsLoaded = useApiIsLoaded();

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
        zoom: 13, // 初期ズームレベル
      });
    }
  }, [map]);

  // マーカーのツールチップハンドリングフック
  const { markerRef, marker } = useInfoWindow();
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);

  // const handleMarkerClick = (index: number) => {
  //   setSelectedMarker(index);
  // };

  const handleClose = () => {
    setSelectedMarker(null);
  };

  const handleMarkerClick = (lat: number, lng: number) => {
    if (map) {
      map.panTo({ lat, lng }); // マップの中心をマーカーの位置に移動
      map.setZoom(15); // ズームレベルを調整する場合
    }
  };

  if (!apiIsLoaded || hazardmapDataLoading || shelterDataLoading)
    return (
      <div className="h-[65vh] w-screen  bg-white relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-[50%] -translate-y-[50%]">
          <Loading />
        </div>
      </div>
    );

  console.log('legend', hazardmapData.legend);
  return (
    <>
      {hazardmapData.legend ? <div></div> : <div></div>}
      {hazardmapData.legend != 'null' && (
        <div className=" w-[150px] aspect-square absolute z-10 right-0 m-4">
          <Image
            src={hazardmapData.legend}
            fill
            alt=""
            style={{ objectFit: 'cover' }}
            className=" opacity-70"
          />
        </div>
      )}
      <Map
        style={{ width: '100vw', height: '65vh' }}
        defaultCenter={currentPosition}
        defaultZoom={13}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        mapId="c0ad196a416ee5f8"
      />
      <Marker position={currentPosition} />
      {isExitFlag &&
        shelterData?.map((item: number[], index: number) => {
          const transformedData = transformArray(item);
          return (
            <>
              <AdvancedMarker
                key={index}
                ref={markerRef}
                position={transformedData[0]}
                onClick={() =>
                  handleMarkerClick(
                    transformedData[0].lat,
                    transformedData[0].lng
                  )
                }
                className={`${selectedCard === index && 'bg-[#009891]/50 rounded-full p-1'}`}
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
