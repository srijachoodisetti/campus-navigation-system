
import React, { useEffect, useRef } from 'react';
import { Building } from '../types';
import { CAMPUS_CENTER } from '../constants';

interface MapComponentProps {
  buildings: Building[];
  selectedBuildingId?: string;
  onSelectBuilding: (id: string) => void;
  routePath?: string[]; // IDs of buildings in path
}

const TYPE_CONFIG = {
  academic: { 
    color: '#4f46e5', 
    icon: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>' 
  },
  food: { 
    color: '#ef4444', 
    icon: '<path d="M18 8c0-4.4-3.6-8-8-8h-1v8h9ZM2 0v24M17 8c0 4.4-3.6 8-8 8h-1v8h9ZM22 8c0 4.4-3.6 8-8 8h-1v8h9"/>' // Simplified utensils concept
  },
  residential: { 
    color: '#10b981', 
    icon: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' 
  },
  administrative: { 
    color: '#6b7280', 
    icon: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>' 
  },
  recreational: { 
    color: '#f59e0b', 
    icon: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>' 
  }
};

const MapComponent: React.FC<MapComponentProps> = ({ buildings, selectedBuildingId, onSelectBuilding, routePath }) => {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const clusterGroupRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Leaflet
    if (!mapRef.current && containerRef.current) {
      const L = (window as any).L;
      if (!L) return;

      mapRef.current = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([CAMPUS_CENTER.lat, CAMPUS_CENTER.lng], 16);

      L.tileLayer('https://{s}.tile.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(mapRef.current);

      L.control.zoom({ position: 'topright' }).addTo(mapRef.current);
      
      clusterGroupRef.current = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 45,
        spiderfyOnMaxZoom: true,
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount();
          return L.divIcon({
            html: `<div class="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center border-4 border-white shadow-xl font-bold text-sm transform transition-transform hover:scale-110">${count}</div>`,
            className: 'cluster-icon',
            iconSize: L.point(40, 40)
          });
        }
      });
      mapRef.current.addLayer(clusterGroupRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapRef.current || !clusterGroupRef.current) return;

    // Clear old markers from cluster group
    clusterGroupRef.current.clearLayers();

    buildings.forEach(b => {
      const config = TYPE_CONFIG[b.type] || TYPE_CONFIG.academic;
      const isSelected = selectedBuildingId === b.id;
      
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="flex flex-col items-center ${isSelected ? 'custom-marker-bounce' : ''}">
            <div class="relative">
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500" 
                   style="background-color: ${config.color}; border: 3px solid ${isSelected ? 'white' : 'rgba(255,255,255,0.8)'}; 
                   transform: scale(${isSelected ? '1.25' : '1'}); z-index: ${isSelected ? '2000' : '1'}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${config.icon}</svg>
              </div>
              ${isSelected ? `
                <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 shadow-lg border-r border-b border-gray-100"></div>
                <div class="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white animate-pulse"></div>
              ` : ''}
            </div>
            <div class="mt-2.5 px-3 py-1 bg-white/95 rounded-lg shadow-xl border border-gray-100 backdrop-blur-md transition-all ${isSelected ? 'scale-110 border-indigo-200' : 'opacity-80 scale-90'}">
               <span class="text-[10px] font-black text-gray-800 whitespace-nowrap uppercase tracking-tighter">${b.name.split(' ')[0]}</span>
            </div>
          </div>
        `,
        iconSize: [48, 70],
        iconAnchor: [24, 60]
      });

      const marker = L.marker([b.lat, b.lng], { icon })
        .on('click', (e: any) => {
          L.DomEvent.stopPropagation(e);
          onSelectBuilding(b.id);
        });
      
      clusterGroupRef.current.addLayer(marker);
    });

    if (selectedBuildingId) {
      const b = buildings.find(x => x.id === selectedBuildingId);
      if (b) mapRef.current.setView([b.lat, b.lng], 18, { animate: true, duration: 1 });
    }
  }, [buildings, selectedBuildingId, onSelectBuilding]);

  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (routePath && routePath.length > 1) {
      const coords = routePath.map(id => {
        const b = buildings.find(x => x.id === id);
        return b ? [b.lat, b.lng] : null;
      }).filter(c => c !== null);

      polylineRef.current = L.polyline(coords, {
        color: '#4f46e5',
        weight: 10,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: '1, 20',
        dashOffset: '0'
      }).addTo(mapRef.current);

      // Simple animation for the dash line to show direction/flow
      let offset = 0;
      const animate = () => {
        if (!polylineRef.current) return;
        offset -= 1.5;
        polylineRef.current.setStyle({ dashOffset: offset.toString() });
        requestAnimationFrame(animate);
      };
      animate();

      mapRef.current.fitBounds(polylineRef.current.getBounds(), { padding: [100, 100], animate: true });
    }
  }, [routePath, buildings]);

  return <div ref={containerRef} className="w-full h-full rounded-[32px] overflow-hidden shadow-2xl border-8 border-white bg-gray-100" />;
};

export default MapComponent;
