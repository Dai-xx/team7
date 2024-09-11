import {
  AdvancedMarker,
  InfoWindow,
  Map,
  Marker,
  useApiIsLoaded,
  useMap,
} from '@vis.gl/react-google-maps';
import { useEffect } from 'react';
import { useCameraProps } from '@/hooks/useCameraProps';
import { useInfoWindow } from '@/hooks/useInfoWindow';
import { useDeckGlLayers } from '@/hooks/useDeckGlLayers';
import useSWR from 'swr';
import axios from 'axios';
import { hazardmapApiMock } from '@/mocks/hazardmapApiMoack';

function calculateCenter(bounds: any) {
  const [lon1, lat1, lon2, lat2] = bounds;

  const centerLon = (lon1 + lon2) / 2;
  const centerLat = (lat1 + lat2) / 2;

  return { centerLon, centerLat };
}

const GoogleMapsApi = () => {
  const map = useMap();

  // const { data: tmpHzardmapData } = useSWR(`/api/hazardmapApi`, axios);
  const tmpHzardmapData = hazardmapApiMock;
  const hazardmapData = tmpHzardmapData;

  // オーバーレイをセット
  const orverlyaImage = `data:image/png;base64,${hazardmapData?.image}`;
  const orverlayBounds = [
    hazardmapData?.bottom_left?.lon,
    hazardmapData?.bottom_left?.lat,
    hazardmapData?.top_right?.lon,
    hazardmapData?.top_right?.lat,
  ];
  const { layers, deck } = useDeckGlLayers({
    bounds: orverlayBounds,
    image: orverlyaImage,
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
  const { centerLon, centerLat } = calculateCenter(orverlayBounds);
  const currentPosition = {
    lat: centerLat,
    lng: centerLon,
  };
  const { cameraProps, handleCameraChange } = useCameraProps(currentPosition);

  // 制限エリアをセット
  const bounds = {
    north: hazardmapData?.top_right?.lat, // 上側の緯度
    south: hazardmapData?.bottom_left?.lat, // 下側の緯度
    east: hazardmapData?.top_right?.lon, // 右側の経度
    west: hazardmapData?.bottom_left?.lon, // 左側の経度
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

  return (
    <>
      <Map
        style={{ width: '100vw', height: '100vh' }}
        {...cameraProps}
        onCameraChanged={handleCameraChange}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        mapId="c0ad196a416ee5f8"
      />
      <Marker position={{ lat: 35.687417, lng: 139.774006 }} />
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
