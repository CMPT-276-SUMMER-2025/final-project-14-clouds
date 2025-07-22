import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAPBOX_TOKEN } from "../config";

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

export default function Home() {
  return (
    <div className="relative w-full h-full ">
      {/* Mapbox raster tiles using Leaflet so no WebGL needed */}
      <MapContainer
        center={[49.26015840394259, -123.11498748675584]} 
        zoom={13}
        className="w-full h-full z-0"
      >
        <TileLayer
          url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`}
          attribution='© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © OpenStreetMap'
        />

      </MapContainer>

      
    </div>
  );
}
