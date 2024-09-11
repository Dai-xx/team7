// useInfoWindow.ts
import { useCallback, useState } from "react";
import { useAdvancedMarkerRef } from "@vis.gl/react-google-maps";

export const useInfoWindow = () => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoWindowShown, setInfoWindowShown] = useState(false);

  const handleMarkerClick = useCallback(
    () => setInfoWindowShown((isShown) => !isShown),
    [],
  );

  const handleClose = useCallback(() => setInfoWindowShown(false), []);

  return {
    markerRef,
    marker,
    infoWindowShown,
    handleMarkerClick,
    handleClose,
  };
};
