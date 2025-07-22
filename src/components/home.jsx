import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { ArrowPathIcon, MapPinIcon, MagnifyingGlassIcon  } from "@heroicons/react/24/outline"; 
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAPBOX_TOKEN } from "../config";




const DEFAULT_CENTER = [49.26015840394259, -123.11498748675584];
const DEFAULT_ZOOM   = 13;

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
          map.locate({ setView: true, maxZoom: DEFAULT_ZOOM });
        }}
        className="bg-black/75 p-6 rounded-full shadow-lg hover:outline-none hover:ring-3 hover:ring-blue-500"
      >
        <MapPinIcon className="w-12 h-12 text-gray-300" />
      </button>
    </div>
  );
}


function SearchBar() {
  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 rounded-lg ">
      <input
        type="text"
        placeholder="Enter Bus # / Bus stop"
        className={"px-4 py-5 text-lg rounded-full shadow w-75 text-white bg-black/75 focus:outline-none focus:ring-3 focus:ring-blue-500"}
      />
      <MagnifyingGlassIcon
        className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none"
      />
    </div>
  );
}


export default function Home() {
  return (
    <div className="relative w-full h-full ">
      {/* Mapbox raster tiles using Leaflet so no WebGL needed */}
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
      </MapContainer>
      

        {/*  search bar overlay */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000]">
        <SearchBar />
      </div>
        
      </div>
      

    
  );
}
