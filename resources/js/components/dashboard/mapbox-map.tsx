import mapboxgl from 'mapbox-gl';
import React, { useEffect, useRef } from 'react';

// Mapbox access token will be set from props

// Disable Mapbox telemetry globally to prevent network errors
const mapboxExtended = mapboxgl as typeof mapboxgl & {
    supported: unknown;
    setRTLTextPlugin: () => void;
};

const supportedFunction = (() => true) as typeof mapboxgl.supported;
supportedFunction.webGLContextAttributes = {} as WebGLContextAttributes;
mapboxExtended.supported = supportedFunction;
mapboxExtended.setRTLTextPlugin = () => {};

// Disable telemetry by overriding the worker message handler
if (typeof window !== 'undefined') {
    const originalFetch = window.fetch;
    window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

        // Block Mapbox telemetry and analytics requests
        if (
            url &&
            (url.includes('events.mapbox.com') ||
                url.includes('api.mapbox.com/events') ||
                url.includes('api.mapbox.com/v1/turnstile') ||
                url.includes('api.mapbox.com/analytics') ||
                url.includes('api.mapbox.com/v1/sku'))
        ) {
            // Return a resolved promise that mimics a successful response
            return Promise.resolve(
                new Response('{}', {
                    status: 200,
                    statusText: 'OK',
                    headers: { 'Content-Type': 'application/json' },
                }),
            );
        }

        return originalFetch.call(this, input, init);
    };
}

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

// Sample node locations based on the design (yellow dots)
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

const MapboxMap: React.FC<MapboxMapProps> = ({ className, onMapLoad, mapboxToken }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    // Check for component error conditions
    const hasTokenError = mapboxToken === undefined;
    const hasInvalidToken = !mapboxToken || !mapboxToken.startsWith('pk.');

    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        // Early return if no token provided
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

        // Set the access token from props
        mapboxgl.accessToken = mapboxToken;

        console.log('Initializing Mapbox map...');
        console.log('Mapbox token:', mapboxgl.accessToken?.substring(0, 20) + '...');

        try {
            // Initialize map
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/dark-v11', // Dark theme to match design
                center: [0, 20], // Center on world view
                zoom: 1.5,
                projection: 'mercator', // Google Maps style projection
                attributionControl: false, // Remove attribution control
                logoPosition: 'bottom-left', // We'll hide this with CSS
                collectResourceTiming: false, // Disable resource timing collection
                maxTileCacheSize: 50, // Reduce tile cache size
                // Disable telemetry to prevent network errors
                trackResize: false,
                bearingSnap: 7,
                pitchWithRotate: false,
                interactive: true,
                boxZoom: false,
                doubleClickZoom: false,
                dragRotate: false,
                dragPan: true,
                keyboard: false,
                scrollZoom: true,
                touchZoomRotate: false,
                // Most importantly, disable all telemetry
                transformRequest: (url: string) => {
                    // Block telemetry and analytics requests
                    if (
                        url.includes('events.mapbox.com') ||
                        url.includes('api.mapbox.com/events') ||
                        url.includes('api.mapbox.com/v1/turnstile') ||
                        url.includes('api.mapbox.com/analytics')
                    ) {
                        return { url: '' }; // Return empty URL to cancel request
                    }
                    return { url };
                },
            });

            console.log('Mapbox map created successfully');
        } catch (error) {
            console.error('Error creating Mapbox map:', error);
            // Show fallback content
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
        style.textContent = `
      .mapboxgl-ctrl-logo {
        display: none !important;
      }
    `;
        document.head.appendChild(style);

        map.current.on('load', () => {
            if (!map.current) return;

            console.log('Map loaded successfully');

            // Add yellow dot markers for each node location
            nodeLocations.forEach((node) => {
                try {
                    // Create a custom marker element
                    const markerElement = document.createElement('div');
                    markerElement.className = 'node-marker';
                    markerElement.style.cssText = `
            width: 12px;
            height: 12px;
            background: #FFD700;
            border: 2px solid #FFF;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
            cursor: pointer;
            animation: pulse 2s infinite;
          `;

                    // Add pulsing animation (only once)
                    if (!document.getElementById('node-pulse-animation')) {
                        const style = document.createElement('style');
                        style.id = 'node-pulse-animation';
                        style.textContent = `
              @keyframes pulse {
                0% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.6); }
                50% { box-shadow: 0 0 20px rgba(255, 215, 0, 1); }
                100% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.6); }
              }
            `;
                        document.head.appendChild(style);
                    }

                    // Create marker
                    new mapboxgl.Marker(markerElement).setLngLat([node.lng, node.lat]).addTo(map.current!);

                    // Add popup on click
                    const popup = new mapboxgl.Popup({
                        offset: 25,
                        className: 'node-popup',
                    }).setHTML(`
            <div style="
              background: linear-gradient(to bottom, rgba(142, 145, 150, 0.2), #181819);
              border: 1px solid #47484B;
              border-radius: 8px;
              padding: 12px;
              color: #EDF1FA;
              font-family: 'Kode Mono', monospace;
              font-size: 14px;
              font-weight: 700;
              backdrop-filter: blur(4px);
            ">
              ${node.label}
              ${node.id === 'houston' ? '<br><span style="font-family: Lekton; font-size: 12px; font-weight: 400;">8 total operations</span>' : ''}
            </div>
          `);

                    markerElement.addEventListener('click', () => {
                        popup.setLngLat([node.lng, node.lat]).addTo(map.current!);
                    });
                } catch (error) {
                    console.error('Error creating marker for node:', node.id, error);
                }
            });

            // Call onMapLoad callback if provided
            if (onMapLoad) {
                onMapLoad(map.current);
            }
        });

        // Add error handling for map errors
        map.current.on('error', (e) => {
            console.error('Mapbox error:', e);
            // Don't show error in UI as the map should still work
        });

        // Add network error handler
        map.current.on('sourcedata', (e) => {
            if (e.sourceDataType === 'metadata' && e.isSourceLoaded === false) {
                console.warn('Map source failed to load, but continuing...');
            }
        });

        // Cleanup function
        return () => {
            if (map.current) {
                try {
                    map.current.remove();
                    map.current = null;
                } catch (error) {
                    console.warn('Error cleaning up map:', error);
                }
            }
        };
    }, [onMapLoad, mapboxToken]);

    // Render error state if token is missing or invalid
    if (hasTokenError) {
        return (
            <div className={`h-full w-full ${className || ''}`} style={{ minHeight: '400px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    background: 'linear-gradient(to bottom, #2F3032, #181819)',
                    color: '#EDF1FA',
                    fontFamily: 'Kode Mono, monospace',
                    textAlign: 'center'
                }}>
                    <div>
                        <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>Component Error</h2>
                        <p style={{ fontSize: '14px', opacity: 0.7 }}>Mapbox token prop missing</p>
                    </div>
                </div>
            </div>
        );
    }

    return <div ref={mapContainer} className={`h-full w-full ${className || ''}`} style={{ minHeight: '400px' }} />;
};

export default MapboxMap;
