/**
 * Class managing the creation and updates of gauge visualizations
 */
class GaugeManager {
    static #gauges = new Map();

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

    static async initGauges(options = {}) {
        try {
            this.#defaultOptions = { ...this.#defaultOptions, ...options };

            // Create or get chart container
            let container = document.querySelector('.chart-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'chart-container';
                document.body.appendChild(container);
            }
            container.innerHTML = '';

            // Create gauges for the three fixed statuses
            const statuses = ['Deployed', 'In Progress', 'Signed'];

            statuses.forEach(status => {
                const wrapper = document.createElement('div');
                wrapper.className = 'gauge-wrapper';
                wrapper.setAttribute('data-status', status);
                wrapper.setAttribute('role', 'progressbar');
                wrapper.setAttribute('aria-label', `Percentage of ${status.toLowerCase()} hospitals`);
                wrapper.setAttribute('aria-valuemin', '0');
                wrapper.setAttribute('aria-valuemax', '100');
                wrapper.setAttribute('aria-valuenow', '0');
                container.appendChild(wrapper);

                const elements = this.#createGaugeElements(wrapper, status);
                if (elements) {
                    this.#gauges.set(status, elements);
                }
            });
        } catch (error) {
            console.error('Error initializing gauges:', error);
            throw error;
        }
    }

    static #createGaugeElements(wrapper, status) {
        try {
            wrapper.innerHTML = '';

            const gaugeContainer = document.createElement('div');
            gaugeContainer.className = 'gauge-container';

            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 36 36');
            svg.classList.add('gauge');
            svg.style.transform = 'rotate(-90deg)';
            svg.style.position = 'absolute';
            svg.style.top = '0';
            svg.style.left = '0';
            svg.style.width = '100%';
            svg.style.height = '100%';

            const backgroundPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const valuePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');

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
            valuePath.setAttribute('stroke', this.#defaultOptions.statusColors[status]);
            valuePath.setAttribute('stroke-width', this.#defaultOptions.strokeWidth);
            valuePath.setAttribute('stroke-linecap', 'round');

            svg.appendChild(backgroundPath);
            svg.appendChild(valuePath);

            const valueDisplay = document.createElement('div');
            valueDisplay.classList.add('gauge-value');
            valueDisplay.textContent = '0';

            gaugeContainer.appendChild(svg);
            gaugeContainer.appendChild(valueDisplay);

            const percentageDisplay = document.createElement('div');
            percentageDisplay.classList.add('gauge-percentage');
            percentageDisplay.textContent = '(0.0%)';

            const labelDisplay = document.createElement('div');
            labelDisplay.classList.add('gauge-label');
            labelDisplay.textContent = status;

            wrapper.appendChild(gaugeContainer);
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

    static async updateAllGauges(hospitals = []) {
        try {
            const total = hospitals.length;
            const counts = new Map();

            for (const status of this.#gauges.keys()) {
                counts.set(status, 0);
            }

            hospitals.forEach(hospital => {
                const count = counts.get(hospital.status) || 0;
                counts.set(hospital.status, count + 1);
            });

            for (const [status, gauge] of this.#gauges) {
                const count = counts.get(status) || 0;
                const percentage = total > 0 ? (count / total * 100) : 0;

                const radius = this.#defaultOptions.radius;
                const circumference = 2 * Math.PI * radius;
                const dashArray = circumference;
                const dashOffset = circumference * (1 - percentage / 100);

                const valuePath = gauge.valuePath;
                valuePath.style.strokeDasharray = dashArray;
                valuePath.style.strokeDashoffset = dashOffset;
                valuePath.style.transition = `stroke-dashoffset ${this.#defaultOptions.animationDuration}ms ease-in-out`;

                gauge.valueDisplay.textContent = count;
                gauge.percentageDisplay.textContent = `(${percentage.toFixed(1)}%)`;

                gauge.wrapper.setAttribute('aria-valuenow', count);
                gauge.wrapper.setAttribute('aria-valuetext',
                    `${count} ${status} hospitals (${percentage.toFixed(1)}%)`);
            }
        } catch (error) {
            console.error('Error updating gauges:', error);
            throw error;
        }
    }

    static destroy() {
        try {
            this.#gauges.clear();
        } catch (error) {
            console.error('Error during gauge manager cleanup:', error);
            throw error;
        }
    }
}

export { GaugeManager };