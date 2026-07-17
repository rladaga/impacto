import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address + ", Barcelona"
      )}&limit=1`,
      {
        headers: {
          "User-Agent": "Impacto-App",
        },
      }
    );

    const data = await response.json();

    if (data && data[0]) {
      return NextResponse.json({
        lng: parseFloat(data[0].lon),
        lat: parseFloat(data[0].lat),
      });
    }

    return NextResponse.json(
      { lng: 2.1728, lat: 41.3851 }, // Barcelona center as fallback
      { status: 200 }
    );
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json(
      { lng: 2.1728, lat: 41.3851 }, // Barcelona center as fallback
      { status: 200 }
    );
  }
}
