/**
 * Estrategia de Transformación Logarítmica
 * Expande tonos oscuros y comprime claros.
 */
import { BaseStrategy } from '../BaseStrategy.js';

export class LogStrategy extends BaseStrategy {
    constructor() {
        super();
        this.controls = {
            slider: null,
            label: null,
        };
    }

    getDescription() {
        return "Aplica una transformación logarítmica para expandir los tonos oscuros y comprimir los claros. Útil para mejorar detalles en zonas oscuras.";
    }

    getFormula() {
        return "out(x,y) = c × ln(1 + in(x,y))";
    }

    getFormulaLatex() {
        return "out(x,y) = c \\times \\ln(1 + in(x,y))";
    }

    getControls() {
        return `<label>Constante C: <span id="cVal">30</span></label>
                <input type="range" id="cLog" min="1" max="150" value="30">`;
    }

    attachControls(container) {
        super.attachControls(container);
        this.controls.slider = container?.querySelector('#cLog') ?? null;
        this.controls.label = container?.querySelector('#cVal') ?? null;
    }

    apply(data) {
        const slider = this.controls.slider;
        const label = this.controls.label;
        const c = slider ? parseFloat(slider.value) : 30;
        if (label) {
            label.innerText = c;
        }
        const out = new Uint8ClampedArray(data.length);
        const L = this.getMaxIntensity();
        for (let i = 0; i < data.length; i += 4) {
            const res = c * Math.log(1 + data[i]);
            out[i] = out[i + 1] = out[i + 2] = Math.min(L, res);
            out[i + 3] = 255;
        }
        return out;
    }
}
