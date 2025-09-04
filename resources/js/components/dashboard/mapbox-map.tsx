import mapboxgl from 'mapbox-gl';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import OperationsModal from './operations-modal';

interface NodeLocation {
    id: string;
    lng: number;
    lat: number;
    label: string;
    region: string;
    operationsCount: number;
}

interface Operation {
    id: string;
    name: string;
    location: string;
    image: string;
}

interface MapboxMapProps {
    className?: string;
    onMapLoad?: (map: mapboxgl.Map) => void;
    mapboxToken: string | null;
}

// Sample node locations with operations data
const nodeLocations: NodeLocation[] = [
    { id: 'houston', lng: -95.3698, lat: 29.7604, label: 'Houston', region: 'Texas', operationsCount: 8 },
    { id: 'london', lng: -0.1276, lat: 51.5074, label: 'London', region: 'United Kingdom', operationsCount: 5 },
    { id: 'tokyo', lng: 139.6917, lat: 35.6895, label: 'Tokyo', region: 'Japan', operationsCount: 3 },
    { id: 'sydney', lng: 151.2093, lat: -33.8688, label: 'Sydney', region: 'Australia', operationsCount: 4 },
    { id: 'dubai', lng: 55.2708, lat: 25.2048, label: 'Dubai', region: 'UAE', operationsCount: 6 },
    { id: 'newyork', lng: -74.006, lat: 40.7128, label: 'New York', region: 'New York', operationsCount: 7 },
    { id: 'singapore', lng: 103.8198, lat: 1.3521, label: 'Singapore', region: 'Singapore', operationsCount: 2 },
    { id: 'moscow', lng: 37.6176, lat: 55.7558, label: 'Moscow', region: 'Russia', operationsCount: 4 },
    { id: 'johannesburg', lng: 28.0473, lat: -26.2041, label: 'Johannesburg', region: 'South Africa', operationsCount: 3 },
    { id: 'saopaulo', lng: -46.6333, lat: -23.5505, label: 'São Paulo', region: 'Brazil', operationsCount: 5 },
];

// Sample operations data for different regions
const operationsData: Record<string, Operation[]> = {
    'Texas': [
        { id: 'tx-1', name: 'Goldrush Mining Co.', location: 'Austin', image: 'https://api.builder.io/api/v1/image/assets/TEMP/63a0913b49a6385c88902fed2f598edca9e362df?width=80' },
        { id: 'tx-2', name: 'Lone Star Resources', location: 'Dallas', image: 'https://api.builder.io/api/v1/image/assets/TEMP/b6e0aa3d8596ee8d35a7d258e787662393f98c00?width=80' },
        { id: 'tx-3', name: 'Houston Gold Corp', location: 'Houston', image: 'https://api.builder.io/api/v1/image/assets/TEMP/b978cc79857bbcd7a17e802236c75ae853872804?width=80' },
        { id: 'tx-4', name: 'Dallas Precious Metals', location: 'Dallas', image: 'https://api.builder.io/api/v1/image/assets/TEMP/78eb2e1ee567b38e270816d39b1a7667e9253be2?width=80' },
        { id: 'tx-5', name: 'Gulf Coast Mining', location: 'Houston', image: 'https://api.builder.io/api/v1/image/assets/TEMP/63a0913b49a6385c88902fed2f598edca9e362df?width=80' },
        { id: 'tx-6', name: 'East Texas Gold', location: 'Tyler', image: 'https://api.builder.io/api/v1/image/assets/TEMP/b6e0aa3d8596ee8d35a7d258e787662393f98c00?width=80' },
        { id: 'tx-7', name: 'El Paso Mining', location: 'El Paso', image: 'https://api.builder.io/api/v1/image/assets/TEMP/b978cc79857bbcd7a17e802236c75ae853872804?width=80' },
        { id: 'tx-8', name: 'San Antonio Resources', location: 'San Antonio', image: 'https://api.builder.io/api/v1/image/assets/TEMP/78eb2e1ee567b38e270816d39b1a7667e9253be2?width=80' }
    ],
    'United Kingdom': [
        { id: 'uk-1', name: 'London Gold Exchange', location: 'London', image: 'https://api.builder.io/api/v1/image/assets/TEMP/63a0913b49a6385c88902fed2f598edca9e362df?width=80' },
        { id: 'uk-2', name: 'Manchester Mining Ltd', location: 'Manchester', image: 'https://api.builder.io/api/v1/image/assets/TEMP/b6e0aa3d8596ee8d35a7d258e787662393f98c00?width=80' },
        { id: 'uk-3', name: 'Birmingham Bullion', location: 'Birmingham', image: 'https://api.builder.io/api/v1/image/assets/TEMP/b978cc79857bbcd7a17e802236c75ae853872804?width=80' },
        { id: 'uk-4', name: 'Liverpool Precious Metals', location: 'Liverpool', image: 'https://api.builder.io/api/v1/image/assets/TEMP/78eb2e1ee567b38e270816d39b1a7667e9253be2?width=80' },
        { id: 'uk-5', name: 'Yorkshire Gold Co.', location: 'Leeds', image: 'https://api.builder.io/api/v1/image/assets/TEMP/63a0913b49a6385c88902fed2f598edca9e362df?width=80' }
    ],
    'Japan': [
        { id: 'jp-1', name: 'Tokyo Gold Corp', location: 'Tokyo', image: 'https://api.builder.io/api/v1/image/assets/TEMP/63a0913b49a6385c88902fed2f598edca9e362df?width=80' },
        { id: 'jp-2', name: 'Osaka Mining Ltd', location: 'Osaka', image: 'https://api.builder.io/api/v1/image/assets/TEMP/b6e0aa3d8596ee8d35a7d258e787662393f98c00?width=80' },
        { id: 'jp-3', name: 'Kyoto Precious Resources', location: 'Kyoto', image: 'https://api.builder.io/api/v1/image/assets/TEMP/b978cc79857bbcd7a17e802236c75ae853872804?width=80' }
    ],
    'Australia': [
        { id: 'au-1', name: 'Sydney Gold Mining', location: 'Sydney', image: 'https://api.builder.io/api/v1/image/assets/TEMP/63a0913b49a6385c88902fed2f598edca9e362df?width=80' },
        { id: 'au-2', name: 'Melbourne Resources', location: 'Melbourne', image: 'https://api.builder.io/api/v1/image/assets/TEMP/b6e0aa3d8596ee8d35a7d258e787662393f98c00?width=80' },
        { id: 'au-3', name: 'Perth Mining Corp', location: 'Perth', image: 'https://api.builder.io/api/v1/image/assets/TEMP/b978cc79857bbcd7a17e802236c75ae853872804?width=80' },
        { id: 'au-4', name: 'Queensland Gold', location: 'Brisbane', image: 'https://api.builder.io/api/v1/image/assets/TEMP/78eb2e1ee567b38e270816d39b1a7667e9253be2?width=80' }
    ],
    'UAE': [
        { id: 'ae-1', name: 'Dubai Gold Exchange', location: 'Dubai', image: 'https://api.builder.io/api/v1/image/assets/TEMP/63a0913b49a6385c88902fed2f598edca9e362df?width=80' },
        { id: 'ae-2', name: 'Abu Dhabi Precious Metals', location: 'Abu Dhabi', image: 'https://api.builder.io/api/v1/image/assets/TEMP/b6e0aa3d8596ee8d35a7d258e787662393f98c00?width=80' },
        { id: 'ae-3', name: 'Emirates Gold Corp', location: 'Sharjah', image: 'https://api.builder.io/api/v1/image/assets/TEMP/b978cc79857bbcd7a17e802236c75ae853872804?width=80' },
        { id: 'ae-4', name: 'Northern Emirates Mining', location: 'Ras Al Khaimah', image: 'https://api.builder.io/api/v1/image/assets/TEMP/78eb2e1ee567b38e270816d39b1a7667e9253be2?width=80' },
        { id: 'ae-5', name: 'Gulf Coast Resources', location: 'Fujairah', image: 'https://api.builder.io/api/v1/image/assets/TEMP/63a0913b49a6385c88902fed2f598edca9e362df?width=80' },
        { id: 'ae-6', name: 'Arabian Gold Trading', location: 'Ajman', image: 'https://api.builder.io/api/v1/image/assets/TEMP/b6e0aa3d8596ee8d35a7d258e787662393f98c00?width=80' }
    ],
    'New York': [
        { id: 'ny-1', name: 'Manhattan Gold Exchange', location: 'Manhattan', image: 'https://api.builder.io/api/v1/image/assets/TEMP/63a0913b49a6385c88902fed2f598edca9e362df?width=80' },
        { id: 'ny-2', name: 'Brooklyn Mining Co.', location: 'Brooklyn', image: 'https://api.builder.io/api/v1/image/assets/TEMP/b6e0aa3d8596ee8d35a7d258e787662393f98c00?width=80' },
        { id: 'ny-3', name: 'Queens Precious Metals', location: 'Queens', image: 'https://api.builder.io/api/v1/image/assets/TEMP/b978cc79857bbcd7a17e802236c75ae853872804?width=80' },
        { id: 'ny-4', name: 'Bronx Resources', location: 'Bronx', image: 'https://api.builder.io/api/v1/image/assets/TEMP/78eb2e1ee567b38e270816d39b1a7667e9253be2?width=80' },
        { id: 'ny-5', name: 'Staten Island Gold', location: 'Staten Island', image: 'https://api.builder.io/api/v1/image/assets/TEMP/63a0913b49a6385c88902fed2f598edca9e362df?width=80' },
        { id: 'ny-6', name: 'Long Island Mining', location: 'Long Island', image: 'https://api.builder.io/api/v1/image/assets/TEMP/b6e0aa3d8596ee8d35a7d258e787662393f98c00?width=80' },
        { id: 'ny-7', name: 'Upstate Gold Corp', location: 'Buffalo', image: 'https://api.builder.io/api/v1/image/assets/TEMP/b978cc79857bbcd7a17e802236c75ae853872804?width=80' }
    ],
    'Singapore': [
        { id: 'sg-1', name: 'Singapore Gold Exchange', location: 'Marina Bay', image: 'https://api.builder.io/api/v1/image/assets/TEMP/63a0913b49a6385c88902fed2f598edca9e362df?width=80' },
        { id: 'sg-2', name: 'Southeast Asian Mining', location: 'Jurong', image: 'https://api.builder.io/api/v1/image/assets/TEMP/b6e0aa3d8596ee8d35a7d258e787662393f98c00?width=80' }
    ],
    'Russia': [
        { id: 'ru-1', name: 'Moscow Gold Corp', location: 'Moscow', image: 'https://api.builder.io/api/v1/image/assets/TEMP/63a0913b49a6385c88902fed2f598edca9e362df?width=80' },
        { id: 'ru-2', name: 'St. Petersburg Resources', location: 'St. Petersburg', image: 'https://api.builder.io/api/v1/image/assets/TEMP/b6e0aa3d8596ee8d35a7d258e787662393f98c00?width=80' },
        { id: 'ru-3', name: 'Siberian Mining Ltd', location: 'Novosibirsk', image: 'https://api.builder.io/api/v1/image/assets/TEMP/b978cc79857bbcd7a17e802236c75ae853872804?width=80' },
        { id: 'ru-4', name: 'Ural Mountains Gold', location: 'Yekaterinburg', image: 'https://api.builder.io/api/v1/image/assets/TEMP/78eb2e1ee567b38e270816d39b1a7667e9253be2?width=80' }
    ],
    'South Africa': [
        { id: 'za-1', name: 'Johannesburg Gold Mining', location: 'Johannesburg', image: 'https://api.builder.io/api/v1/image/assets/TEMP/63a0913b49a6385c88902fed2f598edca9e362df?width=80' },
        { id: 'za-2', name: 'Cape Town Resources', location: 'Cape Town', image: 'https://api.builder.io/api/v1/image/assets/TEMP/b6e0aa3d8596ee8d35a7d258e787662393f98c00?width=80' },
        { id: 'za-3', name: 'Durban Precious Metals', location: 'Durban', image: 'https://api.builder.io/api/v1/image/assets/TEMP/b978cc79857bbcd7a17e802236c75ae853872804?width=80' }
    ],
    'Brazil': [
        { id: 'br-1', name: 'São Paulo Gold Corp', location: 'São Paulo', image: 'https://api.builder.io/api/v1/image/assets/TEMP/63a0913b49a6385c88902fed2f598edca9e362df?width=80' },
        { id: 'br-2', name: 'Rio Mining Company', location: 'Rio de Janeiro', image: 'https://api.builder.io/api/v1/image/assets/TEMP/b6e0aa3d8596ee8d35a7d258e787662393f98c00?width=80' },
        { id: 'br-3', name: 'Brasília Resources', location: 'Brasília', image: 'https://api.builder.io/api/v1/image/assets/TEMP/b978cc79857bbcd7a17e802236c75ae853872804?width=80' },
        { id: 'br-4', name: 'Bahia Gold Exchange', location: 'Salvador', image: 'https://api.builder.io/api/v1/image/assets/TEMP/78eb2e1ee567b38e270816d39b1a7667e9253be2?width=80' },
        { id: 'br-5', name: 'Northeast Brazil Mining', location: 'Fortaleza', image: 'https://api.builder.io/api/v1/image/assets/TEMP/63a0913b49a6385c88902fed2f598edca9e362df?width=80' }
    ]
};

const MapboxMap: React.FC<MapboxMapProps> = React.memo(({ className, onMapLoad, mapboxToken }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const cleanupFunctions = useRef<Array<() => void>>([]);
    const currentPopup = useRef<mapboxgl.Popup | null>(null);
    
    // Modal state management
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState<string>('');
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    // Memoize error conditions
    const hasTokenError = useMemo(() => mapboxToken === undefined, [mapboxToken]);
    const hasInvalidToken = useMemo(() => !mapboxToken || !mapboxToken.startsWith('pk.'), [mapboxToken]);

    // Cleanup function to prevent memory leaks
    const cleanup = useCallback(() => {
        // Close any open popups
        if (currentPopup.current) {
            currentPopup.current.remove();
            currentPopup.current = null;
        }

        // Run all registered cleanup functions
        cleanupFunctions.current.forEach((cleanupFn) => {
            try {
                cleanupFn();
            } catch (error) {
                console.warn('Cleanup function error:', error);
            }
        });
        cleanupFunctions.current = [];

        // Clean up map
        if (map.current) {
            try {
                // Remove all layers and sources properly
                const mapInstance = map.current;

                if (mapInstance.getLayer('node-markers')) {
                    mapInstance.removeLayer('node-markers');
                }
                if (mapInstance.getLayer('node-markers-pulse')) {
                    mapInstance.removeLayer('node-markers-pulse');
                }
                if (mapInstance.getSource('node-locations')) {
                    mapInstance.removeSource('node-locations');
                }

                // Remove map
                mapInstance.remove();
                map.current = null;

                console.log('Map cleaned up successfully');
            } catch (error) {
                console.warn('Error during map cleanup:', error);
            }
        }
    }, []);

    // Add cleanup function to registry
    const addCleanup = useCallback((cleanupFn: () => void) => {
        cleanupFunctions.current.push(cleanupFn);
    }, []);

    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        if (hasInvalidToken) {
            console.error('Invalid or missing Mapbox token:', mapboxToken);
            if (mapContainer.current) {
                mapContainer.current.innerHTML = `
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100%;
                        background: linear-gradient(to bottom, #2F3032, #181819);
                        color: #EDF1FA;
                        font-family: 'Kode Mono', monospace;
                        text-align: center;
                    ">
                        <div>
                            <h2 style="font-size: 18px; margin-bottom: 8px;">Map Configuration Error</h2>
                            <p style="font-size: 14px; opacity: 0.7;">Mapbox token not configured</p>
                            <p style="font-size: 12px; opacity: 0.5; margin-top: 8px;">Please check your environment variables</p>
                        </div>
                    </div>
                `;
            }
            return;
        }

        // Set the access token
        mapboxgl.accessToken = mapboxToken;

        console.log('Initializing Mapbox map...');

        try {
            // Initialize map with simplified configuration
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/dark-v10',
                center: [0, 20],
                zoom: 1.5,
                minZoom: 0.5,
                maxZoom: 18,

                // Basic performance optimizations
                attributionControl: false,
                collectResourceTiming: false,
                maxTileCacheSize: 50, // Reduced cache size
                renderWorldCopies: false,

                // Simplified interactions
                boxZoom: false,
                doubleClickZoom: false,
                dragRotate: false,
                touchZoomRotate: false,
            });

            console.log('Mapbox map created successfully');
        } catch (error) {
            console.error('Error creating Mapbox map:', error);
            if (mapContainer.current) {
                mapContainer.current.innerHTML = `
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100%;
                        background: linear-gradient(to bottom, #2F3032, #181819);
                        color: #EDF1FA;
                        font-family: 'Kode Mono', monospace;
                        text-align: center;
                    ">
                        <div>
                            <h2 style="font-size: 18px; margin-bottom: 8px;">Map Unavailable</h2>
                            <p style="font-size: 14px; opacity: 0.7;">Unable to load interactive map</p>
                        </div>
                    </div>
                `;
            }
            return;
        }

        // Hide Mapbox logo
        const style = document.createElement('style');
        style.textContent = `.mapboxgl-ctrl-logo { display: none !important; }`;
        document.head.appendChild(style);
        addCleanup(() => document.head.removeChild(style));

        const handleMapLoad = () => {
            if (!map.current) return;

            console.log('Map loaded successfully');

            try {
                // Add source for markers
                map.current.addSource('node-locations', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: nodeLocations.map((node) => ({
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: [node.lng, node.lat],
                            },
                            properties: {
                                id: node.id,
                                label: node.label,
                            },
                        })),
                    },
                    cluster: false,
                });

                // Add marker layer - GPU accelerated circles only
                map.current.addLayer({
                    id: 'node-markers',
                    type: 'circle',
                    source: 'node-locations',
                    paint: {
                        'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 4, 8, 8],
                        'circle-color': '#FFD700',
                        'circle-stroke-color': '#FFF',
                        'circle-stroke-width': 2,
                        'circle-opacity': 0.9,
                        'circle-stroke-opacity': 1,
                    },
                });

                // Click handler for markers
                const handleMarkerClick = (e: mapboxgl.MapLayerMouseEvent) => {
                    const features = e.features;
                    if (features && features.length > 0) {
                        const nodeId = features[0].properties?.id;
                        const node = nodeLocations.find(n => n.id === nodeId);
                        if (node) {
                            setSelectedRegion(node.region);
                            setModalOpen(true);
                        }
                    }
                };

                // Cursor and tooltip handlers
                const handleMouseEnter = (e: mapboxgl.MapLayerMouseEvent) => {
                    if (map.current) {
                        map.current.getCanvas().style.cursor = 'pointer';
                        const features = e.features;
                        if (features && features.length > 0) {
                            const nodeId = features[0].properties?.id;
                            setHoveredNode(nodeId);
                            
                            // Calculate tooltip position
                            const canvas = map.current.getCanvas();
                            const rect = canvas.getBoundingClientRect();
                            setTooltipPosition({
                                x: rect.left + e.point.x,
                                y: rect.top + e.point.y - 10
                            });
                        }
                    }
                };

                const handleMouseLeave = () => {
                    if (map.current) {
                        map.current.getCanvas().style.cursor = '';
                        setHoveredNode(null);
                    }
                };

                // Add event listeners
                map.current.on('click', 'node-markers', handleMarkerClick);
                map.current.on('mouseenter', 'node-markers', handleMouseEnter);
                map.current.on('mouseleave', 'node-markers', handleMouseLeave);

                // Register cleanup for event listeners
                addCleanup(() => {
                    if (map.current) {
                        map.current.off('click', 'node-markers', handleMarkerClick);
                        map.current.off('mouseenter', 'node-markers', handleMouseEnter);
                        map.current.off('mouseleave', 'node-markers', handleMouseLeave);
                    }
                });
            } catch (error) {
                console.error('Error setting up map layers:', error);
            }

            // Call onMapLoad callback if provided
            if (onMapLoad) {
                onMapLoad(map.current);
            }
        };

        // Error handler
        const handleMapError = (e: mapboxgl.ErrorEvent) => {
            console.error('Mapbox error:', e);
            console.error('Error details:', {
                type: e.type,
                target: e.target,
                error: e.error,
            });
        };

        // Add event listeners
        map.current.on('load', handleMapLoad);
        map.current.on('error', handleMapError);

        // Register cleanup for main event listeners
        addCleanup(() => {
            if (map.current) {
                map.current.off('load', handleMapLoad);
                map.current.off('error', handleMapError);
            }
        });

        // Return cleanup function
        return cleanup;
    }, [onMapLoad, mapboxToken, hasInvalidToken, cleanup, addCleanup]);

    // Cleanup on unmount
    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    // Render error state if token is missing or invalid
    if (hasTokenError) {
        return (
            <div className={`h-full w-full ${className || ''}`} style={{ minHeight: '400px' }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        background: 'linear-gradient(to bottom, #2F3032, #181819)',
                        color: '#EDF1FA',
                        fontFamily: 'Kode Mono, monospace',
                        textAlign: 'center',
                    }}
                >
                    <div>
                        <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>Component Error</h2>
                        <p style={{ fontSize: '14px', opacity: 0.7 }}>Mapbox token prop missing</p>
                    </div>
                </div>
            </div>
        );
    }

    // Helper functions
    const getOperationsForRegion = (region: string): Operation[] => operationsData[region] || [];
    const hoveredNodeData = hoveredNode ? nodeLocations.find(n => n.id === hoveredNode) : null;

    return (
        <div className="relative w-full h-full">
            <div ref={mapContainer} className={`h-full w-full ${className || ''}`} style={{ minHeight: '400px' }} />
            
            {/* Custom tooltip for map nodes */}
            {hoveredNode && hoveredNodeData && (
                <div
                    className="fixed z-50 px-3 py-1.5 text-sm bg-hub-gray-950/90 border border-hub-gray-850 rounded-md shadow-lg pointer-events-none backdrop-blur-sm"
                    style={{
                        left: tooltipPosition.x,
                        top: tooltipPosition.y,
                        transform: 'translate(-50%, -100%)',
                    }}
                >
                    <div className="font-kode-mono font-semibold text-hub-gray-500">
                        {hoveredNodeData.label}
                    </div>
                    <div className="font-lekton text-xs text-hub-gray-500/70">
                        {hoveredNodeData.operationsCount} operations
                    </div>
                </div>
            )}

            {/* Operations Modal */}
            <OperationsModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                region={selectedRegion}
                operations={getOperationsForRegion(selectedRegion)}
            />
        </div>
    );
});

MapboxMap.displayName = 'MapboxMap';

export default MapboxMap;
