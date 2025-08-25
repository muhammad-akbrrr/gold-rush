<?php
header('Content-Type: text/plain');

echo "=== Laravel Bootstrap Diagnostic ===\n\n";

try {
  echo "1. PHP Version: " . PHP_VERSION . "\n";
  echo "2. Memory Limit: " . ini_get('memory_limit') . "\n\n";

  echo "3. Loading autoload...\n";
  require __DIR__ . '/../vendor/autoload.php';
  echo "   Autoload loaded successfully\n\n";

  echo "4. Loading Laravel app...\n";
  $app = require_once __DIR__ . '/../bootstrap/app.php';
  echo "   Laravel app created successfully\n\n";

  echo "5. Checking environment variables...\n";
  echo "   APP_KEY exists: " . (env('APP_KEY') ? 'YES' : 'NO') . "\n";
  echo "   APP_KEY format: " . (str_starts_with(env('APP_KEY', ''), 'base64:') ? 'CORRECT' : 'INCORRECT') . "\n";
  echo "   DB_CONNECTION: " . env('DB_CONNECTION', 'not set') . "\n";
  echo "   DATABASE_URL exists: " . (env('DATABASE_URL') ? 'YES' : 'NO') . "\n\n";

  echo "6. Checking service providers...\n";
  $providers = $app->getLoadedProviders();
  $providerCount = count($providers);
  echo "   Total providers loaded: $providerCount\n";

  // Check for critical providers
  $criticalProviders = [
    'Illuminate\View\ViewServiceProvider',
    'Illuminate\Database\DatabaseServiceProvider',
    'Illuminate\Session\SessionServiceProvider',
    'App\Providers\AppServiceProvider'
  ];

  foreach ($criticalProviders as $provider) {
    $loaded = isset($providers[$provider]) ? '✅' : '❌';
    echo "   $provider: $loaded\n";
  }
  echo "\n";

  echo "7. Testing View service...\n";
  try {
    $view = $app->make('view');
    echo "   View service resolved successfully\n";
    echo "   View class: " . get_class($view) . "\n";
  } catch (Exception $e) {
    echo "   View service failed: " . $e->getMessage() . "\n";
  }
  echo "\n";

  echo "8. Testing Database connection...\n";
  try {
    $db = $app->make('db');
    echo "   Database service resolved successfully\n";
    echo "   Default connection: " . $db->getDefaultConnection() . "\n";

    // Test actual connection
    $db->connection()->getPdo();
    echo "   Database connection successful\n";
  } catch (Exception $e) {
    echo "   Database connection failed: " . $e->getMessage() . "\n";
  }
  echo "\n";

  echo "9. Testing Session service...\n";
  try {
    $session = $app->make('session');
    echo "   Session service resolved successfully\n";
    echo "   Session driver: " . get_class($session->driver()) . "\n";
  } catch (Exception $e) {
    echo "   Session service failed: " . $e->getMessage() . "\n";
  }

  echo "\n=== Diagnostic Complete ===\n";

} catch (Exception $e) {
  echo "\nFATAL ERROR: " . $e->getMessage() . "\n";
  echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
?>