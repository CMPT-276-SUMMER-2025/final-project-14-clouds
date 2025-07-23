import { Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { getAllStops, getStopTimes, getBusName, getRouteLongName } from '../translink/translinkStaticData';
import { getNextBusesForStop } from '../translink/translinkAPI';

// TEMP ICON
const busStopIcon = new L.divIcon({
  className: '',
  html: `
    <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md text-lg">
      🚌
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function BusStopPopup({ stopId, stopName }) {
  const [arrivals, setArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const refresh = async () => {
    setLoading(true);
    // check API first, if nothing is returned, default on static data
    let result = await getNextBusesForStop(stopId);
    console.log(result)

    // defaulting to static data
    if (!result || result.length === 0) {
      // get today's date, static data doesn't have todays current date, so we just manually add that
      const today = new Date();

      result = getStopTimes(stopId).map((item) => ({
        arrival_time: new Date(`${today.toISOString().split('T')[0]}T${item.arrival_time}`),
        route_short_name: item.route_short_name || '',
        route_long_name: item.route_long_name || '',
      }));
    }

    console.log(result)

    // convert times to date
    result = result.map((r) => ({
      ...r,
      arrival_time:
        r.arrival_time instanceof Date
          ? r.arrival_time
          : new Date(r.arrival_time),
    }));

    setArrivals(result);
    setLastUpdated(Date.now());
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(() => setLastUpdated(Date.now()), 30 * 1000);
    return () => clearInterval(interval);
  }, [stopId]);

  // tells us when the bus comes
  const getCountdown = (arrivalTime) => {
    const diff = Math.round((arrivalTime - Date.now()) / 60000);
    return diff <= 0 ? 'Now' : `in ${diff} min`;
  };

  return (
    <div className="bg-black/90 rounded-lg shadow-lg text-white text-sm p-3 space-y-2 min-w-[220px] max-w-[300px]">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold text-base text-white">{stopName}</div>
          <div className="text-gray-400 text-xs">Stop ID: {stopId}</div>
        </div>
        <button
          onClick={refresh}
          className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded-md text-white"
        >
          Refresh
        </button>
      </div>

      {loading && <div className="text-gray-400">Loading arrivals...</div>}

      {!loading && arrivals.length === 0 && (
        <div className="text-gray-400">No upcoming buses</div>
      )}

      {!loading && arrivals.length > 0 && (
        <div className="space-y-2">
          {arrivals.slice(0, 5).map((arrival, i) => (
            <div
              key={i}
              className="flex justify-between items-center border-b border-gray-700 last:border-0 pb-1"
            >
              <div className="flex flex-col">
                <span className="bg-blue-500/20 text-blue-300 font-medium px-2 py-0.5 rounded-full text-xs inline-block w-fit">
                  {arrival?.route_short_name || getBusName(arrival.route_id)}
                </span>
                <span className="text-gray-400 text-xs truncate max-w-[150px]">
                  {arrival?.route_long_name || getRouteLongName(arrival.route_id)}
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-white text-sm font-semibold">
                  {arrival.arrival_time.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="text-gray-400 text-xs">
                  {getCountdown(arrival.arrival_time)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// function to render all bus stops
export function BusStops({ dataLoaded }) {
  const [allStops, setAllStops] = useState([]);
  const [visibleStops, setVisibleStops] = useState([]);
  const map = useMap();

  // had a problem where data wasnt loaded and we tried to render, so this just makes sure its rendered before we draw
  useEffect(() => {
    if (!dataLoaded) return;

    try {
      const stops = getAllStops();
      setAllStops(stops);
    } catch (error) {
      console.error('Error loading bus stops:', error);
    }
  }, [dataLoaded]);

  useEffect(() => {
    if (!map || allStops.length === 0) return;

    const updateVisibleStops = () => {
      const bounds = map.getBounds();
      const filtered = allStops.filter(stop => {
        return (
          stop.stop_lat &&
          stop.stop_lon &&
          bounds.contains([stop.stop_lat, stop.stop_lon])
        );
      });
      setVisibleStops(filtered);
    };

    updateVisibleStops();
    map.on('moveend', updateVisibleStops);
    return () => {
      map.off('moveend', updateVisibleStops);
    };
  }, [map, allStops]);

  if (visibleStops.length === 0) return null;

  return (
    <MarkerClusterGroup chunkedLoading>
      {visibleStops.map((stop) => (
        <Marker
          key={stop.stop_id}
          position={[stop.stop_lat, stop.stop_lon]}
          icon={busStopIcon}
        >
          <Popup>
            <BusStopPopup stopId={stop.stop_id} stopName={stop.stop_name} />
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
}