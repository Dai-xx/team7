// hooks/useDeckGlLayers.ts
import { useMemo } from 'react';
import { BitmapLayer } from '@deck.gl/layers';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';

interface UseDeckGlLayersProps {
  bounds: [number, number, number, number]; // ここで形式を指定
  image: string;
}

export const useDeckGlLayers = ({ bounds, image }: UseDeckGlLayersProps) => {
  const bitmapLayer = useMemo(
    () =>
      new BitmapLayer({
        id: 'bitmap-layer',
        bounds, // LON(経度), LAT(緯度)の順
        image, // ラスターデータのURL
      }),
    [bounds, image]
  );

  const layers = useMemo(() => [bitmapLayer], [bitmapLayer]);
  const deck = useMemo(
    () => new GoogleMapsOverlay({ interleaved: true }),
    [layers]
  );

  return { layers, deck };
};
