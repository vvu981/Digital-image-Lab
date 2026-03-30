/**
 * Estrategia de Normalización (Min-Max Stretching)
 * Estira linealmente el rango dinámico de la imagen.
 */
import { BaseStrategy } from '../BaseStrategy.js';

export class NormalizeStrategy extends BaseStrategy {
    constructor() {
        super();
    }

    getDescription() {
        return "Estira linealmente el rango dinámico de la imagen para usar toda la escala. Realza el contraste de la imagen.";
    }

    getFormula() {
        return "out(x,y) = ((in(x,y) - min) / (max - min)) × (L - 1)";
    }

    getFormulaLatex() {
        return "out(x,y) = \\frac{in(x,y) - min_{value}}{max_{value} - min_{value}} \\times 255";
    }

    getControls() {
        return `<p>Estiramiento lineal (Min-Max).</p>`;
    }

    apply(data) {
        let min = 255, max = 0;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i] < min) min = data[i];
            if (data[i] > max) max = data[i];
        }
        const out = new Uint8ClampedArray(data.length);
        const L = this.getMaxIntensity();
        for (let i = 0; i < data.length; i += 4) {
            const res = ((data[i] - min) / (max - min)) * L;
            out[i] = out[i + 1] = out[i + 2] = res;
            out[i + 3] = 255;
        }
        return out;
    }
}