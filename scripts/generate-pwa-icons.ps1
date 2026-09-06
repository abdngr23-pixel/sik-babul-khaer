Add-Type -AssemblyName System.Drawing

$srcPath = Join-Path $PSScriptRoot "..\public\logo-babul-khaer.png"
$iconsDir = Join-Path $PSScriptRoot "..\public\icons"

if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir | Out-Null
}

$srcImage = [System.Drawing.Image]::FromFile($srcPath)

function Resize-Image {
    param(
        [System.Drawing.Image]$Image,
        [int]$TargetSize,
        [string]$DestPath,
        [int]$Padding = 0,
        [System.Drawing.Color]$BgColor = [System.Drawing.Color]::Transparent
    )

    $bitmap = New-Object System.Drawing.Bitmap $TargetSize, $TargetSize
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.Clear($BgColor)

    $usableSize = $TargetSize - (2 * $Padding)
    $ratio = [Math]::Min($usableSize / $Image.Width, $usableSize / $Image.Height)
    $newWidth = [int]($Image.Width * $ratio)
    $newHeight = [int]($Image.Height * $ratio)

    $destX = [int](($TargetSize - $newWidth) / 2)
    $destY = [int](($TargetSize - $newHeight) / 2)

    $graphics.DrawImage($Image, $destX, $destY, $newWidth, $newHeight)
    $graphics.Dispose()

    $bitmap.Save($DestPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
    Write-Host "Generated: $DestPath"
}

# 1. 192x192 standard icon
Resize-Image -Image $srcImage -TargetSize 192 -DestPath (Join-Path $iconsDir "icon-192.png") -Padding 8

# 2. 512x512 standard icon
Resize-Image -Image $srcImage -TargetSize 512 -DestPath (Join-Path $iconsDir "icon-512.png") -Padding 24

# 3. 512x512 maskable icon with emerald theme background (safe area compliant: 10% padding)
$emeraldBg = [System.Drawing.ColorTranslator]::FromHtml("#047857")
Resize-Image -Image $srcImage -TargetSize 512 -DestPath (Join-Path $iconsDir "icon-maskable-512.png") -Padding 64 -BgColor $emeraldBg

$srcImage.Dispose()
Write-Host "All PWA icons generated successfully!"
