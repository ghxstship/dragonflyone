"use client";

import { forwardRef, useState, useEffect, useRef, useCallback } from "react";
import { addressInputVariants } from "./AddressInput.variants.js";
import type { AddressInputProps, AddressData } from "./AddressInput.types.js";

// Global script loading state
let googleMapsLoaded = false;
let googleMapsLoading = false;
const loadCallbacks: (() => void)[] = [];

// Parse address components from Google Places result
function parseAddressComponents(
  components: google.maps.GeocoderAddressComponent[]
): Partial<AddressData> {
  const result: Partial<AddressData> = {};

  for (const component of components) {
    const types = component.types;

    if (types.includes("street_number")) {
      result.streetNumber = component.long_name;
    }
    if (types.includes("route")) {
      result.street = component.long_name;
    }
    if (types.includes("locality") || types.includes("sublocality")) {
      result.city = component.long_name;
    }
    if (types.includes("administrative_area_level_1")) {
      result.state = component.long_name;
      result.stateCode = component.short_name;
    }
    if (types.includes("country")) {
      result.country = component.long_name;
      result.countryCode = component.short_name;
    }
    if (types.includes("postal_code")) {
      result.postalCode = component.long_name;
    }
  }

  return result;
}

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (googleMapsLoaded) {
      resolve();
      return;
    }

    if (googleMapsLoading) {
      loadCallbacks.push(() => resolve());
      return;
    }

    googleMapsLoading = true;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      googleMapsLoaded = true;
      googleMapsLoading = false;
      resolve();
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
    };

    script.onerror = () => {
      googleMapsLoading = false;
      reject(new Error("Failed to load Google Maps script"));
    };

    document.head.appendChild(script);
  });
}

/**
 * AddressInput - Address input with Google Places Autocomplete
 * Bold Contemporary Pop Art Adventure Design System
 */
export const AddressInput = forwardRef<HTMLInputElement, AddressInputProps>(
  function AddressInput(
    {
      value = "",
      onChange,
      onAddressSelect,
      error,
      errorMessage,
      fullWidth,
      inverted = false,
      restrictCountries,
      types = ["address"],
      apiKey,
      className,
      placeholder = "Start typing an address...",
      size = "md" as const,
      ...props
    },
    ref
  ) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const [inputValue, setInputValue] = useState(value);
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Get API key from props or environment
    const resolvedApiKey = apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    // Sync external value changes
    useEffect(() => {
      setInputValue(value);
    }, [value]);

    // Load Google Maps script
    useEffect(() => {
      if (!resolvedApiKey) {
        setLoadError("Google Maps API key not configured");
        return;
      }

      loadGoogleMapsScript(resolvedApiKey)
        .then(() => setIsLoaded(true))
        .catch((err) => setLoadError(err.message));
    }, [resolvedApiKey]);

    // Initialize autocomplete
    useEffect(() => {
      if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

      const options: google.maps.places.AutocompleteOptions = {
        types,
        fields: ["address_components", "formatted_address", "geometry", "place_id"],
      };

      if (restrictCountries && restrictCountries.length > 0) {
        options.componentRestrictions = { country: restrictCountries };
      }

      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, options);
      autocompleteRef.current = autocomplete;

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (!place.formatted_address) return;

        const addressData: AddressData = {
          formattedAddress: place.formatted_address,
          placeId: place.place_id,
          ...parseAddressComponents(place.address_components || []),
        };

        if (place.geometry?.location) {
          addressData.lat = place.geometry.location.lat();
          addressData.lng = place.geometry.location.lng();
        }

        setInputValue(place.formatted_address);
        onChange?.(place.formatted_address);
        onAddressSelect?.(addressData);
      });

      return () => {
        if (autocompleteRef.current) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current);
          autocompleteRef.current = null;
        }
      };
    }, [isLoaded, types, restrictCountries, onChange, onAddressSelect]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange?.(newValue);
      },
      [onChange]
    );

    // Combine refs
    const setRefs = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    const inputStyles = addressInputVariants({
      size,
      error,
      errorInverted: error && inverted,
      inverted,
      fullWidth,
      className,
    });

    return (
      <div className={`relative ${fullWidth ? "w-full" : "w-auto"}`}>
        <div className="relative">
          <input
            ref={setRefs}
            type="text"
            value={inputValue}
            onChange={handleChange}
            placeholder={placeholder}
            className={inputStyles}
            autoComplete="off"
            {...props}
          />
          {/* Loading indicator */}
          {!isLoaded && !loadError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div
                className={`size-4 animate-spin rounded-full border-2 border-t-transparent ${
                  inverted ? "border-border" : "border-border"
                }`}
              />
            </div>
          )}
          {/* Location icon when loaded */}
          {isLoaded && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className={`size-4 ${inverted ? "text-text-disabled" : "text-text-muted"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Error Message */}
        {(error && errorMessage) || loadError ? (
          <p
            className={`mt-1 text-mono-xs ${
              inverted ? "text-error-400" : "text-error-500"
            }`}
          >
            {errorMessage || loadError}
          </p>
        ) : null}
      </div>
    );
  }
);

// Address validation utilities
export const addressValidation = {
  /**
   * Check if address has required components
   */
  isComplete: (address: AddressData): boolean => {
    return !!(address.city && address.country);
  },

  /**
   * Check if address has coordinates
   */
  hasCoordinates: (address: AddressData): boolean => {
    return typeof address.lat === "number" && typeof address.lng === "number";
  },

  /**
   * Format address for display
   */
  format: (address: AddressData, style: "short" | "full" = "short"): string => {
    if (style === "full") {
      return address.formattedAddress;
    }

    const parts = [];
    if (address.city) parts.push(address.city);
    if (address.stateCode || address.state) parts.push(address.stateCode || address.state);
    if (address.countryCode || address.country) parts.push(address.countryCode || address.country);

    return parts.join(", ");
  },

  /**
   * Get validation error
   */
  getError: (address: AddressData | null): string | null => {
    if (!address) return null;
    if (!address.city) return "Please select a complete address with city";
    if (!address.country) return "Please select a complete address with country";
    return null;
  },
};
