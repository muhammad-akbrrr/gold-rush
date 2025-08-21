import mapboxgl from 'mapbox-gl';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

interface NodeLocation {
    id: string;
    lng: number;
    lat: number;
    label?: string;
}

interface MapboxMapProps {
    className?: string;
    onMapLoad?: (map: mapboxgl.Map) => void;
    mapboxToken: string | null;
}

// Sample node locations
const nodeLocations: NodeLocation[] = [
    { id: 'houston', lng: -95.3698, lat: 29.7604, label: 'Houston, Texas' },
    { id: 'london', lng: -0.1276, lat: 51.5074, label: 'London' },
    { id: 'tokyo', lng: 139.6917, lat: 35.6895, label: 'Tokyo' },
    { id: 'sydney', lng: 151.2093, lat: -33.8688, label: 'Sydney' },
    { id: 'dubai', lng: 55.2708, lat: 25.2048, label: 'Dubai' },
    { id: 'newyork', lng: -74.006, lat: 40.7128, label: 'New York' },
    { id: 'singapore', lng: 103.8198, lat: 1.3521, label: 'Singapore' },
    { id: 'moscow', lng: 37.6176, lat: 55.7558, label: 'Moscow' },
    { id: 'johannesburg', lng: 28.0473, lat: -26.2041, label: 'Johannesburg' },
    { id: 'saopaulo', lng: -46.6333, lat: -23.5505, label: 'São Paulo' },
];

const MapboxMap: React.FC<MapboxMapProps> = React.memo(({ className, onMapLoad, mapboxToken }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const cleanupFunctions = useRef<Array<() => void>>([]);
    const currentPopup = useRef<mapboxgl.Popup | null>(null);

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
                maxZoom: 8,

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
                const handleMarkerClick = () => {
                    // TODO: add click handler here
                };

                // Cursor handlers
                const handleMouseEnter = () => {
                    if (map.current) {
                        map.current.getCanvas().style.cursor = 'pointer';
                    }
                };

                const handleMouseLeave = () => {
                    if (map.current) {
                        map.current.getCanvas().style.cursor = '';
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

    return <div ref={mapContainer} className={`h-full w-full ${className || ''}`} style={{ minHeight: '400px' }} />;
});

MapboxMap.displayName = 'MapboxMap';

export default MapboxMap;
