import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";
import HeatmapLayer from "./HeatmapLayer";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function FlyToLocation({ coordinates }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates) {
      map.flyTo(coordinates, 6, { duration: 2 });
    }
  }, [coordinates, map]);
  return null;
}

export default function EarthquakeMap({ data, viewMode, selected }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No earthquake data available.
      </div>
    );
  }

  const heatmapPoints = data.map((eq) => [
    eq.coordinates[0], // lat
    eq.coordinates[1], // lng
    eq.magnitude / 10, // intensity
  ]);

  return (
    <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {viewMode === "markers" &&
        data.map((eq) => (
          <Marker key={eq.id} position={eq.coordinates}>
            <Popup>
              <div className="text-sm">
                <h2 className="font-bold text-red-600">Magnitude {eq.magnitude}</h2>
                <p>{eq.place}</p>
                <p className="text-gray-600">Depth: {eq.depth} km</p>
                <p className="text-gray-500 text-xs">{eq.time}</p>
              </div>
            </Popup>
          </Marker>
        ))}

      {viewMode === "heatmap" && <HeatmapLayer points={heatmapPoints} />}

      {selected && <FlyToLocation coordinates={selected.coordinates} />}
    </MapContainer>
  );
}
