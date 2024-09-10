import { AdvancedMarker, APIProvider, InfoWindow, Map, useMap} from "@vis.gl/react-google-maps";
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { BitmapLayer } from '@deck.gl/layers';
import { useEffect, useMemo } from "react";



const positionAkiba = {
  lat: 35.69731,
  lng: 139.7747,
};

const positonTokyoTower = {
  lat: 35.4550426,
  lng: 139.6312741
}

const center = {
  lat: 35.69575,
  lng: 139.77521,
};

const divStyle = {
  background: "white",
  fontSize: 7.5,
};

const DeckGlOverlay = ({ layers }) => {
  const deck = useMemo(() => new GoogleMapsOverlay({ interleaved: true }), []);
  const map = useMap();

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

  return null;
};

const LAT_LEFT_UP = 35.442770925857666
const LON_LEFT_UP = 139.6142578125
const LAT_RIGHT_DOWN = 35.4606699514953
const LON_RIGHT_DOWN = 139.63623046875

const GoogleMapsApi = () => {

    // ラスターデータを表示するためのBitmapLayer
  const bitmapLayer = new BitmapLayer({
    id: 'bitmap-layer',
    bounds: [LON_LEFT_UP, LAT_LEFT_UP, LON_RIGHT_DOWN, LAT_RIGHT_DOWN], // LON(経度), LAT(緯度)の順
    image: 'https://cyberjapandata.gsi.go.jp/xyz/std/14/14546/6464.png',  // ラスターデータのURL
  });

  const deckGlLayers = [bitmapLayer];

  return (
   <APIProvider apiKey="AIzaSyAvwRzItbKjCTwc9yl9BJmpU_xzLgCi6Xg">
     <DeckGlOverlay layers={deckGlLayers} />
    <Map
      style={{width: '100vw', height: '100vh'}}
      defaultCenter={positonTokyoTower}
      defaultZoom={12}
      gestureHandling={'greedy'}
      disableDefaultUI={true}
      mapId="c0ad196a416ee5f8"
    />
     <AdvancedMarker position={positonTokyoTower} >
     <div className="bg-blue-700 w-[50px] h-[50px] rounded-full"></div>
     </AdvancedMarker>
     <InfoWindow position={positonTokyoTower}>
       <div style={divStyle}>
            <h1>秋葉原オフィス</h1>
        </div>
     </InfoWindow>
  </APIProvider>
 
  );
};

export default GoogleMapsApi;



