<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class AvatarStorageService
{
    protected string $disk;
    protected string $directory;

    public function __construct(string $disk = 'public', string $directory = 'avatars')
    {
        $this->disk = $disk;
        $this->directory = $directory;
        
        // Ensure the avatars directory exists
        $this->ensureDirectoryExists();
    }

    /**
     * Store avatar image and return the public URL
     */
    public function storeAvatar(string $walletAddress, string $imageData): ?string
    {
        try {
            $filename = $this->generateFilename($walletAddress);
            $filePath = $this->directory . '/' . $filename;
            
            // Check if file already exists
            if (Storage::disk($this->disk)->exists($filePath)) {
                Log::info('Avatar already exists, returning existing URL', [
                    'wallet_address' => $walletAddress,
                    'filename' => $filename,
                ]);
                return $this->getPublicUrl($filename);
            }
            
            // Store the image
            $success = Storage::disk($this->disk)->put($filePath, $imageData);
            
            if (!$success) {
                Log::error('Failed to store avatar image', [
                    'wallet_address' => $walletAddress,
                    'file_path' => $filePath,
                ]);
                return null;
            }
            
            Log::info('Avatar stored successfully', [
                'wallet_address' => $walletAddress,
                'filename' => $filename,
                'size' => strlen($imageData),
            ]);
            
            return $this->getPublicUrl($filename);
            
        } catch (\Exception $e) {
            Log::error('Exception while storing avatar', [
                'wallet_address' => $walletAddress,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Get the public URL for an avatar
     */
    public function getAvatarUrl(string $walletAddress): ?string
    {
        $filename = $this->generateFilename($walletAddress);
        $filePath = $this->directory . '/' . $filename;
        
        if (Storage::disk($this->disk)->exists($filePath)) {
            return $this->getPublicUrl($filename);
        }
        
        return null;
    }

    /**
     * Check if avatar exists for a wallet address
     */
    public function avatarExists(string $walletAddress): bool
    {
        $filename = $this->generateFilename($walletAddress);
        $filePath = $this->directory . '/' . $filename;
        
        return Storage::disk($this->disk)->exists($filePath);
    }

    /**
     * Delete avatar for a wallet address
     */
    public function deleteAvatar(string $walletAddress): bool
    {
        try {
            $filename = $this->generateFilename($walletAddress);
            $filePath = $this->directory . '/' . $filename;
            
            if (Storage::disk($this->disk)->exists($filePath)) {
                $success = Storage::disk($this->disk)->delete($filePath);
                
                if ($success) {
                    Log::info('Avatar deleted successfully', [
                        'wallet_address' => $walletAddress,
                        'filename' => $filename,
                    ]);
                }
                
                return $success;
            }
            
            return true; // File doesn't exist, consider it deleted
            
        } catch (\Exception $e) {
            Log::error('Exception while deleting avatar', [
                'wallet_address' => $walletAddress,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Regenerate avatar for a wallet address
     */
    public function regenerateAvatar(string $walletAddress, BlockiesGeneratorService $generator): ?string
    {
        // Delete existing avatar first
        $this->deleteAvatar($walletAddress);
        
        // Generate new avatar
        $imageData = $generator->generateBlockies($walletAddress);
        
        if ($imageData === null) {
            return null;
        }
        
        return $this->storeAvatar($walletAddress, $imageData);
    }

    /**
     * Get storage statistics
     */
    public function getStorageStats(): array
    {
        try {
            $files = Storage::disk($this->disk)->files($this->directory);
            $totalSize = 0;
            
            foreach ($files as $file) {
                $totalSize += Storage::disk($this->disk)->size($file);
            }
            
            return [
                'total_avatars' => count($files),
                'total_size_bytes' => $totalSize,
                'total_size_mb' => round($totalSize / 1024 / 1024, 2),
                'directory' => $this->directory,
                'disk' => $this->disk,
            ];
            
        } catch (\Exception $e) {
            Log::error('Exception while getting storage stats', [
                'error' => $e->getMessage(),
            ]);
            return [
                'total_avatars' => 0,
                'total_size_bytes' => 0,
                'total_size_mb' => 0,
                'directory' => $this->directory,
                'disk' => $this->disk,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Generate a deterministic filename based on wallet address
     */
    protected function generateFilename(string $walletAddress): string
    {
        $hash = md5(strtolower(trim($walletAddress)));
        return $hash . '.png';
    }

    /**
     * Get the public URL for a filename
     */
    protected function getPublicUrl(string $filename): string
    {
        // For public disk, return the storage URL
        if ($this->disk === 'public') {
            return '/storage/' . $this->directory . '/' . $filename;
        }
        
        // For other disks, use Storage::url()
        return Storage::disk($this->disk)->url($this->directory . '/' . $filename);
    }

    /**
     * Ensure the avatars directory exists
     */
    protected function ensureDirectoryExists(): void
    {
        try {
            $directoryPath = $this->directory;
            
            if (!Storage::disk($this->disk)->exists($directoryPath)) {
                Storage::disk($this->disk)->makeDirectory($directoryPath);
                Log::info('Created avatars directory', [
                    'directory' => $directoryPath,
                    'disk' => $this->disk,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to create avatars directory', [
                'directory' => $this->directory,
                'disk' => $this->disk,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Cleanup orphaned avatar files (files without corresponding users)
     */
    public function cleanupOrphanedAvatars(array $validWalletAddresses): int
    {
        try {
            $files = Storage::disk($this->disk)->files($this->directory);
            $deletedCount = 0;
            
            // Create set of valid filenames
            $validFilenames = [];
            foreach ($validWalletAddresses as $walletAddress) {
                $validFilenames[] = $this->generateFilename($walletAddress);
            }
            $validFilenamesSet = array_flip($validFilenames);
            
            foreach ($files as $file) {
                $filename = basename($file);
                
                // Skip if not a PNG file
                if (!str_ends_with($filename, '.png')) {
                    continue;
                }
                
                // Delete if not in valid set
                if (!isset($validFilenamesSet[$filename])) {
                    Storage::disk($this->disk)->delete($file);
                    $deletedCount++;
                    
                    Log::info('Deleted orphaned avatar', [
                        'filename' => $filename,
                    ]);
                }
            }
            
            return $deletedCount;
            
        } catch (\Exception $e) {
            Log::error('Exception during cleanup', [
                'error' => $e->getMessage(),
            ]);
            return 0;
        }
    }

    /**
     * Set custom disk and directory
     */
    public function setStorage(string $disk, string $directory): self
    {
        $this->disk = $disk;
        $this->directory = $directory;
        $this->ensureDirectoryExists();
        return $this;
    }
}