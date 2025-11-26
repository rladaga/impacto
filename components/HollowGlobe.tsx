// components/HollowGlobe.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import * as topojson from "topojson-client";

interface HollowGlobeProps {
  onReady?: (isReady: boolean) => void;
}

export default function HollowGlobe({ onReady }: HollowGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    onReady?.(isReady);
  }, [isReady, onReady]);

  useEffect(() => {
    if (!containerRef.current) return;

    const loadGlobe = async () => {
      // Esperar a que globe.gl esté disponible
      if (!(window as any).Globe) {
        setTimeout(loadGlobe, 300);
        return;
      }

      // Pre-cargar el mapa JSON primero
      const landTopoResponse = await fetch(
        "//cdn.jsdelivr.net/npm/world-atlas/land-110m.json"
      );
      const landTopo = await landTopoResponse.json();

      const { MeshLambertMaterial, DoubleSide } = THREE;
      const Globe = (window as any).Globe;

      const world = new Globe(containerRef.current)
        .backgroundColor("rgba(0,0,0,0)")
        .showGlobe(true)
        .showAtmosphere(false)
        .enablePointerInteraction(false)
        .globeMaterial(new MeshLambertMaterial({ color: "#2D2C67" }))
        .polygonsData(
          (topojson.feature(landTopo, landTopo.objects.land) as any).features
        )
        .polygonCapMaterial(
          new MeshLambertMaterial({ color: "#A5AFD6", side: DoubleSide })
        )
        .polygonSideColor(() => "rgba(0,0,0,0)");

      // Auto rotate antes de marcar como listo
      let lng = 0;
      const interval = setInterval(() => {
        lng += 0.6;
        world.pointOfView({ lat: 0, lng, altitude: 2 });
      }, 20);

      // Marcar como listo después de que se renderice
      requestAnimationFrame(() => {
        setIsReady(true);
      });

      return () => clearInterval(interval);
    };

    loadGlobe();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        zIndex: -1,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: isReady ? 1 : 0,
        transition: "opacity 0.5s ease-in",
      }}
    />
  );
}
