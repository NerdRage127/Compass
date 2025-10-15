// Compass Application
// Handles geolocation, device orientation, and bearing calculations

class CompassApp {
    constructor() {
        // Points of Interest in Blue Ridge, Georgia and surrounding areas
        this.locations = {
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
        this.targetLocation1 = null;
        this.targetLocation2 = null;
        this.deviceHeading = 0;
        this.watchId = null;
        
        // Track previous needle rotations for smooth animation
        this.prevNeedleRotation1 = 0;
        this.prevNeedleRotation2 = 0;

        this.initializeElements();
        this.setupEventListeners();
        this.requestLocation();
        this.requestOrientation();
    }

    initializeElements() {
        this.compass = document.getElementById('compass');
        this.compassRose = document.getElementById('compass-rose');
        this.needleNorth = document.getElementById('needle-north');
        this.needle1 = document.getElementById('needle-1');
        this.needle2 = document.getElementById('needle-2');
        
        this.direction1Element = document.getElementById('direction-1');
        this.distance1Element = document.getElementById('distance-1');
        this.time1Element = document.getElementById('time-1');
        
        this.direction2Element = document.getElementById('direction-2');
        this.distance2Element = document.getElementById('distance-2');
        this.time2Element = document.getElementById('time-2');
        
        this.statusText = document.getElementById('status-text');
        
        this.targetSelect1 = document.getElementById('target-select-1');
        this.customLocationDiv1 = document.getElementById('custom-location-1');
        this.customLatInput1 = document.getElementById('custom-lat-1');
        this.customLngInput1 = document.getElementById('custom-lng-1');
        this.setCustomButton1 = document.getElementById('set-custom-1');
        
        this.targetSelect2 = document.getElementById('target-select-2');
        this.customLocationDiv2 = document.getElementById('custom-location-2');
        this.customLatInput2 = document.getElementById('custom-lat-2');
        this.customLngInput2 = document.getElementById('custom-lng-2');
        this.setCustomButton2 = document.getElementById('set-custom-2');
    }

    setupEventListeners() {
        this.targetSelect1.addEventListener('change', () => this.handleTargetChange(1));
        this.setCustomButton1.addEventListener('click', () => this.setCustomLocation(1));
        this.customLatInput1.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.setCustomLocation(1);
        });
        this.customLngInput1.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.setCustomLocation(1);
        });
        
        this.targetSelect2.addEventListener('change', () => this.handleTargetChange(2));
        this.setCustomButton2.addEventListener('click', () => this.setCustomLocation(2));
        this.customLatInput2.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.setCustomLocation(2);
        });
        this.customLngInput2.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.setCustomLocation(2);
        });
    }

    handleTargetChange(needleNum) {
        const select = needleNum === 1 ? this.targetSelect1 : this.targetSelect2;
        const customDiv = needleNum === 1 ? this.customLocationDiv1 : this.customLocationDiv2;
        const selectedValue = select.value;
        
        if (selectedValue === `custom-${needleNum}`) {
            customDiv.style.display = 'block';
        } else {
            customDiv.style.display = 'none';
            if (selectedValue === '') {
                // No destination selected
                if (needleNum === 1) {
                    this.targetLocation1 = null;
                } else {
                    this.targetLocation2 = null;
                }
            } else {
                const location = this.locations[selectedValue];
                if (needleNum === 1) {
                    this.targetLocation1 = location;
                } else {
                    this.targetLocation2 = location;
                }
            }
            this.updateCompass();
        }
    }

    setCustomLocation(needleNum) {
        const latInput = needleNum === 1 ? this.customLatInput1 : this.customLatInput2;
        const lngInput = needleNum === 1 ? this.customLngInput1 : this.customLngInput2;
        
        const lat = parseFloat(latInput.value);
        const lng = parseFloat(lngInput.value);

        if (isNaN(lat) || isNaN(lng)) {
            alert('Please enter valid coordinates');
            return;
        }

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            alert('Coordinates out of range. Latitude: -90 to 90, Longitude: -180 to 180');
            return;
        }

        const location = {
            lat: lat,
            lng: lng,
            name: `Custom Location ${needleNum}`
        };
        
        if (needleNum === 1) {
            this.targetLocation1 = location;
        } else {
            this.targetLocation2 = location;
        }

        this.updateCompass();
        this.updateStatus(`Destination ${needleNum}: Custom Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
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

        // Set initial target 1 to hospital if none selected
        if (!this.targetLocation1) {
            this.targetLocation1 = this.locations.hospital;
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
        const R = 3959; // Earth's radius in miles (changed from km)
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
    
    calculateDrivingTime(distanceMiles) {
        // Average speed: 40 mph (considering mountain roads, traffic, etc.)
        const avgSpeedMph = 40;
        const hours = distanceMiles / avgSpeedMph;
        const minutes = Math.round(hours * 60);
        
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hrs = Math.floor(minutes / 60);
            const mins = minutes % 60;
            if (mins === 0) {
                return `${hrs} hr`;
            }
            return `${hrs} hr ${mins} min`;
        }
    }

    getDirectionName(bearing) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                          'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(bearing / 22.5) % 16;
        return directions[index];
    }

    formatDistance(miles) {
        if (miles < 0.1) {
            return `${Math.round(miles * 5280)} ft`;
        } else if (miles < 10) {
            return `${miles.toFixed(2)} mi`;
        } else {
            return `${Math.round(miles)} mi`;
        }
    }

    updateCompass() {
        if (!this.currentLocation) {
            return;
        }

        // Rotate compass rose to always point north (opposite of device heading)
        let roseRotation = -this.deviceHeading;
        this.compassRose.style.transform = `rotate(${roseRotation}deg)`;

        // North needle always points to true north (0 degrees relative to compass rose)
        // Since the rose rotates with device heading, the north needle stays at 0
        this.needleNorth.style.transform = `translate(-50%, -100%) rotate(0deg)`;

        // Update destination 1
        if (this.targetLocation1) {
            const bearing1 = this.calculateBearing(
                this.currentLocation.lat,
                this.currentLocation.lng,
                this.targetLocation1.lat,
                this.targetLocation1.lng
            );

            // Calculate needle rotation relative to compass rose
            let needleRotation1 = bearing1;
            
            // Adjust angle to be closest to previous rotation (smooth animation)
            let diff = needleRotation1 - this.prevNeedleRotation1;
            while (diff > 180) {
                needleRotation1 -= 360;
                diff = needleRotation1 - this.prevNeedleRotation1;
            }
            while (diff < -180) {
                needleRotation1 += 360;
                diff = needleRotation1 - this.prevNeedleRotation1;
            }
            
            this.prevNeedleRotation1 = needleRotation1;

            this.needle1.style.transform = `translate(-50%, -100%) rotate(${needleRotation1}deg)`;
            this.needle1.style.display = 'block';

            // Update info
            this.direction1Element.textContent = this.getDirectionName(bearing1);
            
            const distance1 = this.calculateDistance(
                this.currentLocation.lat,
                this.currentLocation.lng,
                this.targetLocation1.lat,
                this.targetLocation1.lng
            );
            this.distance1Element.textContent = this.formatDistance(distance1);
            this.time1Element.textContent = this.calculateDrivingTime(distance1);
        } else {
            this.needle1.style.display = 'none';
            this.direction1Element.textContent = '--';
            this.distance1Element.textContent = '--';
            this.time1Element.textContent = '--';
        }

        // Update destination 2
        if (this.targetLocation2) {
            const bearing2 = this.calculateBearing(
                this.currentLocation.lat,
                this.currentLocation.lng,
                this.targetLocation2.lat,
                this.targetLocation2.lng
            );

            // Calculate needle rotation relative to compass rose
            let needleRotation2 = bearing2;
            
            // Adjust angle to be closest to previous rotation (smooth animation)
            let diff = needleRotation2 - this.prevNeedleRotation2;
            while (diff > 180) {
                needleRotation2 -= 360;
                diff = needleRotation2 - this.prevNeedleRotation2;
            }
            while (diff < -180) {
                needleRotation2 += 360;
                diff = needleRotation2 - this.prevNeedleRotation2;
            }
            
            this.prevNeedleRotation2 = needleRotation2;

            this.needle2.style.transform = `translate(-50%, -100%) rotate(${needleRotation2}deg)`;
            this.needle2.style.display = 'block';

            // Update info
            this.direction2Element.textContent = this.getDirectionName(bearing2);
            
            const distance2 = this.calculateDistance(
                this.currentLocation.lat,
                this.currentLocation.lng,
                this.targetLocation2.lat,
                this.targetLocation2.lng
            );
            this.distance2Element.textContent = this.formatDistance(distance2);
            this.time2Element.textContent = this.calculateDrivingTime(distance2);
        } else {
            this.needle2.style.display = 'none';
            this.direction2Element.textContent = '--';
            this.distance2Element.textContent = '--';
            this.time2Element.textContent = '--';
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
