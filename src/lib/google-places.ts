export type GoogleAddressSuggestion = {
  placeId: string;
  label: string;
  mainText: string;
  secondaryText: string;
};

function getApiKey(): string {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new Error(
      "Google Maps API key is not configured. Add GOOGLE_MAPS_API_KEY to your .env file."
    );
  }
  return key;
}

export async function googlePlacesAutocomplete(
  input: string,
  sessionToken?: string
): Promise<GoogleAddressSuggestion[]> {
  const apiKey = getApiKey();

  const body: Record<string, unknown> = {
    input,
    includedRegionCodes: ["gb"],
    languageCode: "en-GB",
  };

  if (sessionToken) {
    body.sessionToken = sessionToken;
  }

  const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Google Autocomplete error:", err);
    throw new Error("Google address search failed");
  }

  const data = (await res.json()) as {
    suggestions?: Array<{
      placePrediction?: {
        placeId?: string;
        place?: string;
        text?: { text?: string };
        structuredFormat?: {
          mainText?: { text?: string };
          secondaryText?: { text?: string };
        };
      };
    }>;
  };

  return (data.suggestions ?? [])
    .map((s) => s.placePrediction)
    .filter(Boolean)
    .map((prediction) => {
      const placeId =
        prediction!.placeId ??
        prediction!.place?.replace(/^places\//, "") ??
        "";
      const mainText = prediction!.structuredFormat?.mainText?.text ?? "";
      const secondaryText = prediction!.structuredFormat?.secondaryText?.text ?? "";
      const label = prediction!.text?.text ?? [mainText, secondaryText].filter(Boolean).join(", ");

      return { placeId, label, mainText, secondaryText };
    })
    .filter((s) => s.placeId && s.label);
}

export async function googlePlaceDetails(
  placeId: string,
  sessionToken?: string
): Promise<{ formattedAddress: string; postcode: string }> {
  const apiKey = getApiKey();
  const resourceName = placeId.startsWith("places/") ? placeId : `places/${placeId}`;

  const url = new URL(`https://places.googleapis.com/v1/${resourceName}`);
  if (sessionToken) {
    url.searchParams.set("sessionToken", sessionToken);
  }

  const res = await fetch(url.toString(), {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "formattedAddress,addressComponents",
    },
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Google Place Details error:", err);
    throw new Error("Could not load address details");
  }

  const data = (await res.json()) as {
    formattedAddress?: string;
    addressComponents?: Array<{ longText?: string; shortText?: string; types?: string[] }>;
  };

  const postcode =
    data.addressComponents?.find((c) => c.types?.includes("postal_code"))?.longText ?? "";

  return {
    formattedAddress: data.formattedAddress ?? "",
    postcode,
  };
}
