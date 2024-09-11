import {
  AdvancedMarker,
  InfoWindow,
  Map,
  Marker,
  useApiIsLoaded,
  useMap,
} from '@vis.gl/react-google-maps';
import { useEffect } from 'react';
import { useInfoWindow } from '@/hooks/useInfoWindow';
import { useDeckGlLayers } from '@/hooks/useDeckGlLayers';
import useSWR from 'swr';
import axios from 'axios';
import { hazardmapApiMock } from '@/mocks/hazardmapApiMoack';

type Props = {
  lat: number;
  lon: number;
  mapType: number;
};

const GoogleMapsApi = ({ lat, lon, mapType }) => {
  const map = useMap();
  const apiIsLoaded = useApiIsLoaded();

  // const center = {
  //   lat: 35.4550426,
  //   lon: 139.6312741,
  // };

  // const mapType = 11;
  const { data: tmpHzardmapData, isLoading } = useSWR(
    `/api/hazardmapApi/${lat}/${lon}/${mapType}`,
    axios
  );

  // const hazardmapData = hazardmapApiMock;
  const hazardmapData = tmpHzardmapData?.data;
  // console.log('tmpHzardmapData', tmpHzardmapData);
  console.log('err', hazardmapData?.status);

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
    console.log('Map updated or hazardmapData updated:', { map, layers });
    if (map) {
      deck.setMap(map);
    }
    return () => {
      deck.setMap(null);
    };
  }, [map, tmpHzardmapData]);

  useEffect(() => {
    console.log('Layers set:', layers);
    deck.setProps({ layers });
  }, [layers, tmpHzardmapData]);

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
  const { markerRef, marker, infoWindowShown, handleMarkerClick, handleClose } =
    useInfoWindow();

  if (!apiIsLoaded) {
    return <div>Loading...map</div>;
  }
  if (isLoading) return <div>loading...</div>;
  if (hazardmapData.status === 404) return <div>Not Found</div>;
  return (
    <>
      <Map
        style={{ width: '100vw', height: '100vh' }}
        defaultCenter={currentPosition}
        defaultZoom={12}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        mapId="c0ad196a416ee5f8"
      />
      <Marker position={currentPosition} />
      {/* <Marker position={{ lat: 35.675069, lng: 139.763328 }} /> */}
      {/* <Marker position={{ lat: 35.694099, lng: 139.737358 }} /> */}
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: 35.694099, lng: 139.737358 }}
        onClick={handleMarkerClick}
      >
        <div className="bg-blue-700 w-[30px] h-[30px] rounded-full"></div>
      </AdvancedMarker>
      {infoWindowShown && (
        <InfoWindow
          headerContent={<h3 className="text-black">◯✕体育館</h3>}
          anchor={marker}
          onClose={handleClose}
        >
          <div className="p-2 bg-white text-black">
            <h1>
              テキストテキストテキストテキストテキストテキストテキストテキスト
              テキストテキストテキスト
            </h1>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default GoogleMapsApi;
