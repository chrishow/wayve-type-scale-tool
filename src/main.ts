// Function to update viewport width display
function updateViewportWidth() {
    const viewportWidthElement = document.getElementById('viewport-width');
    if (viewportWidthElement) {
        viewportWidthElement.textContent = window.innerWidth.toString();
    }
    // Also update current sizes when viewport changes
    updateCurrentSizes();
}

// Function to calculate current size at current viewport
function calculateCurrentSize(minSize: number, maxSize: number, minVw: number, maxVw: number, currentVw: number): number {
    // Clamp the viewport to min/max range
    const clampedVw = Math.max(minVw, Math.min(maxVw, currentVw));

    // If at min or max, return those values
    if (clampedVw <= minVw) return minSize;
    if (clampedVw >= maxVw) return maxSize;

    // Otherwise, interpolate
    const slope = (maxSize - minSize) / (maxVw - minVw);
    return minSize + (slope * (clampedVw - minVw));
}

// Function to update current size displays
function updateCurrentSizes() {
    const minWidth = parseFloat((document.getElementById('min-width') as HTMLInputElement)?.value || '360');
    const maxWidth = parseFloat((document.getElementById('max-width') as HTMLInputElement)?.value || '1920');
    const minFontSize = parseFloat((document.getElementById('min-font-size') as HTMLInputElement)?.value || '18');
    const maxFontSize = parseFloat((document.getElementById('max-font-size') as HTMLInputElement)?.value || '20');
    const minScale = parseFloat((document.getElementById('min-type-scale') as HTMLSelectElement)?.value || '1.2');
    const maxScale = parseFloat((document.getElementById('max-type-scale') as HTMLSelectElement)?.value || '1.25');

    const currentVw = window.innerWidth;

    // Update each step
    for (let step = -2; step <= 6; step++) {
        const minSize = minFontSize * Math.pow(minScale, step);
        const maxSize = maxFontSize * Math.pow(maxScale, step);
        const currentSize = calculateCurrentSize(minSize, maxSize, minWidth, maxWidth, currentVw);

        const element = document.getElementById(`current-size-${step}`);
        if (element) {
            element.textContent = `, currently ${Math.round(currentSize)}px`;
        }
    }
}

// Function to draw the type scale graph
function drawGraph() {
    const svg = document.getElementById('graph-svg');
    if (!svg) return;

    const minWidth = parseFloat((document.getElementById('min-width') as HTMLInputElement).value);
    const maxWidth = parseFloat((document.getElementById('max-width') as HTMLInputElement).value);
    const minFontSize = parseFloat((document.getElementById('min-font-size') as HTMLInputElement).value);
    const maxFontSize = parseFloat((document.getElementById('max-font-size') as HTMLInputElement).value);
    const minScale = parseFloat((document.getElementById('min-type-scale') as HTMLSelectElement).value);
    const maxScale = parseFloat((document.getElementById('max-type-scale') as HTMLSelectElement).value);

    // Clear existing content
    svg.innerHTML = '';

    // SVG dimensions
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    const padding = { top: 40, right: 80, bottom: 60, left: 80 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Calculate all step sizes
    const steps = [-2, -1, 0, 1, 2, 3, 4, 5, 6];
    const stepSizes = steps.map(step => ({
        step,
        minSize: minFontSize * Math.pow(minScale, step),
        maxSize: maxFontSize * Math.pow(maxScale, step)
    }));

    // Find min/max for y-axis
    const allSizes = stepSizes.flatMap(s => [s.minSize, s.maxSize]);
    const minY = Math.min(...allSizes);
    const maxY = Math.max(...allSizes);
    const yPadding = (maxY - minY) * 0.1;

    // Scale functions
    const xScale = (vw: number) => padding.left + ((vw - minWidth) / (maxWidth - minWidth)) * graphWidth;
    const yScale = (size: number) => padding.top + graphHeight - ((size - (minY - yPadding)) / (maxY - minY + 2 * yPadding)) * graphHeight;

    // Color palette for lines
    const colors = ['#94a3b8', '#78716c', '#a78bfa', '#fb923c', '#f472b6', '#fb7185', '#facc15', '#4ade80', '#60a5fa'];

    // Draw vertical dashed lines at min and max viewport
    const minLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    minLine.setAttribute('x1', xScale(minWidth).toString());
    minLine.setAttribute('y1', padding.top.toString());
    minLine.setAttribute('x2', xScale(minWidth).toString());
    minLine.setAttribute('y2', (height - padding.bottom).toString());
    minLine.setAttribute('class', 'graph-axis-dashed');
    svg.appendChild(minLine);

    const maxLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    maxLine.setAttribute('x1', xScale(maxWidth).toString());
    maxLine.setAttribute('y1', padding.top.toString());
    maxLine.setAttribute('x2', xScale(maxWidth).toString());
    maxLine.setAttribute('y2', (height - padding.bottom).toString());
    maxLine.setAttribute('class', 'graph-axis-dashed');
    svg.appendChild(maxLine);

    // Draw viewport width labels
    const minVwLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    minVwLabel.setAttribute('x', xScale(minWidth).toString());
    minVwLabel.setAttribute('y', (padding.top - 10).toString());
    minVwLabel.setAttribute('text-anchor', 'middle');
    minVwLabel.setAttribute('class', 'graph-label-bold');
    minVwLabel.textContent = `${minWidth}px`;
    svg.appendChild(minVwLabel);

    const maxVwLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    maxVwLabel.setAttribute('x', xScale(maxWidth).toString());
    maxVwLabel.setAttribute('y', (padding.top - 10).toString());
    maxVwLabel.setAttribute('text-anchor', 'middle');
    maxVwLabel.setAttribute('class', 'graph-label-bold');
    maxVwLabel.textContent = `${maxWidth}px`;
    svg.appendChild(maxVwLabel);

    // Draw scale multiplier labels at bottom
    const minScaleLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    minScaleLabel.setAttribute('x', xScale(minWidth).toString());
    minScaleLabel.setAttribute('y', (height - padding.bottom + 40).toString());
    minScaleLabel.setAttribute('text-anchor', 'middle');
    minScaleLabel.setAttribute('class', 'graph-label');
    minScaleLabel.textContent = `×${minScale}`;
    svg.appendChild(minScaleLabel);

    const maxScaleLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    maxScaleLabel.setAttribute('x', xScale(maxWidth).toString());
    maxScaleLabel.setAttribute('y', (height - padding.bottom + 40).toString());
    maxScaleLabel.setAttribute('text-anchor', 'middle');
    maxScaleLabel.setAttribute('class', 'graph-label');
    maxScaleLabel.textContent = `×${maxScale}`;
    svg.appendChild(maxScaleLabel);

    // Draw lines and labels for each step
    stepSizes.forEach((stepData, index) => {
        const x1 = xScale(minWidth);
        const y1 = yScale(stepData.minSize);
        const x2 = xScale(maxWidth);
        const y2 = yScale(stepData.maxSize);

        // Draw pixel size labels for this step
        const leftSizeLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        leftSizeLabel.setAttribute('x', (padding.left - 30).toString());
        leftSizeLabel.setAttribute('y', y1.toString());
        leftSizeLabel.setAttribute('text-anchor', 'end');
        leftSizeLabel.setAttribute('dominant-baseline', 'middle');
        leftSizeLabel.setAttribute('class', 'graph-label');
        leftSizeLabel.textContent = `${Math.round(stepData.minSize)}px`;
        svg.appendChild(leftSizeLabel);

        const rightSizeLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        rightSizeLabel.setAttribute('x', (width - padding.right + 30).toString());
        rightSizeLabel.setAttribute('y', y2.toString());
        rightSizeLabel.setAttribute('text-anchor', 'start');
        rightSizeLabel.setAttribute('dominant-baseline', 'middle');
        rightSizeLabel.setAttribute('class', 'graph-label');
        rightSizeLabel.textContent = `${Math.round(stepData.maxSize)}px`;
        svg.appendChild(rightSizeLabel);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1.toString());
        line.setAttribute('y1', y1.toString());
        line.setAttribute('x2', x2.toString());
        line.setAttribute('y2', y2.toString());
        line.setAttribute('class', 'graph-line');
        line.setAttribute('stroke', colors[index % colors.length]);
        svg.appendChild(line);

        // Add markers at end points
        const markerRadius = 12;

        // Left marker
        const leftMarker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        leftMarker.setAttribute('cx', x1.toString());
        leftMarker.setAttribute('cy', y1.toString());
        leftMarker.setAttribute('r', markerRadius.toString());
        leftMarker.setAttribute('class', 'graph-marker');
        leftMarker.setAttribute('stroke', colors[index % colors.length]);
        svg.appendChild(leftMarker);

        const leftLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        leftLabel.setAttribute('x', x1.toString());
        leftLabel.setAttribute('y', y1.toString());
        leftLabel.setAttribute('text-anchor', 'middle');
        leftLabel.setAttribute('dominant-baseline', 'central');
        leftLabel.setAttribute('class', 'graph-marker-label');
        leftLabel.setAttribute('fill', colors[index % colors.length]);
        leftLabel.textContent = stepData.step.toString();
        svg.appendChild(leftLabel);

        // Right marker
        const rightMarker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        rightMarker.setAttribute('cx', x2.toString());
        rightMarker.setAttribute('cy', y2.toString());
        rightMarker.setAttribute('r', markerRadius.toString());
        rightMarker.setAttribute('class', 'graph-marker');
        rightMarker.setAttribute('stroke', colors[index % colors.length]);
        svg.appendChild(rightMarker);

        const rightLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        rightLabel.setAttribute('x', x2.toString());
        rightLabel.setAttribute('y', y2.toString());
        rightLabel.setAttribute('text-anchor', 'middle');
        rightLabel.setAttribute('dominant-baseline', 'central');
        rightLabel.setAttribute('class', 'graph-marker-label');
        rightLabel.setAttribute('fill', colors[index % colors.length]);
        rightLabel.textContent = stepData.step.toString();
        svg.appendChild(rightLabel);
    });
}

// Function to calculate clamp values for responsive typography
function calculateClamp(minPx: number, maxPx: number, minVw: number, maxVw: number): string {
    const minRem = minPx / 16;
    const maxRem = maxPx / 16;

    // Calculate the slope and intercept for fluid typography
    const slope = (maxPx - minPx) / (maxVw - minVw);
    const interceptPx = minPx - (slope * minVw);
    const interceptRem = interceptPx / 16;
    const slopeVw = slope * 100;

    return `clamp(${minRem.toFixed(4)}rem, ${interceptRem.toFixed(4)}rem + ${slopeVw.toFixed(4)}vw, ${maxRem.toFixed(4)}rem)`;
}

// Function to update CSS custom properties
function updateTypeScale() {
    const minWidth = parseFloat((document.getElementById('min-width') as HTMLInputElement).value);
    const maxWidth = parseFloat((document.getElementById('max-width') as HTMLInputElement).value);
    const minFontSize = parseFloat((document.getElementById('min-font-size') as HTMLInputElement).value);
    const maxFontSize = parseFloat((document.getElementById('max-font-size') as HTMLInputElement).value);
    const minScale = parseFloat((document.getElementById('min-type-scale') as HTMLSelectElement).value);
    const maxScale = parseFloat((document.getElementById('max-type-scale') as HTMLSelectElement).value);

    const root = document.documentElement;

    // Generate type scale steps (-2 to 6)
    for (let step = -2; step <= 6; step++) {
        const minSize = minFontSize * Math.pow(minScale, step);
        const maxSize = maxFontSize * Math.pow(maxScale, step);
        const clampValue = calculateClamp(minSize, maxSize, minWidth, maxWidth);
        root.style.setProperty(`--step-${step}`, clampValue);
    }

    // Update the graph and CSS output
    drawGraph();
    updateCSSOutput();
    updateCurrentSizes();
}

// Function to update the CSS output display
function updateCSSOutput() {
    const minWidth = parseFloat((document.getElementById('min-width') as HTMLInputElement).value);
    const maxWidth = parseFloat((document.getElementById('max-width') as HTMLInputElement).value);
    const minFontSize = parseFloat((document.getElementById('min-font-size') as HTMLInputElement).value);
    const maxFontSize = parseFloat((document.getElementById('max-font-size') as HTMLInputElement).value);
    const minScale = parseFloat((document.getElementById('min-type-scale') as HTMLSelectElement).value);
    const maxScale = parseFloat((document.getElementById('max-type-scale') as HTMLSelectElement).value);

    const cssCodeElement = document.getElementById('css-code');
    if (!cssCodeElement) return;

    const currentURL = window.location.href;

    let cssOutput = `<span class="css-comment">/* Generated by: ${currentURL} */</span><br>`;
    cssOutput += ':root {<br>';

    // Generate CSS for each step
    for (let step = -2; step <= 6; step++) {
        const minSize = minFontSize * Math.pow(minScale, step);
        const maxSize = maxFontSize * Math.pow(maxScale, step);
        const clampValue = calculateClamp(minSize, maxSize, minWidth, maxWidth);

        const propertyName = `--step-${step}`;
        cssOutput += `&nbsp;&nbsp;<span class="css-property">${propertyName}</span>: <span class="css-value">${clampValue}</span>;<br>`;
    }

    cssOutput += '}';

    cssCodeElement.innerHTML = cssOutput;
}

// Mapping of type scale values to their names
const typeScaleNames: { [key: string]: string } = {
    '1.067': 'Minor Second',
    '1.125': 'Major Second',
    '1.2': 'Minor Third',
    '1.25': 'Major Third',
    '1.333': 'Perfect Fourth',
    '1.414': 'Augmented Fourth',
    '1.5': 'Perfect Fifth',
    '1.618': 'Golden Ratio',
    '1.667': 'Major Sixth',
    '1.778': 'Minor Seventh',
    '1.875': 'Major Seventh',
    '2': 'Octave'
};

// Function to update the scale name display
function updateScaleName(selectId: string, nameId: string) {
    const select = document.getElementById(selectId) as HTMLSelectElement;
    const nameElement = document.getElementById(nameId);

    if (select && nameElement) {
        const value = select.value;
        nameElement.textContent = typeScaleNames[value] || '';
    }
}

// Function to update URL with current form state
function updateURL() {
    const minWidth = (document.getElementById('min-width') as HTMLInputElement)?.value;
    const maxWidth = (document.getElementById('max-width') as HTMLInputElement)?.value;
    const minFontSize = (document.getElementById('min-font-size') as HTMLInputElement)?.value;
    const maxFontSize = (document.getElementById('max-font-size') as HTMLInputElement)?.value;
    const minScale = (document.getElementById('min-type-scale') as HTMLSelectElement)?.value;
    const maxScale = (document.getElementById('max-type-scale') as HTMLSelectElement)?.value;

    const params = new URLSearchParams();
    params.set('minWidth', minWidth);
    params.set('maxWidth', maxWidth);
    params.set('minFontSize', minFontSize);
    params.set('maxFontSize', maxFontSize);
    params.set('minScale', minScale);
    params.set('maxScale', maxScale);

    const newURL = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newURL);
}

// Function to load state from URL
function loadFromURL() {
    const params = new URLSearchParams(window.location.search);

    const minWidth = params.get('minWidth');
    const maxWidth = params.get('maxWidth');
    const minFontSize = params.get('minFontSize');
    const maxFontSize = params.get('maxFontSize');
    const minScale = params.get('minScale');
    const maxScale = params.get('maxScale');

    if (minWidth) (document.getElementById('min-width') as HTMLInputElement).value = minWidth;
    if (maxWidth) (document.getElementById('max-width') as HTMLInputElement).value = maxWidth;
    if (minFontSize) (document.getElementById('min-font-size') as HTMLInputElement).value = minFontSize;
    if (maxFontSize) (document.getElementById('max-font-size') as HTMLInputElement).value = maxFontSize;
    if (minScale) (document.getElementById('min-type-scale') as HTMLSelectElement).value = minScale;
    if (maxScale) (document.getElementById('max-type-scale') as HTMLSelectElement).value = maxScale;
}

document.addEventListener('DOMContentLoaded', () => {
    // Load state from URL first
    const hasURLParams = window.location.search.length > 0;
    loadFromURL();

    // Initialize scale names and type scale
    updateScaleName('min-type-scale', 'min-scale-name');
    updateScaleName('max-type-scale', 'max-scale-name');
    updateTypeScale();

    // Set initial URL if no params were present
    if (!hasURLParams) {
        updateURL();
    }

    // Get all form inputs
    const inputs = [
        'min-width',
        'max-width',
        'min-font-size',
        'max-font-size',
        'min-type-scale',
        'max-type-scale'
    ];

    // Add event listeners to all inputs
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => {
                updateTypeScale();
                updateURL();
            });
            element.addEventListener('change', () => {
                updateTypeScale();
                updateURL();
                if (id === 'min-type-scale') {
                    updateScaleName('min-type-scale', 'min-scale-name');
                } else if (id === 'max-type-scale') {
                    updateScaleName('max-type-scale', 'max-scale-name');
                }
            });
        }
    });

    // Update viewport width on load and resize
    updateViewportWidth();
    window.addEventListener('resize', () => {
        updateViewportWidth();
        drawGraph();
    });

    // Copy button functionality
    const copyButton = document.getElementById('copy-button');
    if (copyButton) {
        copyButton.addEventListener('click', async () => {
            const minWidth = parseFloat((document.getElementById('min-width') as HTMLInputElement).value);
            const maxWidth = parseFloat((document.getElementById('max-width') as HTMLInputElement).value);
            const minFontSize = parseFloat((document.getElementById('min-font-size') as HTMLInputElement).value);
            const maxFontSize = parseFloat((document.getElementById('max-font-size') as HTMLInputElement).value);
            const minScale = parseFloat((document.getElementById('min-type-scale') as HTMLSelectElement).value);
            const maxScale = parseFloat((document.getElementById('max-type-scale') as HTMLSelectElement).value);

            const currentURL = window.location.href;

            let cssText = `/* Generated by: ${currentURL} */\\n`;
            cssText += ':root {\\n';
            for (let step = -2; step <= 6; step++) {
                const minSize = minFontSize * Math.pow(minScale, step);
                const maxSize = maxFontSize * Math.pow(maxScale, step);
                const clampValue = calculateClamp(minSize, maxSize, minWidth, maxWidth);
                cssText += `  --step-${step}: ${clampValue};\\n`;
            }
            cssText += '}';

            try {
                await navigator.clipboard.writeText(cssText);
                copyButton.textContent = 'Copied!';
                copyButton.classList.add('copied');
                setTimeout(() => {
                    copyButton.textContent = 'Copy CSS';
                    copyButton.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });
    }
});