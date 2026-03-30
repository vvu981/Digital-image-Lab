/**
 * Estrategia de Corrección Gamma
 * Corrige la respuesta no-lineal de sistemas de visualización.
 */
import { BaseStrategy } from '../BaseStrategy.js';

export class GammaStrategy extends BaseStrategy {
    constructor() {
        super();
        this.controls = {
            slider: null,
            label: null,
        };
    }

    getDescription() {
        return "γ > 1 oscurece, γ < 1 aclara la imagen.";
    }

    getFormula() {
        return "out(x,y) = 255 × (in(x,y)/255)^γ";
    }

    getFormulaLatex() {
        return "out(x,y) = 255 \\times \\left(\\frac{in(x,y)}{255}\\right)^{\\gamma}";
    }

    getControls() {
        return `<label>Gamma (γ): <span id="gVal">1.0</span></label>
                <input type="range" id="gamma" min="0.1" max="5" step="0.1" value="1.0">`;
    }

    attachControls(container) {
        super.attachControls(container);
        this.controls.slider = container?.querySelector('#gamma') ?? null;
        this.controls.label = container?.querySelector('#gVal') ?? null;
    }

    apply(data) {
        const slider = this.controls.slider;
        const label = this.controls.label;
        const g = slider ? parseFloat(slider.value) : 1;
        if (label) {
            label.innerText = g;
        }
        const out = new Uint8ClampedArray(data.length);
        const L = this.getMaxIntensity();
        for (let i = 0; i < data.length; i += 4) {
            const res = L * Math.pow(data[i] / L, g);
            out[i] = out[i + 1] = out[i + 2] = res;
            out[i + 3] = 255;
        }
        return out;
    }
}
