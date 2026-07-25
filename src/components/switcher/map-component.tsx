"use client";

import * as React from "react";
import goongjs from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";

interface MapComponentProps {
  markerCoords: { lat: number; lng: number } | null;
  onMapClick: (lat: number, lng: number) => void;
}

const DEFAULT_CENTER: [number, number] = [106.7009, 10.7769]; // [lng, lat] for TP.HCM

export default function MapComponent({ markerCoords, onMapClick }: MapComponentProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<any | null>(null);
  const markerRef = React.useRef<any | null>(null);

  // Initialize Map
  React.useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const goongTileKey = process.env.NEXT_PUBLIC_GOONG_MAPTILES_KEY || "";
    goongjs.accessToken = goongTileKey;

    const initialCenter = markerCoords
      ? [markerCoords.lng, markerCoords.lat]
      : DEFAULT_CENTER;
    const initialZoom = markerCoords ? 15 : 12;

    const map = new goongjs.Map({
      container: mapContainerRef.current,
      style: "https://tiles.goong.io/assets/goong_map_web.json",
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: true,
    });

    mapRef.current = map;

    // Set up click listener
    map.on("click", (e: any) => {
      const { lat, lng } = e.lngLat;
      onMapClick(lat, lng);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // Run once on mount

  // Sync Marker and flyTo position when markerCoords changes
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (markerCoords) {
      const coords: [number, number] = [markerCoords.lng, markerCoords.lat];

      if (markerRef.current) {
        markerRef.current.setLngLat(coords);
      } else {
        const marker = new goongjs.Marker().setLngLat(coords).addTo(map);
        markerRef.current = marker;
      }

      // Smooth pan/zoom to coordinates
      map.flyTo({
        center: coords,
        zoom: 16,
        duration: 1500,
        essential: true,
      });
    } else {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    }
  }, [markerCoords]);

  return <div ref={mapContainerRef} className="h-full w-full rounded-md border" />;
}
