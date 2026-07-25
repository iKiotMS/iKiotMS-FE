"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAddressMapPicker } from "./hooks/use-address-map-picker";
import { Search, MapPin, Loader2 } from "lucide-react";

// Dynamically import Goong MapComponent to disable server-side rendering (SSR)
const MapComponent = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[250px] w-full items-center justify-center rounded-md border bg-muted animate-pulse">
      <div className="flex flex-col items-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Đang tải bản đồ...</span>
      </div>
    </div>
  ),
});

interface AddressMapPickerProps {
  value?: string;
  onChange: (address: string) => void;
  initialLat?: number;
  initialLng?: number;
  onCoordinateChange: (coords: { lat: number; lng: number } | null) => void;
}

export function AddressMapPicker({
  value = "",
  onChange,
  initialLat,
  initialLng,
  onCoordinateChange,
}: AddressMapPickerProps) {
  const {
    query,
    setQuery,
    suggestions,
    isSearching,
    selectSuggestion,
    coordinates,
    selectCoordinatesFromMap,
  } = useAddressMapPicker({
    initialValue: value,
    initialLat,
    initialLng,
    onChange,
    onCoordinateChange,
  });

  const [isFocused, setIsFocused] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close suggestions dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="space-y-3 relative">
      {/* Address search box */}
      <div className="relative">
        <Input
          placeholder="Nhập địa chỉ để tìm kiếm vị trí..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value); // Let react-hook-form sync value instantly
          }}
          onFocus={() => setIsFocused(true)}
          className="pr-10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-muted-foreground">
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>

        {/* Suggestions Autocomplete Dropdown */}
        {isFocused && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-popover text-popover-foreground rounded-md border shadow-lg p-1 animate-in fade-in-50 slide-in-from-top-1">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.place_id}
                onClick={() => {
                  selectSuggestion(suggestion);
                  setIsFocused(false);
                }}
                className="cursor-pointer px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground flex items-start gap-2.5 transition-colors"
              >
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {suggestion.structured_formatting?.main_text || suggestion.description}
                  </span>
                  {suggestion.structured_formatting?.secondary_text && (
                    <span className="text-xs text-muted-foreground">
                      {suggestion.structured_formatting.secondary_text}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map rendering container */}
      <div className="h-[250px] w-full relative">
        <MapComponent
          markerCoords={coordinates}
          onMapClick={selectCoordinatesFromMap}
        />
      </div>

      {/* Coordinates indicators Badge display */}
      <div className="flex flex-wrap gap-2 pt-0.5">
        <Badge variant="info" className="px-2.5 py-1 text-xs">
          Vĩ độ: {coordinates ? coordinates.lat.toFixed(6) : "Chưa chọn"}
        </Badge>
        <Badge variant="info" className="px-2.5 py-1 text-xs">
          Kinh độ: {coordinates ? coordinates.lng.toFixed(6) : "Chưa chọn"}
        </Badge>
      </div>
    </div>
  );
}
