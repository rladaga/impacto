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
      if (!(window as any).Globe) {
        setTimeout(loadGlobe, 300);
        return;
      }

      const landTopoResponse = await fetch(
        "//cdn.jsdelivr.net/npm/world-atlas/land-110m.json"
      );
      const landTopo = await landTopoResponse.json();

      const {
        MeshPhongMaterial,
        DoubleSide,
        DirectionalLight,
        AmbientLight,
        Color,
      } = THREE;
      const Globe = (window as any).Globe;

      // --- 1. PALETA DE COLORES "MATE/FROSTED" ---
      // Usamos tonos menos saturados y más oscuros para integrarse con el fondo
      const OCEAN_COLOR = "#2B3A67"; // Azul marino agrisado (no eléctrico)
      const LAND_COLOR = "#6B7CB5"; // Azul lavanda mate (no blanco brillante)
      const ATMOSPHERE = "#4A5D9E"; // Glow suave

      const world = new Globe(containerRef.current)
        .backgroundColor("rgba(0,0,0,0)")
        .showGlobe(true)
        .showAtmosphere(true)
        .atmosphereColor(ATMOSPHERE)
        .atmosphereAltitude(0.15) // Halo más pequeño y discreto
        .enablePointerInteraction(false)
        .globeMaterial(
          new MeshPhongMaterial({
            color: new Color(OCEAN_COLOR),
            // EL SECRETO DEL MATE:
            shininess: 0, // 0 = Sin brillo plástico
            specular: new Color(0x000000), // Negro = No refleja luz blanca
            flatShading: false, // Suave
            opacity: 0.95, // Sólido pero deja pasar un mínimo de luz
            transparent: true,
          })
        )
        .polygonsData(
          (topojson.feature(landTopo, landTopo.objects.land) as any).features
        )
        .polygonCapMaterial(
          new MeshPhongMaterial({
            color: new Color(LAND_COLOR),
            side: DoubleSide,
            shininess: 0, // Tierra totalmente mate, como papel
          })
        )
        .polygonSideColor(() => "rgba(0,0,0,0)");

      // --- 2. ILUMINACIÓN DIFUSA ---
      const scene = world.scene();

      // Luz Principal (Sol): Menos intensa y más frontal para suavizar sombras
      const sunLight = new DirectionalLight(0xffffff, 1.2);
      sunLight.position.set(-15, 10, 20); // Ilumina desde arriba-izquierda
      scene.add(sunLight);

      // Luz de Relleno: Aumentamos esto para que la parte oscura no sea negra
      // Esto da el efecto "suave" general
      const ambLight = new AmbientLight(0x505080, 0.8);
      scene.add(ambLight);

      // --- ANIMACIÓN ---
      let lng = 0;
      const interval = setInterval(() => {
        lng += 0.3; // Rotación un pelín más lenta
        world.pointOfView({
          lat: 30, // Un poco más bajo para ver mejor los continentes
          lng,
          altitude: 2.5,
        });
      }, 20);

      const renderer = world.renderer();
      renderer.setPixelRatio(window.devicePixelRatio);

      requestAnimationFrame(() => {
        setIsReady(true);
      });

      return () => {
        clearInterval(interval);
        scene.remove(sunLight);
        scene.remove(ambLight);
      };
    };

    loadGlobe();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        opacity: isReady ? 1 : 0,
        transition: "opacity 1s ease-in",

        // --- 3. MEZCLA CON EL FONDO ---
        // Usamos 'normal' o 'screen' dependiendo de qué tanto quieras que se vea la textura a través.
        // Con los colores nuevos, 'screen' debería verse genial.
        mixBlendMode: "screen",

        // Filtro para quitarle la perfección digital 3D
        filter: "blur(2.5px) contrast(1.05)",
      }}
    />
  );
}
