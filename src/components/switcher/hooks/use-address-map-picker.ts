import * as React from "react";
import { goongApi, GoongSuggestion } from "@/lib/api/goong";

interface UseAddressMapPickerProps {
  initialValue?: string;
  initialLat?: number;
  initialLng?: number;
  onChange?: (address: string) => void;
  onCoordinateChange?: (coords: { lat: number; lng: number } | null) => void;
}

export function useAddressMapPicker({
  initialValue = "",
  initialLat,
  initialLng,
  onChange,
  onCoordinateChange,
}: UseAddressMapPickerProps) {
  const [query, setQuery] = React.useState(initialValue);
  const [suggestions, setSuggestions] = React.useState<GoongSuggestion[]>([]);
  const [coordinates, setCoordinates] = React.useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const [isSearching, setIsSearching] = React.useState(false);
  const [sessionToken, setSessionToken] = React.useState("");

  // Initialize session token once on search start
  const getOrGenerateSessionToken = React.useCallback(() => {
    if (sessionToken) return sessionToken;
    const token = Math.random().toString(36).substring(2, 15);
    setSessionToken(token);
    return token;
  }, [sessionToken]);

  // Sync with initial values when they change (e.g. on loading edit dialog)
  React.useEffect(() => {
    if (initialValue !== undefined) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  React.useEffect(() => {
    if (initialLat && initialLng) {
      setCoordinates({ lat: initialLat, lng: initialLng });
    } else {
      setCoordinates(null);
    }
  }, [initialLat, initialLng]);

  // Debounced search for suggestions
  React.useEffect(() => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const token = getOrGenerateSessionToken();
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      const results = await goongApi.autocomplete(query, token);
      setSuggestions(results);
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query, getOrGenerateSessionToken]);

  const selectSuggestion = async (suggestion: GoongSuggestion) => {
    const address = suggestion.description;
    setQuery(address);
    setSuggestions([]);
    onChange?.(address);

    const detail = await goongApi.getPlaceDetail(suggestion.place_id, sessionToken);
    // Reset session token for the next transaction sequence
    setSessionToken("");

    if (detail && detail.geometry?.location) {
      const coords = {
        lat: detail.geometry.location.lat,
        lng: detail.geometry.location.lng,
      };
      setCoordinates(coords);
      onCoordinateChange?.(coords);
    }
  };

  const selectCoordinatesFromMap = async (lat: number, lng: number) => {
    const coords = { lat, lng };
    setCoordinates(coords);
    onCoordinateChange?.(coords);

    // Call reverse geocoding to retrieve address name
    const address = await goongApi.reverseGeocode(lat, lng);
    if (address) {
      setQuery(address);
      onChange?.(address);
    }
  };

  return {
    query,
    setQuery,
    suggestions,
    setSuggestions,
    coordinates,
    isSearching,
    selectSuggestion,
    selectCoordinatesFromMap,
  };
}
