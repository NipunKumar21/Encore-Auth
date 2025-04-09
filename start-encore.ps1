# Check if Docker Desktop is running
$dockerProcess = Get-Process "*Docker Desktop*" -ErrorAction SilentlyContinue

if (-not $dockerProcess) {
    Write-Host "Docker Desktop is not running. Starting Docker Desktop..."
    try {
        Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        
        # Wait for Docker to start with a longer timeout
        $timeout = 180  # 3 minutes timeout
        $timer = 0
        $dockerStarted = $false
        
        while ($timer -lt $timeout) {
            try {
                $dockerInfo = docker info 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "Docker Desktop is now running and responding!"
                    $dockerStarted = $true
                    break
                }
            }
            catch {
                Write-Host "Waiting for Docker Desktop to start... ($timer seconds)"
            }
            Start-Sleep -Seconds 5
            $timer += 5
        }
        
        if (-not $dockerStarted) {
            Write-Host "Error: Docker Desktop failed to start within $timeout seconds."
            Write-Host "Please start Docker Desktop manually and try again."
            exit 1
        }
    }
    catch {
        Write-Host "Error starting Docker Desktop: $_"
        Write-Host "Please start Docker Desktop manually and try again."
        exit 1
    }
}

# Verify Docker is responding before proceeding
try {
    $null = docker info
}
catch {
    Write-Host "Error: Docker is not responding properly. Please ensure Docker Desktop is running correctly."
    exit 1
}

# Change to backend directory and run Encore
Set-Location -Path "backend"
Write-Host "Starting Encore application..."
encore run 