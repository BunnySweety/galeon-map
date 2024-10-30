/**
 * @fileoverview Manages gauge creation, updates, and animations for hospital statistics
 * @module GaugeManager
 * @requires DOM
 * @author BunnySweety
 * @version 1.0.0
 */

'use strict';

/**
 * Manages the creation and updates of circular gauges
 * @class
 */
class GaugeManager {
    /**
     * SVG constants for gauge creation
     * @private
     * @constant
     */
    static SVG_CONFIG = {
        RADIUS: 15.9155,
        CIRCUMFERENCE: 2 * Math.PI * 15.9155,
        START_ANGLE: -90
    };

    /**
     * Creates a new gauge element from templates
     * @param {string} id - Gauge identifier
     * @param {string} label - Gauge label text
     * @param {string} color - Gauge color in hex
     * @returns {DocumentFragment} Gauge element
     * @throws {Error} If required templates are not found
     */
    static createGauge(id, label, color) {
        const wrapperTemplate = document.getElementById('gauge-wrapper-template');
        const gaugeTemplate = document.getElementById('gauge-template');

        if (!wrapperTemplate || !gaugeTemplate) {
            console.error('Required gauge templates not found');
            return null;
        }

        try {
            // Clone wrapper template
            const wrapper = document.importNode(wrapperTemplate.content, true);

            // Setup gauge element
            const gauge = wrapper.querySelector('.gauge');
            if (!gauge) throw new Error('Gauge element not found in template');

            gauge.id = `${id}-progress`;
            gauge.setAttribute('aria-label', `${label} gauge`);
            
            // Setup SVG
            const svgTemplate = document.importNode(gaugeTemplate.content, true);
            const valuePathElement = svgTemplate.querySelector('.gauge-value');
            if (valuePathElement) {
                valuePathElement.setAttribute('stroke', color);
                // Initialize path with 0 progress
                valuePathElement.setAttribute('stroke-dasharray', `0, ${this.SVG_CONFIG.CIRCUMFERENCE}`);
            }
            
            // Assemble gauge
            gauge.appendChild(svgTemplate);
            
            // Setup labels with initial values
            const labelElement = wrapper.querySelector('.gauge-label');
            if (labelElement) labelElement.textContent = label;

            const valueElement = wrapper.querySelector('.gauge-value');
            if (valueElement) {
                valueElement.setAttribute('aria-live', 'polite');
                valueElement.textContent = '0';
            }

            const percentageElement = wrapper.querySelector('.gauge-percentage');
            if (percentageElement) percentageElement.textContent = '(0.0%)';
            
            return wrapper;
        } catch (error) {
            console.error('Error creating gauge:', error);
            return null;
        }
    }

    /**
     * Updates gauge values and animation
     * @param {string} id - Gauge identifier
     * @param {number} value - Current value
     * @param {number} total - Total value
     * @returns {void}
     */
    static updateGauge(id, value, total) {
        const gauge = document.getElementById(`${id}-progress`);
        if (!gauge) return;

        try {
            // Calculate percentage
            const percentage = total > 0 ? (value / total * 100) : 0;
            const dashArray = (percentage / 100) * this.SVG_CONFIG.CIRCUMFERENCE;

            // Get elements
            const valuePath = gauge.querySelector('.gauge-value path');
            const wrapper = gauge.closest('.gauge-wrapper');
            if (!wrapper) return;

            const valueDisplay = wrapper.querySelector('.gauge-value');
            const percentageDisplay = wrapper.querySelector('.gauge-percentage');
            
            // Update visual elements using requestAnimationFrame for smooth animation
            requestAnimationFrame(() => {
                // Update SVG path
                if (valuePath) {
                    valuePath.style.transition = 'stroke-dasharray 0.3s ease';
                    valuePath.setAttribute('stroke-dasharray', `${dashArray}, ${this.SVG_CONFIG.CIRCUMFERENCE}`);
                }

                // Update text displays
                if (valueDisplay) valueDisplay.textContent = value.toString();
                if (percentageDisplay) percentageDisplay.textContent = `(${percentage.toFixed(1)}%)`;
                
                // Update ARIA attributes
                gauge.setAttribute('aria-valuenow', percentage.toString());
                gauge.setAttribute('aria-valuetext', `${value} out of ${total}, ${percentage.toFixed(1)}%`);
            });
        } catch (error) {
            console.error('Error updating gauge:', error);
        }
    }

    /**
     * Initializes all gauges in container
     * @returns {void}
     */
    static initGauges() {
        const container = document.querySelector('.chart-container');
        if (!container) {
            console.error('Chart container not found');
            return;
        }

        try {
            // Define gauges configuration
            const gauges = [
                { id: 'deployed', label: 'Deployed', color: '#4CAF50' },
                { id: 'in-progress', label: 'In Progress', color: '#FFA500' },
                { id: 'signed', label: 'Signed', color: '#2196F3' }
            ];

            // Create gauges
            gauges.forEach(({ id, label, color }) => {
                const gauge = this.createGauge(id, label, color);
                if (gauge) container.appendChild(gauge);
            });
        } catch (error) {
            console.error('Error initializing gauges:', error);
        }
    }

    /**
     * Updates all gauges based on hospital data
     * @param {Array<Object>} data - Hospital data array
     * @returns {void}
     */
    static updateAllGauges(data) {
        if (!Array.isArray(data)) return;

        try {
            const total = data.length;
            const counts = data.reduce((acc, item) => {
                if (!item?.status) return acc;
                const status = item.status.toLowerCase().replace(/\s+/g, '-');
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {});

            // Ensure all gauges are updated, even if count is 0
            ['deployed', 'in-progress', 'signed'].forEach(status => {
                this.updateGauge(status, counts[status] || 0, total);
            });
        } catch (error) {
            console.error('Error updating all gauges:', error);
        }
    }

    /**
     * Cleans up gauges and removes them from the container
     * @returns {void}
     */
    static destroy() {
        try {
            const container = document.querySelector('.chart-container');
            if (container) {
                container.innerHTML = '';
            }
        } catch (error) {
            console.error('Error destroying gauges:', error);
        }
    }

    /**
     * Resets all gauges to zero
     * @returns {void}
     */
    static resetGauges() {
        try {
            ['deployed', 'in-progress', 'signed'].forEach(status => {
                this.updateGauge(status, 0, 0);
            });
        } catch (error) {
            console.error('Error resetting gauges:', error);
        }
    }
}

export { GaugeManager };