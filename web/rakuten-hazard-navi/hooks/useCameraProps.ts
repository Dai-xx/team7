// hooks/useCameraProps.ts
import { useCallback, useState } from 'react';
import {
  MapCameraChangedEvent,
  MapCameraProps,
} from '@vis.gl/react-google-maps';

export const useCameraProps = (initialCenter: { lat: number; lng: number }) => {
  const INITIAL_CAMERA: MapCameraProps = {
    center: initialCenter,
    zoom: 12,
  };

  const [cameraProps, setCameraProps] =
    useState<MapCameraProps>(INITIAL_CAMERA);

  const handleCameraChange = useCallback(
    (ev: MapCameraChangedEvent) => setCameraProps(ev.detail),
    []
  );

  return {
    cameraProps,
    handleCameraChange,
  };
};
