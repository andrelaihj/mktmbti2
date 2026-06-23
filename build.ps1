# Build script
cd "C:\Users\80547\Desktop\mktmbti2"
if (Test-Path dist) {
    Remove-Item -Recurse -Force dist
}
npm run build
Write-Host "Build completed"
