$payloadFile = "f:\PANOSPACE MASTER\Panospace\PANOSPACE_MIGRATION_PAYLOAD.txt"
$profileDir = "f:\PANOSPACE MASTER\Panospace\src\components\profile"
$constantsDir = "f:\PANOSPACE MASTER\Panospace\src\core\constants"

# Initialize file
"" > $payloadFile

Function Append-File {
    param ($path, $relativePath)
    "Processing: $relativePath"
    "=== FILE_START: $relativePath ===" | Out-File -FilePath $payloadFile -Append -Encoding utf8
    Get-Content $path -Raw | Out-File -FilePath $payloadFile -Append -Encoding utf8
    "`n=== FILE_END ===`n" | Out-File -FilePath $payloadFile -Append -Encoding utf8
}

# 1. Constants
Append-File "$constantsDir\bannerThemes.js" "src/core/constants/bannerThemes.js"
Append-File "$constantsDir\bannerOverlays.js" "src/core/constants/bannerOverlays.js"
Append-File "$constantsDir\colorPacks.ts" "src/core/constants/colorPacks.ts"

# 2. Renderers
Append-File "$profileDir\BannerThemeRenderer.jsx" "src/components/profile/BannerThemeRenderer.jsx"
Append-File "$profileDir\BannerOverlayRenderer.jsx" "src/components/profile/BannerOverlayRenderer.jsx"

# 3. All Banners
$banners = Get-ChildItem -Path $profileDir -Filter "*Banner.jsx"
foreach ($file in $banners) {
    Append-File $file.FullName "src/components/profile/$($file.Name)"
}

# 4. Other key files in profile dir (like LiquidBanners.jsx, OmegaBorealis.jsx)
$others = Get-ChildItem -Path $profileDir -Filter "*.jsx" | Where-Object { $_.Name -notlike "*Banner.jsx" -and $_.Name -ne "BannerThemeRenderer.jsx" -and $_.Name -ne "BannerOverlayRenderer.jsx" -and $_.Name -ne "EditProfile.jsx" }
foreach ($file in $others) {
    Append-File $file.FullName "src/components/profile/$($file.Name)"
}

Write-Host "Payload generation complete at $payloadFile"
