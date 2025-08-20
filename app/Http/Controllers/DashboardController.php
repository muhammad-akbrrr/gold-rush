<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index(): Response
    {
        $mapboxToken = env('VITE_MAPBOX_TOKEN');
        
        // Validate token exists and is properly formatted
        if (empty($mapboxToken) || !str_starts_with($mapboxToken, 'pk.')) {
            // Log the issue for debugging
            \Log::warning('Invalid or missing Mapbox token in dashboard controller');
            $mapboxToken = null;
        }

        return Inertia::render('dashboard', [
            'mapboxToken' => $mapboxToken,
        ]);
    }
}