import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { ArrowPathIcon, MapPinIcon, MagnifyingGlassIcon  } from "@heroicons/react/24/outline"; 
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAPBOX_TOKEN } from "../config";
import { searchStopsAndRoutes, preloadCache } from "../translink/Utils";
import { preloadGTFSData } from "../translink/translinkStaticData";
import { useEffect, useState } from 'react'
import { BusStops, BusStopPopup } from "./busStops";
import { RouteStopPopup } from "./routeData";
import { NotificationAPIProvider } from '@notificationapi/react'
// import NotificationButton from './notifyButton'


const DEFAULT_CENTER = [49.26015840394259, -123.11498748675584];
const DEFAULT_ZOOM   = 15;

// Fixes Leaflet’s default icon URLs under Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL(
    "leaflet/dist/images/marker-icon-2x.png",
    import.meta.url
  ).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url)
    .href,
  shadowUrl: new URL(
    "leaflet/dist/images/marker-shadow.png",
    import.meta.url
  ).href,
});


function MapControls() {
  const map = useMap();

  return (
    <div className="absolute bottom-20 right-20 z-[1000] flex flex-col space-y-2 pointer-events-auto">
      {/* Recenter to DEFAULT_CENTER AKA Vancouver */}
      <button
        onClick={() => map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)}
        className="bg-black/75 p-6 rounded-full shadow-lg hover:outline-none hover:ring-3 hover:ring-blue-500"
      >
        <ArrowPathIcon className="w-12 h-12 text-gray-300" />
      </button>

      {/* Geolocate */}
      <button
        onClick={() => {
          map.locate({ setView: false, maxZoom: DEFAULT_ZOOM, enableHighAccuracy: true, timeout: 10000 });

          map.once("locationfound", (e) => {
              const { latlng, accuracy } = e;
            map.setView(latlng, DEFAULT_ZOOM);

            const _circle = L.circle(latlng, { radius: accuracy }).addTo(map);
            const marker = L.marker(latlng, { zIndexOffset: 1000 }).addTo(map);
            marker.bindPopup(`
            <div style="background-color: rgba(0, 0, 0, 0.75); color: #fff; padding: 8px; border-radius: 4px; max-width: 200px;">
            <strong>You are here!</strong><br/>
            Accuracy: ${accuracy.toFixed(0)} m<br/>
            <em>(Desktop geolocation can be off by tens of meters.)</em>
            </div>
          `).openPopup();
   });


  }}
  className="bg-black/75 p-6 rounded-full shadow-lg hover:outline-none hover:ring-3 hover:ring-blue-500"
>
  <MapPinIcon className="w-12 h-12 text-gray-300" />
</button>
    </div>
  );
}

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        try {
          const searchResults = searchStopsAndRoutes(searchTerm);
          setResults(searchResults);
          setShowResults(true);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 50); // 50ms delay between searches, stops excessive searching

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleResultClick = (result) => {
    setShowResults(false);

    if (result.type === 'stop_code') {
      setSelectedStop({
        enabled: true,
        stopId: result.internal_id,
        stopName: result.name
      });
    }
    else {
      setSelectedBus({
        enabled: true,
        routeId: result.internal_id,
        busName: result.name
      });
    }
  };

  const handleFocus = () => {
    if (results.length > 0) {
      setShowResults(true);

      setSelectedStop(null);
      setSelectedBus(null);
    }
  };

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 rounded-lg ">
      <div className="relative">
      <input
        type="text"
        placeholder="Enter Bus # / Bus stop"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleFocus}
        className={"px-4 py-5 text-lg rounded-full shadow w-75 text-white bg-black/75 focus:outline-none focus:ring-3 focus:ring-blue-500"}
      />
      <MagnifyingGlassIcon
        className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none"
      />
    </div>

    {/* search result */}
    {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700 overflow-hidden z-50">
          {results.map((result, index) => (
            <div
              key={`${result.type || 'unknown'}-${result.id || index}`}
              onClick={() => handleResultClick(result)}
              className="flex justify-between items-center px-4 py-3 hover:bg-white/10 cursor-pointer border-b border-gray-700 last:border-b-0 transition-colors"
            >
              {/* type id indicator (route or bus stop) */}
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  result.type === 'stop_code' 
                    ? 'bg-blue-500/20 text-blue-300' 
                    : 'bg-green-500/20 text-green-300'
                }`}>
                  {result.type === 'stop_code' ? 'Stop' : 'Route'}
                </span>
                <span className="text-white font-semibold text-lg">
                  {result.id}
                </span>
              </div>

              {/* name, if too long, cuts it off */}
              <div className="text-gray-300 text-sm text-right flex-1 ml-4 truncate">
                {result.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* no results */}
      {showResults && searchTerm.trim() && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700 px-4 py-3 z-50">
          <div className="text-gray-400 text-center">
              {`No results found for "${searchTerm}"`}
          </div>
        </div>
      )}


      {/* bus stop results */}
      {selectedStop?.enabled && !showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-transparent z-50">
          <BusStopPopup stopId={selectedStop.stopId} stopName={selectedStop.stopName} />
        </div>
      )}

      {/* route results */}
      {selectedBus?.enabled && !showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-transparent z-50">
          <RouteStopPopup routeID={selectedBus.routeId} busName={selectedBus.busName} />
        </div>
      )}
    </div>
  );
}


export default function Home() {
  const [dataLoaded, setDataLoaded] = useState(false);

  // preload our caches, and only once
  useEffect(() => {
    const loadData = async () => {
      try {
        await preloadGTFSData();
        await preloadCache();
        setDataLoaded(true);
      } catch (error) {
        console.error('Error preloading data:', error);
      }
    };

    loadData();
  }, []);

  return (
    <div className="relative w-full h-full ">
      {/* Mapbox raster tiles using Leaflet so no WebGL needed */}
      <NotificationAPIProvider
          userId="kris68008@gmail.com"
          clientId="swb4o3lvct1xlz34ep6xeq8e4m"
          apiURL= "api.ca.notificationapi.com"
          wsURL= "ws.ca.notificationapi.com"
          webPushOptInMessage={true} // Default is "Automatic" Can also use Boolean value
          customServiceWorkerPath="/notificationapi-service-worker.js" //optional
        >
        <MapContainer
          center={DEFAULT_CENTER} 
          zoom={DEFAULT_ZOOM}
          className="w-full h-full z-0"
          
        >

          <TileLayer
            url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`}
            attribution='© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © OpenStreetMap'
          />
          <MapControls />
          <BusStops dataLoaded={dataLoaded} />
        </MapContainer>
        

          {/*  search bar overlay */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000]">
          <SearchBar />
        </div>
        </NotificationAPIProvider>
      </div>
      

    
  );
}
