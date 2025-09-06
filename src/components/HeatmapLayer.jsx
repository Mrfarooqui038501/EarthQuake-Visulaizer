import { useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet.heat";

export default function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Create heatmap layer
    const heatLayer = L.heatLayer(points, {
      radius: 20,
      blur: 15,
      maxZoom: 7,
    }).addTo(map);

    // Cleanup on unmount
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}
