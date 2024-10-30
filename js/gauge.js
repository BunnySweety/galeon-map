/**
 * @fileoverview Gauge Manager for hospital status visualization
 * @author AssistantAI
 * @version 1.0.0
 */

'use strict';

/**
 * @typedef {Object} GaugeOptions
 * @property {number} [radius=15.9155] - Radius of the gauge circle
 * @property {number} [strokeWidth=3] - Width of the gauge stroke
 * @property {string} [backgroundColor='#eee'] - Background circle color
 * @property {Object.<string, string>} [statusColors] - Color mapping for different statuses
 * @property {number} [animationDuration=500] - Duration of gauge animations in milliseconds
 * @property {string} [fontFamily='Arial, sans-serif'] - Font family for gauge text
 */

/**
 * @typedef {Object} GaugeElements
 * @property {HTMLElement} wrapper - The gauge wrapper element
 * @property {HTMLElement} svg - The SVG element
 * @property {HTMLElement} backgroundPath - The background circle path
 * @property {HTMLElement} valuePath - The value circle path
 * @property {HTMLElement} valueDisplay - The numeric value display
 * @property {HTMLElement} percentageDisplay - The percentage display
 * @property {HTMLElement} labelDisplay - The label display
 */

/**
 * @typedef {Object} GaugeData
 * @property {number} value - The current value
 * @property {number} total - The total value
 * @property {string} status - The status category
 */

/**
 * Class managing the creation and updates of gauge visualizations
 */
class GaugeManager {
    /**
     * @private
     * @type {Object.<string, GaugeElements>}
     */
    static #gauges = new Map();

    /**
     * @private
     * @type {GaugeOptions}
     */
    static #defaultOptions = {
        radius: 15.9155,
        strokeWidth: 3,
        backgroundColor: '#eee',
        statusColors: {
            'Deployed': '#4CAF50',
            'In Progress': '#FFA500',
            'Signed': '#2196F3'
        },
        animationDuration: 500,
        fontFamily: 'Arial, sans-serif'
    };

    /**
     * Initialize all gauge elements on the page
     * @param {GaugeOptions} [options] - Configuration options for the gauges
     * @returns {Promise<void>}
     */
    static async initGauges(options = {}) {
        try {
            console.log('Initializing gauges...');
            this.#defaultOptions = { ...this.#defaultOptions, ...options };

            const gaugeWrappers = document.querySelectorAll('.gauge-wrapper');
            if (!gaugeWrappers.length) {
                console.warn('No gauge elements found');
                return;
            }

            gaugeWrappers.forEach(wrapper => {
                const status = wrapper.getAttribute('data-status');
                if (!status) {
                    console.warn('Gauge wrapper missing data-status attribute:', wrapper);
                    return;
                }

                const elements = this.#createGaugeElements(wrapper, status);
                if (elements) {
                    this.#gauges.set(status, elements);
                }
            });

            console.log(`Initialized ${this.#gauges.size} gauges successfully`);
        } catch (error) {
            console.error('Error initializing gauges:', error);
            throw error;
        }
    }

    /**
     * Creates and sets up SVG elements for a gauge
     * @private
     * @param {HTMLElement} wrapper - The gauge wrapper element
     * @param {string} status - The status category
     * @returns {GaugeElements|null}
     */
    static #createGaugeElements(wrapper, status) {
        try {
            // Clear existing content
            wrapper.innerHTML = '';

            // Create SVG element with correct viewBox
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 36 36');
            svg.classList.add('gauge');

            // Create background circle path
            const backgroundPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            backgroundPath.classList.add('gauge-background');

            // Create value circle path
            const valuePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            valuePath.classList.add('gauge-value');

            // Set common path attributes
            const radius = this.#defaultOptions.radius;
            const pathD = `M18 2.0845
            a ${radius} ${radius} 0 0 1 0 31.831
            a ${radius} ${radius} 0 0 1 0 -31.831`;

            backgroundPath.setAttribute('d', pathD);
            backgroundPath.setAttribute('fill', 'none');
            backgroundPath.setAttribute('stroke', this.#defaultOptions.backgroundColor);
            backgroundPath.setAttribute('stroke-width', this.#defaultOptions.strokeWidth);
            backgroundPath.setAttribute('stroke-linecap', 'round');

            valuePath.setAttribute('d', pathD);
            valuePath.setAttribute('fill', 'none');
            valuePath.setAttribute('stroke', this.#defaultOptions.statusColors[status] || '#999');
            valuePath.setAttribute('stroke-width', this.#defaultOptions.strokeWidth);
            valuePath.setAttribute('stroke-linecap', 'round');
            // valuePath.style.transform = 'rotate(-90deg)';
            valuePath.style.transformOrigin = 'center';

            // Add paths to SVG
            svg.appendChild(backgroundPath);
            svg.appendChild(valuePath);

            // Create text elements
            const valueDisplay = document.createElement('div');
            valueDisplay.classList.add('gauge-value');
            valueDisplay.setAttribute('aria-live', 'polite');
            valueDisplay.textContent = '0';

            const percentageDisplay = document.createElement('div');
            percentageDisplay.classList.add('gauge-percentage');
            percentageDisplay.textContent = '(0.0%)';

            const labelDisplay = document.createElement('div');
            labelDisplay.classList.add('gauge-label');
            labelDisplay.textContent = status;

            // Add all elements to wrapper
            wrapper.appendChild(svg);
            wrapper.appendChild(valueDisplay);
            wrapper.appendChild(percentageDisplay);
            wrapper.appendChild(labelDisplay);

            return {
                wrapper,
                svg,
                backgroundPath,
                valuePath,
                valueDisplay,
                percentageDisplay,
                labelDisplay
            };
        } catch (error) {
            console.error('Error creating gauge elements:', error);
            return null;
        }
    }

    /**
     * Set the common attributes for gauge paths
     * @private
     * @param {SVGPathElement} path - The SVG path element
     * @param {string} color - The stroke color
     */
    static #setGaugePathAttributes(path, color) {
        const radius = this.#defaultOptions.radius;
        path.setAttribute('d', `M18 2.0845
            a ${radius} ${radius} 0 0 1 0 31.831
            a ${radius} ${radius} 0 0 1 0 -31.831`);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', this.#defaultOptions.strokeWidth);
    }

    /**
    * Updates all gauges with the correct calculations and display
    * @param {Array.<Object>} hospitals - Array of hospital data
    * @returns {Promise<void>}
    */
    static async updateAllGauges(hospitals) {
        try {
            if (!hospitals?.length) {
                console.warn('No hospital data provided for gauge update');
                return;
            }

            const total = hospitals.length;
            const counts = {
                'Deployed': 0,
                'In Progress': 0,
                'Signed': 0
            };

            // Count hospitals by status
            hospitals.forEach(hospital => {
                if (counts.hasOwnProperty(hospital.status)) {
                    counts[hospital.status]++;
                }
            });

            // Update each gauge
            for (const [status, count] of Object.entries(counts)) {
                const elements = this.#gauges.get(status);
                if (!elements) continue;

                const percentage = (count / total * 100) || 0;

                // Calculate the circumference of the circle
                const radius = this.#defaultOptions.radius;
                const circumference = 2 * Math.PI * radius;

                // Calculate the dash offset based on percentage
                // Important: Subtract from circumference because SVG arc starts at top and goes clockwise
                const dashOffset = circumference * (1 - percentage / 100);
                console.log(`Dash offset for ${status}:`, dashOffset);

                // Update SVG path properties
                const valuePath = elements.valuePath;
                valuePath.style.strokeDasharray = `${circumference} ${circumference}`;
                valuePath.style.strokeDashoffset = dashOffset;
                valuePath.style.transition = `stroke-dashoffset ${this.#defaultOptions.animationDuration}ms ease-in-out`;

                // Update text displays
                elements.valueDisplay.textContent = count;
                elements.percentageDisplay.textContent = `(${percentage.toFixed(1)}%)`;

                // Update ARIA attributes
                elements.wrapper.setAttribute('aria-valuenow', count);
                elements.wrapper.setAttribute('aria-valuetext',
                    `${count} ${status} hospitals (${percentage.toFixed(1)}%)`);
            }
        } catch (error) {
            console.error('Error updating gauges:', error);
            throw error;
        }
    }

    /**
     * Update a single gauge with new data
     * @private
     * @param {GaugeData} data - The data for updating the gauge
     * @returns {Promise<void>}
     */
    static async #updateGauge(data) {
        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                try {
                    const elements = this.#gauges.get(data.status);
                    if (!elements) {
                        console.warn(`No gauge found for status: ${data.status}`);
                        resolve();
                        return;
                    }

                    const percentage = (data.value / data.total * 100) || 0;
                    const circumference = 2 * Math.PI * this.#defaultOptions.radius;
                    const offset = circumference * (1 - percentage / 100);

                    // Update value path
                    const valuePath = elements.valuePath;
                    valuePath.style.strokeDasharray = `${circumference} ${circumference}`;
                    valuePath.style.strokeDashoffset = offset;
                    valuePath.style.transition = `stroke-dashoffset ${this.#defaultOptions.animationDuration}ms ease-in-out`;

                    // Update text displays
                    elements.valueDisplay.textContent = data.value;
                    elements.percentageDisplay.textContent = `(${percentage.toFixed(1)}%)`;

                    // Update ARIA attributes
                    elements.wrapper.setAttribute('aria-valuenow', data.value);
                    elements.wrapper.setAttribute('aria-valuetext',
                        `${data.value} ${data.status} hospitals (${percentage.toFixed(1)}%)`);

                    resolve();
                } catch (error) {
                    console.error('Error updating gauge:', error);
                    resolve();
                }
            });
        });
    }

    /**
     * Reset all gauges to zero
     * @returns {Promise<void>}
     */
    static async resetGauges() {
        try {
            const resetPromises = Array.from(this.#gauges.keys()).map(status =>
                this.#updateGauge({
                    value: 0,
                    total: 100,
                    status: status
                })
            );

            await Promise.all(resetPromises);
        } catch (error) {
            console.error('Error resetting gauges:', error);
            throw error;
        }
    }

    /**
     * Clean up gauge resources
     * @returns {void}
     */
    static destroy() {
        try {
            this.#gauges.clear();
            console.log('Gauge manager cleanup completed');
        } catch (error) {
            console.error('Error during gauge manager cleanup:', error);
            throw error;
        }
    }

    /**
     * Get the current state of all gauges (for debugging)
     * @returns {Object.<string, GaugeElements>}
     */
    static debug() {
        return {
            gauges: this.#gauges,
            options: this.#defaultOptions
        };
    }
}

// Export the GaugeManager class
export { GaugeManager };