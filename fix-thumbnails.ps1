# Fix Windows File Explorer Thumbnails
# Run this script as Administrator

Write-Host "=== Windows Thumbnail Fix Script ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Enable thumbnails in registry
Write-Host "Step 1: Enabling thumbnails in registry..." -ForegroundColor Yellow
try {
    Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name IconsOnly -Value 0 -ErrorAction Stop
    Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name DisableThumbnailCache -Value 0 -ErrorAction Stop
    Write-Host "Registry settings updated" -ForegroundColor Green
} catch {
    Write-Host "Could not update registry (may need admin rights)" -ForegroundColor Red
}

# Step 2: Clear thumbnail cache
Write-Host "`nStep 2: Clearing thumbnail cache..." -ForegroundColor Yellow
$thumbCachePath = "$env:LOCALAPPDATA\Microsoft\Windows\Explorer"
if (Test-Path $thumbCachePath) {
    Get-ChildItem -Path $thumbCachePath -Filter "thumbcache_*.db" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "Thumbnail cache cleared" -ForegroundColor Green
}

# Step 3: Clear icon cache
Write-Host "`nStep 3: Clearing icon cache..." -ForegroundColor Yellow
$iconCachePath = "$env:LOCALAPPDATA\IconCache.db"
if (Test-Path $iconCachePath) {
    Remove-Item -Path $iconCachePath -Force -ErrorAction SilentlyContinue
    Write-Host "Icon cache cleared" -ForegroundColor Green
}

# Step 4: Restart Windows Explorer
Write-Host "`nStep 4: Restarting Windows Explorer..." -ForegroundColor Yellow
Stop-Process -Name explorer -Force
Start-Sleep -Seconds 2
Write-Host "Explorer restarted" -ForegroundColor Green

Write-Host "`n=== Fix Complete ===" -ForegroundColor Cyan
Write-Host "If thumbnails still don't show, try:" -ForegroundColor Yellow
Write-Host "- Right-click in folder > View > Large icons" -ForegroundColor White
Write-Host "- Press F5 to refresh" -ForegroundColor White
Write-Host "- Restart your computer" -ForegroundColor White
