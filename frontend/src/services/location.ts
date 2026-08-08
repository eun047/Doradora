export function watchLocation(
  onSuccess: (position: GeolocationPosition) => void,
  onError?: (error: GeolocationPositionError) => void,
) {
  const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 10000,
  });

  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}
