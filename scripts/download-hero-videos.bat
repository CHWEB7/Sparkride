@echo off
echo Downloading hero videos for self-hosted playback...
cd /d "%~dp0\.."
if not exist "public\videos" mkdir "public\videos"

powershell -Command "Invoke-WebRequest -Uri 'https://assets.mixkit.co/videos/preview/mixkit-electric-car-at-charging-station-50380-large.mp4' -OutFile 'public\videos\hero-charge.mp4'"
powershell -Command "Invoke-WebRequest -Uri 'https://assets.mixkit.co/videos/preview/mixkit-driving-a-green-electric-car-50378-large.mp4' -OutFile 'public\videos\hero-drive.mp4'"

echo Done. Files saved to public\videos\
dir public\videos
