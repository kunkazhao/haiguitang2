# PowerShell helper to run the site with portable Node.js on Windows
param(
  [int]$Port = $(if ($env:PORT) { [int]$env:PORT } else { 5173 })
)

$ErrorActionPreference = 'Stop'

function Ensure-Node {
  # Prefer system Node if available
  try {
    $v = & node -v 2>$null
    if ($LASTEXITCODE -eq 0 -and $v) {
      return (Get-Command node).Source
    }
  } catch {}

  # Portable Node within repo
  $tools = Join-Path $PSScriptRoot '.tools'
  $nodeDir = Join-Path $tools 'node-win'
  $nodeExe = Join-Path $nodeDir 'node.exe'

  if (Test-Path $nodeExe) { return $nodeExe }

  New-Item -ItemType Directory -Force -Path $nodeDir | Out-Null

  $version = 'v20.17.0'
  $zipName = "node-$version-win-x64.zip"
  $url = "https://nodejs.org/dist/$version/$zipName"
  $zipPath = Join-Path $nodeDir $zipName

  Write-Host "Downloading portable Node.js $version ..." -ForegroundColor Cyan
  Invoke-WebRequest -Uri $url -OutFile $zipPath -UseBasicParsing

  Write-Host "Extracting Node.js ..." -ForegroundColor Cyan
  Expand-Archive -Path $zipPath -DestinationPath $nodeDir -Force
  Remove-Item $zipPath -Force

  # The extracted folder is like node-v20.17.0-win-x64
  $extracted = Get-ChildItem $nodeDir | Where-Object { $_.PSIsContainer -and $_.Name -like 'node-*' } | Select-Object -First 1
  if (-not $extracted) { throw 'Failed to extract Node.js' }

  # Move contents up to node-win
  Get-ChildItem $extracted.FullName | ForEach-Object { Move-Item $_.FullName -Destination $nodeDir -Force }
  Remove-Item $extracted.FullName -Recurse -Force

  if (-not (Test-Path $nodeExe)) { throw 'node.exe not found after extraction' }
  return $nodeExe
}

function Test-PortFree([int]$p) {
  $inUse = (Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq $p }).Count -gt 0
  return (-not $inUse)
}

try {
  $nodePath = Ensure-Node
  Write-Host "Using Node: $nodePath" -ForegroundColor Green

  while (-not (Test-PortFree $Port)) { $Port++; }

  $url = "http://localhost:$Port"
  Write-Host "Starting server at $url ..." -ForegroundColor Green

  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = $nodePath
  $psi.WorkingDirectory = $PSScriptRoot
  $psi.ArgumentList.Add('server.js')
  $psi.ArgumentList.Add("--port=$Port")
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $psi.UseShellExecute = $false

  $proc = [System.Diagnostics.Process]::Start($psi)
  Start-Sleep -Milliseconds 800

  try { Start-Process $url } catch {}

  Write-Host "Server PID: $($proc.Id)" -ForegroundColor Yellow
  Write-Host 'Press Ctrl+C to stop. Showing live logs:' -ForegroundColor Yellow

  # Stream logs
  while (-not $proc.HasExited) {
    if (-not $proc.StandardOutput.EndOfStream) { Write-Host ($proc.StandardOutput.ReadLine()) }
    if (-not $proc.StandardError.EndOfStream) { Write-Host ($proc.StandardError.ReadLine()) -ForegroundColor Red }
    Start-Sleep -Milliseconds 50
  }
} catch {
  Write-Error $_
  exit 1
}

