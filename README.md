# Compass

A web-based compass application that points to specific locations, with preset points of interest around Blue Ridge, Georgia.

## Features

- 🧭 Points to True North or specific locations
- 📍 Preset Points of Interest in Blue Ridge, GA:
  - Blue Ridge Medical Center (Hospital)
  - Downtown Blue Ridge
  - Lake Blue Ridge
  - Blue Ridge Scenic Railway
  - Toccoa River
- 🗺️ Custom location input with coordinates
- 📱 Mobile-friendly responsive design
- 🎯 Real-time bearing and distance calculations

## Usage

1. Open `index.html` in a web browser
2. Allow location access when prompted
3. Allow device orientation access (required on iOS)
4. Hold your device flat (parallel to the ground)
5. Select a destination from the dropdown menu
6. The red needle will point to your selected destination

### Custom Locations

To use a custom location:
1. Select "Custom Location" from the dropdown
2. Right-click on Google Maps at your desired location
3. Click on the coordinates to copy them
4. Paste the latitude and longitude into the input fields
5. Click "Set Location"

## Technical Details

- Pure HTML, CSS, and JavaScript (no dependencies)
- Uses Geolocation API for user position
- Uses Device Orientation API for compass heading
- Haversine formula for distance calculations
- Great-circle navigation for bearing calculations

## Browser Compatibility

Works best on mobile devices with:
- Location services enabled
- Orientation sensors available
- Modern browsers (Chrome, Safari, Firefox, Edge)

## Local Development

Simply open `index.html` in a web browser. For HTTPS (required for some features), you can use:

```bash
# Python 3
python -m http.server 8000

# Node.js (with http-server)
npx http-server
```

Then access via `https://localhost:8000` (may need to accept self-signed certificate)

## License

MIT