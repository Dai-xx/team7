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

const GoogleMapsApi = () => {
  const map = useMap();
  const apiIsLoaded = useApiIsLoaded();

  const { data: tmpHzardmapData, isLoading } = useSWR(
    `/api/hazardmapApi`,
    axios
  );

  // const hazardmapData = hazardmapApiMock;
  const hazardmapData = tmpHzardmapData?.data;
  // console.log('tmpHzardmapData', tmpHzardmapData);

  // オーバーレイをセット
  const orverlyaImage = hazardmapData?.image
    ? `data:image/png;base64,${hazardmapData.image}`
    : '';

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
  console.log('bounds', bounds);
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
