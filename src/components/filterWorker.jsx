
self.onmessage = async function (e) {
  const { stops, bounds } = e.data;

  const visible = await stops.filter(stop => {
    const lat = stop.stop_lat;
    const lon = stop.stop_lon;
    return (
      lat >= bounds._southWest.lat &&
      lat <= bounds._northEast.lat &&
      lon >= bounds._southWest.lng &&
      lon <= bounds._northEast.lng
    );
  });
  

  self.postMessage(visible);
};
