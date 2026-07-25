import axios from "axios";

export interface GoongSuggestion {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

export interface GoongDetail {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  formatted_address?: string;
  name?: string;
}

const GOONG_API_KEY = process.env.NEXT_PUBLIC_GOONG_API_KEY || "";

export const goongApi = {
  autocomplete: async (input: string, sessionToken?: string): Promise<GoongSuggestion[]> => {
    if (!input || !GOONG_API_KEY) return [];
    try {
      const response = await axios.get("https://rsapi.goong.io/place/autocomplete", {
        params: {
          api_key: GOONG_API_KEY,
          input,
          sessiontoken: sessionToken,
        },
      });
      return response.data?.predictions || [];
    } catch (error) {
      console.error("Goong Autocomplete error:", error);
      return [];
    }
  },

  getPlaceDetail: async (placeId: string, sessionToken?: string): Promise<GoongDetail | null> => {
    if (!placeId || !GOONG_API_KEY) return null;
    try {
      const response = await axios.get("https://rsapi.goong.io/place/detail", {
        params: {
          api_key: GOONG_API_KEY,
          place_id: placeId,
          sessiontoken: sessionToken,
        },
      });
      return response.data?.result || null;
    } catch (error) {
      console.error("Goong Place Detail error:", error);
      return null;
    }
  },

  reverseGeocode: async (lat: number, lng: number): Promise<string> => {
    if (!lat || !lng || !GOONG_API_KEY) return "";
    try {
      const response = await axios.get("https://rsapi.goong.io/Geocode", {
        params: {
          api_key: GOONG_API_KEY,
          latlng: `${lat},${lng}`,
        },
      });
      return response.data?.results?.[0]?.formatted_address || "";
    } catch (error) {
      console.error("Goong Reverse Geocode error:", error);
      return "";
    }
  },
};
