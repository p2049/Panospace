# Advanced Thumbnail Fix - Run as Administrator
Write-Host "=== Advanced Thumbnail Fix ===" -ForegroundColor Cyan

# Check current view settings
Write-Host "`nChecking current settings..." -ForegroundColor Yellow
$iconOnly = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name IconsOnly -ErrorAction SilentlyContinue
Write-Host "IconsOnly setting: $($iconOnly.IconsOnly)" -ForegroundColor White

# Force enable all thumbnail settings
Write-Host "`nForcing thumbnail settings..." -ForegroundColor Yellow
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name IconsOnly -Value 0 -Force
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name DisableThumbnailCache -Value 0 -Force
New-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer" -Name DisableThumbnails -Value 0 -PropertyType DWORD -Force -ErrorAction SilentlyContinue

# Disable "Always show icons, never thumbnails"
Write-Host "Disabling 'Always show icons, never thumbnails'..." -ForegroundColor Yellow
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name AlwaysShowMenus -Value 0 -Force -ErrorAction SilentlyContinue

# Kill all explorer processes
Write-Host "`nKilling all Explorer processes..." -ForegroundColor Yellow
Get-Process explorer | Stop-Process -Force
Start-Sleep -Seconds 3

# Delete ALL cache files
Write-Host "Deleting all cache files..." -ForegroundColor Yellow
Remove-Item -Path "$env:LOCALAPPDATA\Microsoft\Windows\Explorer\*" -Force -Recurse -ErrorAction SilentlyContinue
Remove-Item -Path "$env:LOCALAPPDATA\IconCache.db" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:LOCALAPPDATA\Microsoft\Windows\Caches\*" -Force -Recurse -ErrorAction SilentlyContinue

# Restart Explorer
Write-Host "Starting Explorer..." -ForegroundColor Yellow
Start-Process explorer.exe
Start-Sleep -Seconds 2

Write-Host "`n=== DONE ===" -ForegroundColor Green
Write-Host "`nNOW DO THIS MANUALLY:" -ForegroundColor Cyan
Write-Host "1. Open File Explorer" -ForegroundColor White
Write-Host "2. Click VIEW tab at the top" -ForegroundColor White
Write-Host "3. Click OPTIONS (far right)" -ForegroundColor White
Write-Host "4. Go to VIEW tab in the popup" -ForegroundColor White
Write-Host "5. UNCHECK 'Always show icons, never thumbnails'" -ForegroundColor Yellow
Write-Host "6. Click APPLY then OK" -ForegroundColor White
Write-Host "7. Change view to 'Large icons' or 'Extra large icons'" -ForegroundColor White
Write-Host "`nPress any key after you've done this..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "`nIf STILL not working, you may need to:" -ForegroundColor Red
Write-Host "- Restart your computer" -ForegroundColor White
Write-Host "- Run System File Checker: sfc /scannow" -ForegroundColor White
Write-Host "- Check Windows Performance Options (disable 'Show thumbnails instead of icons')" -ForegroundColor White
