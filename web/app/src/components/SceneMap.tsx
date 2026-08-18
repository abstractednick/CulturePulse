import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import type { Pulse } from "../lib/types";
import { CITY } from "../lib/api";

function pinIcon(pulse: Pulse) {
  const live = pulse.status === "live";
  const color = live ? "#FF4F8B" : "#D6FF3F";
  const html = `
    <div style="position:relative;width:28px;height:36px;">
      ${live ? `<span style="position:absolute;inset:4px;border-radius:99px;background:${color};opacity:.45;" class="pulse-dot"></span>` : ""}
      <svg width="28" height="36" viewBox="0 0 28 36">
        <path d="M14 34s12-12.2 12-20A12 12 0 1 0 2 14c0 7.8 12 20 12 20z" fill="${color}" />
        <circle cx="14" cy="13.5" r="5.2" fill="#050508"/>
      </svg>
    </div>`;
  return L.divIcon({ className: "cp-pin", html, iconSize: [28, 36], iconAnchor: [14, 34] });
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useMemo(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export default function SceneMap({
  pulses,
  selectedId,
  onSelect,
  center = CITY,
}: {
  pulses: Pulse[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  center?: { lat: number; lng: number };
}) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      className="h-full w-full"
      zoomControl={false}
      attributionControl
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter lat={center.lat} lng={center.lng} />
      {pulses.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={pinIcon(p)}
          opacity={selectedId && selectedId !== p.id ? 0.55 : 1}
          eventHandlers={{ click: () => onSelect(p.id) }}
        />
      ))}
    </MapContainer>
  );
}
