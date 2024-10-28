/**
 * Manages gauge creation, updates, and animations
 * @module GaugeManager
 */
'use strict';

class GaugeManager {
    /**
     * Creates a new gauge element from templates
     * @param {string} id - Gauge identifier
     * @param {string} label - Gauge label text
     * @param {string} color - Gauge color in hex
     * @returns {DocumentFragment} Gauge element
     */
    static createGauge(id, label, color) {
        // Clone wrapper template
        const wrapper = document.importNode(
            document.getElementById('gauge-wrapper-template').content,
            true
        );

        // Setup gauge element
        const gauge = wrapper.querySelector('.gauge');
        gauge.id = `${id}-progress`;
        gauge.setAttribute('aria-label', `${label} gauge`);
        
        // Clone and setup SVG template
        const svgTemplate = document.importNode(
            document.getElementById('gauge-template').content,
            true
        );
        svgTemplate.querySelector('.gauge-value').setAttribute('stroke', color);
        
        // Assemble gauge
        gauge.appendChild(svgTemplate);
        
        // Setup labels
        wrapper.querySelector('.gauge-label').textContent = label;
        wrapper.querySelector('.gauge-value').setAttribute('aria-live', 'polite');
        
        return wrapper;
    }

    /**
     * Updates gauge values and animation
     * @param {string} id - Gauge identifier
     * @param {number} value - Current value
     * @param {number} total - Total value
     */
    static updateGauge(id, value, total) {
        const gauge = document.getElementById(`${id}-progress`);
        if (!gauge) return;

        // Calculate percentage
        const percentage = total > 0 ? (value / total * 100) : 0;

        // Get elements
        const valuePath = gauge.querySelector('.gauge-value path');
        const valueDisplay = gauge.closest('.gauge-wrapper').querySelector('.gauge-value');
        const percentageDisplay = gauge.closest('.gauge-wrapper').querySelector('.gauge-percentage');
        
        // Update visual elements
        requestAnimationFrame(() => {
            valuePath?.setAttribute('stroke-dasharray', `${percentage}, 100`);
            if (valueDisplay) valueDisplay.textContent = value.toString();
            if (percentageDisplay) percentageDisplay.textContent = `(${percentage.toFixed(1)}%)`;
            
            // Update ARIA attributes
            gauge.setAttribute('aria-valuenow', percentage.toString());
            gauge.setAttribute('aria-valuetext', `${value} out of ${total}, ${percentage.toFixed(1)}%`);
        });
    }

    /**
     * Initializes all gauges in container
     */
    static initGauges() {
        const container = document.querySelector('.chart-container');
        if (!container) return;

        // Define gauges configuration
        const gauges = [
            { id: 'deployed', label: 'Deployed', color: '#4CAF50' },
            { id: 'in-progress', label: 'In Progress', color: '#FFA500' },
            { id: 'signed', label: 'Signed', color: '#2196F3' }
        ];

        // Create gauges
        gauges.forEach(({ id, label, color }) => {
            const gauge = this.createGauge(id, label, color);
            container.appendChild(gauge);
        });
    }

    /**
     * Updates all gauges based on data
     * @param {Array<Object>} data - Hospital data array
     */
    static updateAllGauges(data) {
        if (!Array.isArray(data)) return;

        const total = data.length;
        const counts = data.reduce((acc, item) => {
            if (!item?.status) return acc;
            const status = item.status.toLowerCase().replace(/\s+/g, '-');
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        // Update each gauge
        Object.entries(counts).forEach(([status, count]) => {
            this.updateGauge(status, count, total);
        });
    }

    /**
     * Cleans up gauges
     */
    static destroy() {
        const container = document.querySelector('.chart-container');
        if (container) {
            container.innerHTML = '';
        }
    }
}

export { GaugeManager };