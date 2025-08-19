<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class BlockiesGeneratorService
{
    protected int $size;
    protected int $scale;
    protected array $canvas;
    protected array $colors;

    public function __construct(int $size = 8, int $scale = 4)
    {
        $this->size = $size;
        $this->scale = $scale;
    }

    /**
     * Generate a blocky identicon image from a seed string (wallet address)
     */
    public function generateBlockies(string $seed): ?string
    {
        try {
            // Create a deterministic random number generator from seed
            $hash = $this->createHash($seed);
            $randseed = $this->createRandseed($hash);
            
            // Generate colors based on the hash
            $this->colors = $this->generateColors($randseed);
            
            // Generate the pattern
            $this->canvas = $this->generatePattern($randseed);
            
            // Render to PNG
            return $this->renderToPng();
            
        } catch (\Exception $e) {
            Log::error('Failed to generate blockies avatar', [
                'seed' => $seed,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Create hash from seed string
     */
    protected function createHash(string $seed): array
    {
        $hash = hash('sha256', $seed);
        $hashArray = [];
        
        // Convert hex string to array of integers
        for ($i = 0; $i < strlen($hash); $i += 2) {
            $hashArray[] = hexdec(substr($hash, $i, 2));
        }
        
        return $hashArray;
    }

    /**
     * Create random seed function from hash
     */
    protected function createRandseed(array $hash): \Closure
    {
        $counter = 0;
        
        return function() use ($hash, &$counter) {
            $value = $hash[$counter % count($hash)];
            $counter++;
            return $value / 255; // Normalize to 0-1
        };
    }

    /**
     * Generate color palette from random seed
     */
    protected function generateColors(\Closure $randseed): array
    {
        // Background color (light)
        $bgHue = $randseed() * 360;
        $bgColor = $this->hslToRgb($bgHue, 0.5, 0.9);
        
        // Main color
        $mainHue = $randseed() * 360;
        $mainColor = $this->hslToRgb($mainHue, 0.7, 0.5);
        
        // Spot color
        $spotHue = $randseed() * 360;
        $spotColor = $this->hslToRgb($spotHue, 0.8, 0.6);
        
        return [
            'bg' => $bgColor,
            'main' => $mainColor,
            'spot' => $spotColor,
        ];
    }

    /**
     * Generate the blocky pattern
     */
    protected function generatePattern(\Closure $randseed): array
    {
        $canvas = [];
        $midpoint = floor($this->size / 2);
        
        // Generate one half of the pattern
        for ($y = 0; $y < $this->size; $y++) {
            $canvas[$y] = [];
            for ($x = 0; $x < $midpoint + ($this->size % 2); $x++) {
                // Determine color based on random value
                $rand = $randseed();
                if ($rand < 0.3) {
                    $color = 'bg';
                } elseif ($rand < 0.7) {
                    $color = 'main';
                } else {
                    $color = 'spot';
                }
                
                $canvas[$y][$x] = $color;
            }
        }
        
        // Mirror the pattern to create symmetry
        for ($y = 0; $y < $this->size; $y++) {
            for ($x = $midpoint + ($this->size % 2); $x < $this->size; $x++) {
                $mirrorX = $this->size - 1 - $x;
                $canvas[$y][$x] = $canvas[$y][$mirrorX];
            }
        }
        
        return $canvas;
    }

    /**
     * Render the pattern to PNG format
     */
    protected function renderToPng(): string
    {
        $imageSize = $this->size * $this->scale;
        
        // Create image
        $image = imagecreatetruecolor($imageSize, $imageSize);
        
        // Allocate colors
        $gdColors = [];
        foreach ($this->colors as $name => $rgb) {
            $gdColors[$name] = imagecolorallocate(
                $image,
                $rgb['r'],
                $rgb['g'],
                $rgb['b']
            );
        }
        
        // Fill the image with background color
        imagefill($image, 0, 0, $gdColors['bg']);
        
        // Draw the blocks
        for ($y = 0; $y < $this->size; $y++) {
            for ($x = 0; $x < $this->size; $x++) {
                $colorName = $this->canvas[$y][$x];
                $color = $gdColors[$colorName];
                
                $x1 = $x * $this->scale;
                $y1 = $y * $this->scale;
                $x2 = $x1 + $this->scale - 1;
                $y2 = $y1 + $this->scale - 1;
                
                imagefilledrectangle($image, $x1, $y1, $x2, $y2, $color);
            }
        }
        
        // Convert to PNG
        ob_start();
        imagepng($image, null, 9); // Max compression
        $pngData = ob_get_contents();
        ob_end_clean();
        
        // Clean up
        imagedestroy($image);
        
        return $pngData;
    }

    /**
     * Convert HSL to RGB
     */
    protected function hslToRgb(float $h, float $s, float $l): array
    {
        $h = $h / 360;
        
        if ($s == 0) {
            $r = $g = $b = $l;
        } else {
            $hue2rgb = function($p, $q, $t) {
                if ($t < 0) $t += 1;
                if ($t > 1) $t -= 1;
                if ($t < 1/6) return $p + ($q - $p) * 6 * $t;
                if ($t < 1/2) return $q;
                if ($t < 2/3) return $p + ($q - $p) * (2/3 - $t) * 6;
                return $p;
            };
            
            $q = $l < 0.5 ? $l * (1 + $s) : $l + $s - $l * $s;
            $p = 2 * $l - $q;
            
            $r = $hue2rgb($p, $q, $h + 1/3);
            $g = $hue2rgb($p, $q, $h);
            $b = $hue2rgb($p, $q, $h - 1/3);
        }
        
        return [
            'r' => round($r * 255),
            'g' => round($g * 255),
            'b' => round($b * 255),
        ];
    }

    /**
     * Get the pixel size of the generated image
     */
    public function getImageSize(): int
    {
        return $this->size * $this->scale;
    }

    /**
     * Set custom size and scale
     */
    public function setDimensions(int $size, int $scale): self
    {
        $this->size = $size;
        $this->scale = $scale;
        return $this;
    }
}