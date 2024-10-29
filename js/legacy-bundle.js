/**
 * Legacy bundle for older browsers
 * This file includes necessary polyfills and transpiled code
 * for compatibility with older browsers (IE11, older Safari, etc.)
 */

// Polyfills for modern JavaScript features
(function(global) {
    // Promise polyfill
    if (typeof global.Promise !== 'function') {
        global.Promise = function(executor) {
            if (typeof executor !== 'function') {
                throw new TypeError('Promise resolver must be a function');
            }
            // Basic Promise implementation
            var callbacks = [];
            var state = 'pending';
            var value;

            function resolve(newValue) {
                if (state === 'pending') {
                    state = 'fulfilled';
                    value = newValue;
                    callbacks.forEach(function(callback) {
                        if (callback.onFulfilled) {
                            setTimeout(function() {
                                callback.onFulfilled(value);
                            }, 0);
                        }
                    });
                }
            }

            function reject(reason) {
                if (state === 'pending') {
                    state = 'rejected';
                    value = reason;
                    callbacks.forEach(function(callback) {
                        if (callback.onRejected) {
                            setTimeout(function() {
                                callback.onRejected(value);
                            }, 0);
                        }
                    });
                }
            }

            this.then = function(onFulfilled, onRejected) {
                return new Promise(function(resolve, reject) {
                    callbacks.push({
                        onFulfilled: function(value) {
                            try {
                                resolve(onFulfilled ? onFulfilled(value) : value);
                            } catch(ex) {
                                reject(ex);
                            }
                        },
                        onRejected: function(reason) {
                            try {
                                if (onRejected) {
                                    resolve(onRejected(reason));
                                } else {
                                    reject(reason);
                                }
                            } catch(ex) {
                                reject(ex);
                            }
                        }
                    });
                });
            };

            this.catch = function(onRejected) {
                return this.then(null, onRejected);
            };

            try {
                executor(resolve, reject);
            } catch(ex) {
                reject(ex);
            }
        };
    }

    // Array.from polyfill
    if (!Array.from) {
        Array.from = function(arrayLike) {
            return Array.prototype.slice.call(arrayLike);
        };
    }

    // Object.assign polyfill
    if (!Object.assign) {
        Object.assign = function(target) {
            if (target == null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }
            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource != null) {
                    for (var nextKey in nextSource) {
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
    }

    // Element.matches polyfill
    if (!Element.prototype.matches) {
        Element.prototype.matches = 
            Element.prototype.matchesSelector || 
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector || 
            Element.prototype.oMatchesSelector || 
            Element.prototype.webkitMatchesSelector ||
            function(s) {
                var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                    i = matches.length;
                while (--i >= 0 && matches.item(i) !== this) {}
                return i > -1;            
            };
    }

    // URLSearchParams polyfill
    if (!window.URLSearchParams) {
        window.URLSearchParams = function(init) {
            this.params = {};
            
            if (typeof init === 'string') {
                init = init.replace(/^\?/, '');
                var pairs = init.split('&');
                for (var i = 0; i < pairs.length; i++) {
                    var pair = pairs[i].split('=');
                    this.append(
                        decodeURIComponent(pair[0]),
                        pair.length > 1 ? decodeURIComponent(pair[1]) : ''
                    );
                }
            }
        };

        window.URLSearchParams.prototype.append = function(name, value) {
            if (!(name in this.params)) {
                this.params[name] = [];
            }
            this.params[name].push(value);
        };

        window.URLSearchParams.prototype.get = function(name) {
            return name in this.params ? this.params[name][0] : null;
        };

        window.URLSearchParams.prototype.getAll = function(name) {
            return name in this.params ? this.params[name] : [];
        };

        window.URLSearchParams.prototype.set = function(name, value) {
            this.params[name] = [value];
        };

        window.URLSearchParams.prototype.toString = function() {
            var pairs = [];
            for (var name in this.params) {
                var values = this.params[name];
                for (var i = 0; i < values.length; i++) {
                    pairs.push(
                        encodeURIComponent(name) + '=' + encodeURIComponent(values[i])
                    );
                }
            }
            return pairs.join('&');
        };
    }

})(typeof window !== 'undefined' ? window : this);

// Legacy-compatible version of main application code
(function(global) {
    // Store configuration
    var store = {
        state: {
            map: null,
            markers: new Map(),
            markerClusterGroup: null,
            activeStatus: [],
            language: 'en',
            darkMode: false,
            isInitialized: false,
            hospitals: [],
            filters: {
                continent: '',
                country: '',
                city: '',
                searchTerm: '',
                statuses: []
            },
            ui: {
                controlsVisible: false,
                legendVisible: true,
                selectedHospital: null,
                loading: false,
                error: null
            }
        },
        listeners: [],
        
        setState: function(newState) {
            Object.assign(this.state, newState);
            this.notify();
        },
        
        getState: function() {
            return this.state;
        },
        
        subscribe: function(listener) {
            this.listeners.push(listener);
            return function() {
                this.listeners = this.listeners.filter(function(l) {
                    return l !== listener;
                });
            }.bind(this);
        },
        
        notify: function() {
            this.listeners.forEach(function(listener) {
                try {
                    listener(this.state);
                } catch(error) {
                    console.error('Error in store listener:', error);
                }
            }.bind(this));
        }
    };

    // Utils
    var Utils = {
        debounce: function(func, wait) {
            var timeout;
            return function() {
                var context = this;
                var args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                    func.apply(context, args);
                }, wait);
            };
        },

        validateCoordinates: function(lat, lon) {
            return !isNaN(lat) && !isNaN(lon) &&
                lat >= -90 && lat <= 90 &&
                lon >= -180 && lon <= 180;
        },

        showError: function(message, duration) {
            var errorElement = document.getElementById('error-message');
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.style.display = 'block';
                if (duration > 0) {
                    setTimeout(function() {
                        errorElement.style.display = 'none';
                    }, duration);
                }
            }
        }
    };

    // Initialize map functionality for older browsers
    function initLegacyMap() {
        var mapContainer = document.getElementById('map');
        if (!mapContainer) {
            Utils.showError('Map container not found');
            return;
        }

        try {
            // Initialize Leaflet map
            var map = L.map('map', {
                center: [46.603354, 1.888334],
                zoom: 6,
                zoomControl: window.innerWidth > 1024
            });

            // Add tile layer
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);

            // Initialize marker cluster group
            var markerClusterGroup = L.markerClusterGroup();
            map.addLayer(markerClusterGroup);

            // Store map instance
            store.setState({
                map: map,
                markerClusterGroup: markerClusterGroup
            });

            // Initialize UI elements
            initLegacyUI();
        } catch (error) {
            Utils.showError('Failed to initialize map: ' + error.message);
        }
    }

    // Initialize UI for older browsers
    function initLegacyUI() {
        // Handle menu toggle
        var hamburgerMenu = document.getElementById('hamburger-menu');
        var controls = document.getElementById('controls');
        if (hamburgerMenu && controls) {
            hamburgerMenu.onclick = function() {
                controls.classList.toggle('visible');
                hamburgerMenu.classList.toggle('active');
            };
        }

        // Handle theme toggle
        var themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.onclick = function() {
                document.body.classList.toggle('dark-mode');
            };
        }

        // Handle filters
        var filters = ['country-filter', 'city-filter', 'hospital-search'];
        filters.forEach(function(id) {
            var element = document.getElementById(id);
            if (element) {
                element.onchange = Utils.debounce(function() {
                    updateFilters();
                }, 300);
            }
        });
    }

    // Initialize application
    function initLegacyApplication() {
        try {
            // Remove loading indicator
            var loader = document.getElementById('initial-loader');
            if (loader) {
                loader.style.display = 'none';
            }

            // Initialize map
            initLegacyMap();

            console.log('Legacy application initialized successfully');
        } catch (error) {
            Utils.showError('Failed to initialize application: ' + error.message);
            console.error('Legacy initialization error:', error);
        }
    }

    // Export to global scope
    global.initLegacyApplication = initLegacyApplication;
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLegacyApplication);
    } else {
        initLegacyApplication();
    }

})(typeof window !== 'undefined' ? window : this);