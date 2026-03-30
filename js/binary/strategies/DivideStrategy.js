import { BinaryStrategy } from '../BinaryStrategy.js';

const EPSILON_INPUT_ID = 'divisionEpsilon';
const EPSILON_VALUE_ID = 'divisionEpsilonValue';

export class DivideStrategy extends BinaryStrategy {
    constructor() {
        super();
        this.controls = {
            slider: null,
            label: null,
        };
    }

    getDescription() {
        return 'Divide intensidades para resaltar zonas donde la imagen A domina a la imagen B, normalizando por L-1.';
    }

    getFormula() {
        return 'out(x,y) = clamp((in1(x,y) / (in2(x,y)+ε)) * (L-1), 0, L-1)';
    }

    getFormulaLatex() {
        return '\\text{out}(x,y) = \\operatorname{clip}\\left( \\frac{f(x,y)}{g(x,y)+\\varepsilon} (L-1), 0, L-1 \\right)';
    }

    getControls() {
        return `
            <label>ε (estabilidad): <span id="${EPSILON_VALUE_ID}">1</span></label>
            <input type="range" id="${EPSILON_INPUT_ID}" min="1" max="25" step="1" value="1">
        `;
    }

    attachControls(container) {
        super.attachControls(container);
        this.controls.slider = container?.querySelector(`#${EPSILON_INPUT_ID}`) ?? null;
        this.controls.label = container?.querySelector(`#${EPSILON_VALUE_ID}`) ?? null;
    }

    apply(dataA, dataB) {
        const out = new Uint8ClampedArray(dataA.length);
        const L = this.getMaxIntensity() || 255;
        const slider = this.controls.slider;
        const label = this.controls.label;
        const epsilon = slider ? parseFloat(slider.value) : 1;
        if (label) {
            label.textContent = epsilon.toFixed(0);
        }
        for (let i = 0; i < dataA.length; i += 4) {
            const denominator = Math.max(dataB[i], epsilon);
            const value = (dataA[i] / denominator) * L;
            const clamped = this.clamp(value, 0, L);
            out[i] = out[i + 1] = out[i + 2] = clamped;
            out[i + 3] = 255;
        }
        return out;
    }
}
