// useInfoWindow.ts
import { useCallback, useState } from 'react';
import { useAdvancedMarkerRef } from '@vis.gl/react-google-maps';

export const useInfoWindow = () => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoWindowData, setInfoWindowData] = useState<{
    index: number | null;
  } | null>(null);

  const handleMarkerClick = useCallback((index: number) => {
    setInfoWindowData((prev) => (prev?.index === index ? null : { index }));
  }, []);

  const handleClose = useCallback(() => {
    setInfoWindowData(null);
  }, []);

  return {
    markerRef,
    marker,
    infoWindowData,
    handleMarkerClick,
    handleClose,
  };
};
