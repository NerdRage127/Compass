// Compass Application
// Handles geolocation, device orientation, and bearing calculations

class CompassApp {
    constructor() {
        // Points of Interest in Blue Ridge, Georgia and surrounding areas
        this.locations = {
            north: { lat: 90, lng: 0, name: 'True North' },
            // Blue Ridge Area
            hospital: { lat: 34.8642, lng: -84.3243, name: 'Blue Ridge Medical Center' },
            downtown: { lat: 34.8648, lng: -84.3241, name: 'Downtown Blue Ridge' },
            lake: { lat: 34.8847, lng: -84.3133, name: 'Lake Blue Ridge' },
            'scenic-railway': { lat: 34.8678, lng: -84.3258, name: 'Blue Ridge Scenic Railway' },
            'toccoa-river': { lat: 34.8700, lng: -84.3300, name: 'Toccoa River' },
            // Nearby Towns & Attractions
            'ellijay': { lat: 34.6948, lng: -84.4826, name: 'Ellijay' },
            'blue-ridge-lake-dam': { lat: 34.8794, lng: -84.3086, name: 'Blue Ridge Lake Dam' },
            'morganton': { lat: 34.8668, lng: -84.2391, name: 'Morganton' },
            'cherry-log': { lat: 34.7931, lng: -84.3796, name: 'Cherry Log' },
            'mineral-bluff': { lat: 34.9373, lng: -84.3041, name: 'Mineral Bluff' },
            'mccaysville': { lat: 34.9834, lng: -84.3752, name: 'McCaysville' },
            'copperhill-tn': { lat: 35.0134, lng: -84.3710, name: 'Copperhill, TN' },
            // Popular Destinations
            'amicalola-falls': { lat: 34.5614, lng: -84.2497, name: 'Amicalola Falls State Park' },
            'dahlonega': { lat: 34.5332, lng: -83.9843, name: 'Dahlonega' },
            'helen': { lat: 34.7026, lng: -83.7277, name: 'Helen, GA' },
            'brasstown-bald': { lat: 34.8740, lng: -83.8109, name: 'Brasstown Bald' },
            'vogel-state-park': { lat: 34.7656, lng: -83.9331, name: 'Vogel State Park' }
        };

        this.currentLocation = null;
        this.targetLocation = null;
        this.deviceHeading = 0;
        this.targetBearing = 0;
        this.watchId = null;

        this.initializeElements();
        this.setupEventListeners();
        this.requestLocation();
        this.requestOrientation();
    }

    initializeElements() {
        this.needle = document.getElementById('needle');
        this.compass = document.getElementById('compass');
        this.directionElement = document.getElementById('direction');
        this.bearingElement = document.getElementById('bearing');
        this.distanceElement = document.getElementById('distance');
        this.statusText = document.getElementById('status-text');
        this.targetSelect = document.getElementById('target-select');
        this.customLocationDiv = document.getElementById('custom-location');
        this.customLatInput = document.getElementById('custom-lat');
        this.customLngInput = document.getElementById('custom-lng');
        this.setCustomButton = document.getElementById('set-custom');
    }

    setupEventListeners() {
        this.targetSelect.addEventListener('change', () => this.handleTargetChange());
        this.setCustomButton.addEventListener('click', () => this.setCustomLocation());
        
        // Handle Enter key in custom location inputs
        this.customLatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.setCustomLocation();
        });
        this.customLngInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.setCustomLocation();
        });
    }

    handleTargetChange() {
        const selectedValue = this.targetSelect.value;
        
        if (selectedValue === 'custom') {
            this.customLocationDiv.style.display = 'block';
        } else {
            this.customLocationDiv.style.display = 'none';
            this.targetLocation = this.locations[selectedValue];
            this.updateCompass();
        }
    }

    setCustomLocation() {
        const lat = parseFloat(this.customLatInput.value);
        const lng = parseFloat(this.customLngInput.value);

        if (isNaN(lat) || isNaN(lng)) {
            alert('Please enter valid coordinates');
            return;
        }

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            alert('Coordinates out of range. Latitude: -90 to 90, Longitude: -180 to 180');
            return;
        }

        this.targetLocation = {
            lat: lat,
            lng: lng,
            name: 'Custom Location'
        };

        this.updateCompass();
        this.updateStatus(`Target: Custom Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    }

    requestLocation() {
        if (!navigator.geolocation) {
            this.updateStatus('Geolocation not supported by your browser');
            return;
        }

        this.updateStatus('Requesting location access...');

        this.watchId = navigator.geolocation.watchPosition(
            (position) => this.handleLocationSuccess(position),
            (error) => this.handleLocationError(error),
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            }
        );
    }

    handleLocationSuccess(position) {
        this.currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        // Set initial target to True North if none selected
        if (!this.targetLocation) {
            this.targetLocation = this.locations.north;
        }

        this.updateCompass();
        this.updateStatus(`Location acquired: ${this.currentLocation.lat.toFixed(4)}, ${this.currentLocation.lng.toFixed(4)}`);
    }

    handleLocationError(error) {
        let message = 'Unable to get location: ';
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message += 'Permission denied. Please allow location access.';
                break;
            case error.POSITION_UNAVAILABLE:
                message += 'Location unavailable.';
                break;
            case error.TIMEOUT:
                message += 'Request timeout.';
                break;
            default:
                message += 'Unknown error.';
        }
        this.updateStatus(message);
    }

    requestOrientation() {
        // Check if device orientation is available
        if ('ondeviceorientationabsolute' in window) {
            window.addEventListener('deviceorientationabsolute', (event) => this.handleOrientation(event), true);
        } else if ('ondeviceorientation' in window) {
            window.addEventListener('deviceorientation', (event) => this.handleOrientation(event), true);
        } else {
            // Fallback: assume device is pointing north
            this.deviceHeading = 0;
        }

        // For iOS 13+ we need to request permission
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            this.compass.addEventListener('click', () => {
                DeviceOrientationEvent.requestPermission()
                    .then(response => {
                        if (response === 'granted') {
                            window.addEventListener('deviceorientation', (event) => this.handleOrientation(event), true);
                        }
                    })
                    .catch(console.error);
            }, { once: true });
        }
    }

    handleOrientation(event) {
        // Get the compass heading
        let heading = event.webkitCompassHeading || event.alpha;
        
        if (heading !== null && heading !== undefined) {
            // webkitCompassHeading gives true heading (0 = North)
            // alpha gives rotation around z-axis (0 = North when device is flat)
            if (event.webkitCompassHeading) {
                this.deviceHeading = heading;
            } else {
                // For alpha, we need to convert: 0° is North, 90° is East, etc.
                this.deviceHeading = 360 - heading;
            }
            
            this.updateCompass();
        }
    }

    calculateBearing(lat1, lon1, lat2, lon2) {
        // Special case for True North
        if (lat2 === 90) {
            return 0; // Always point north
        }

        // Convert to radians
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        // Calculate bearing
        const y = Math.sin(Δλ) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) -
                  Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
        
        let bearing = Math.atan2(y, x) * 180 / Math.PI;
        
        // Normalize to 0-360
        bearing = (bearing + 360) % 360;
        
        return bearing;
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        // Haversine formula for distance
        const R = 6371; // Earth's radius in km
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        const distance = R * c;
        
        return distance;
    }

    getDirectionName(bearing) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                          'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(bearing / 22.5) % 16;
        return directions[index];
    }

    formatDistance(km) {
        if (km < 1) {
            return `${Math.round(km * 1000)} m`;
        } else if (km < 10) {
            return `${km.toFixed(2)} km`;
        } else {
            return `${Math.round(km)} km`;
        }
    }

    updateCompass() {
        if (!this.currentLocation || !this.targetLocation) {
            return;
        }

        // Calculate bearing to target
        this.targetBearing = this.calculateBearing(
            this.currentLocation.lat,
            this.currentLocation.lng,
            this.targetLocation.lat,
            this.targetLocation.lng
        );

        // Calculate the angle the needle should point
        // Needle should point to target relative to device heading
        let needleRotation = this.targetBearing - this.deviceHeading;

        // Normalize angle to take shortest path (-180 to 180)
        // This prevents the needle from spinning all the way around
        while (needleRotation > 180) needleRotation -= 360;
        while (needleRotation < -180) needleRotation += 360;

        // Update needle rotation
        this.needle.style.transform = `translate(-50%, -100%) rotate(${needleRotation}deg)`;

        // Update bearing info
        this.bearingElement.textContent = `${Math.round(this.targetBearing)}°`;
        this.directionElement.textContent = this.getDirectionName(this.targetBearing);

        // Calculate and display distance (skip for True North)
        if (this.targetLocation.lat !== 90) {
            const distance = this.calculateDistance(
                this.currentLocation.lat,
                this.currentLocation.lng,
                this.targetLocation.lat,
                this.targetLocation.lng
            );
            this.distanceElement.textContent = this.formatDistance(distance);
        } else {
            this.distanceElement.textContent = '--';
        }
    }

    updateStatus(message) {
        this.statusText.textContent = message;
    }

    destroy() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
        }
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.compassApp = new CompassApp();
});
