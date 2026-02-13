"use client";

import React, { useState, useEffect } from "react";
import maplibregl from "maplibre-gl";

interface StyleGroup {
  id: string;
  label: string;
  property: string;
  layers: string[];
}

// Define which layers belong to which logical group for editing
const STYLE_GROUPS: StyleGroup[] = [
  {
    id: "background",
    label: "Fondo",
    property: "background-color",
    layers: ["background"],
  },
  {
    id: "water",
    label: "Masas de agua",
    property: "fill-color",
    layers: ["water", "landcover_ice_shelf", "landcover_glacier"],
  },
  {
    id: "waterway",
    label: "Ríos / Canales",
    property: "line-color",
    layers: ["waterway"],
  },
  {
    id: "parks",
    label: "Parques / Bosques",
    property: "fill-color",
    layers: ["landuse_park", "landcover_wood"],
  },
  {
    id: "buildings",
    label: "Edificios",
    property: "fill-color",
    layers: ["building"],
  },

  {
    id: "roads_main",
    label: "Carreteras Principales",
    property: "line-color",
    layers: ["highway_major_inner", "highway_motorway_inner"],
  },
  {
    id: "roads_casing",
    label: "Bordes Carreteras",
    property: "line-color",
    layers: ["highway_major_casing", "highway_motorway_casing"],
  },
  {
    id: "roads_secondary",
    label: "Carreteras Secundarias",
    property: "line-color",
    layers: ["highway_minor", "highway_path"],
  },
  {
    id: "boundaries",
    label: "Fronteras",
    property: "line-color",
    layers: ["boundary_state", "boundary_country_z0-4", "boundary_country_z5-"],
  },
  {
    id: "text_places",
    label: "Textos (Lugares)",
    property: "text-color",
    layers: [
      "place_country_major",
      "place_country_minor",
      "place_country_other",
      "place_state",
      "place_city_large",
      "place_city",
      "place_town",
      "place_village",
      "place_other",
      "place_suburb",
    ],
  },
  {
    id: "text_roads",
    label: "Textos (Carreteras)",
    property: "text-color",
    layers: ["highway_name_other", "highway_name_motorway"],
  },
  {
    id: "railways",
    label: "Vías de tren",
    property: "line-color",
    layers: [
      "railway",
      "railway_dashline",
      "railway_transit",
      "railway_transit_dashline",
      "railway_minor",
      "railway_minor_dashline",
    ],
  },
  {
    id: "markers_fill",
    label: "Marcadores (Relleno)",
    property: "circle-color",
    layers: ["projects-circles"],
  },
  {
    id: "markers_stroke",
    label: "Marcadores (Borde)",
    property: "circle-stroke-color",
    layers: ["projects-circles"],
  },
];

export default function MapStyleEditor({ map }: { map: maplibregl.Map }) {
  const [isOpen, setIsOpen] = useState(false);
  const [colors, setColors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!map) return;

    const initialColors: Record<string, string> = {};
    STYLE_GROUPS.forEach((group) => {
      // Try to get the color from the first layer in the group
      const layerId = group.layers[0];
      if (map.getLayer(layerId)) {
        const color = map.getPaintProperty(layerId, group.property as any);
        // Only set if it's a simple string (hex/rgba) to avoid crashing with expressions
        if (typeof color === "string") {
          initialColors[group.id] = color;
        }
      }
    });
    setColors(initialColors);
  }, [map, isOpen]);

  const updateColor = (groupId: string, color: string) => {
    setColors((prev) => ({ ...prev, [groupId]: color }));
    const group = STYLE_GROUPS.find((g) => g.id === groupId);
    if (!group) return;

    group.layers.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, group.property, color);
      }
    });
  };

  const downloadConfig = () => {
    const style = map.getStyle();
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(style, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "map_style.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 left-5 z-50 bg-white text-black px-4 py-2 rounded-full shadow-lg font-bold hover:bg-gray-100 transition-colors border border-gray-200"
      >
        🎨 Editar Mapa
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 left-5 z-50 bg-white text-black p-4 rounded-xl shadow-2xl w-80 max-h-[70vh] overflow-y-auto border border-gray-200 font-sans">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className="font-bold text-lg">Editor de Estilo</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-black px-2"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {STYLE_GROUPS.map((group) => (
          <div key={group.id} className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              {group.label}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={colors[group.id] || ""}
                onChange={(e) => updateColor(group.id, e.target.value)}
                className="w-20 text-xs border border-gray-300 rounded px-1 py-1 font-mono"
              />
              <input
                type="color"
                value={
                  /^#[0-9A-F]{6}$/i.test(colors[group.id] || "")
                    ? colors[group.id]
                    : "#ffffff"
                }
                onChange={(e) => updateColor(group.id, e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t">
        <button
          onClick={downloadConfig}
          className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
        >
          Descargar JSON
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Envía este archivo al desarrollador para aplicar los cambios
          permanentemente.
        </p>
      </div>
    </div>
  );
}
