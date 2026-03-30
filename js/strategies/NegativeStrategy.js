/**
 * Estrategia de Negativo (Inversión de intensidad)
 * Invierte todos los valores de intensidad de la imagen.
 */
import { BaseStrategy } from '../BaseStrategy.js';

export class NegativeStrategy extends BaseStrategy {
    constructor() {
        super();
    }

    getDescription() {
        return "Invierte todos los valores de intensidad de la imagen. Los píxeles claros se vuelven oscuros y viceversa.";
    }

    getFormula() {
        return "out(x,y) = L - 1 - in(x,y)";
    }

    getFormulaLatex() {
        return "out(x,y) = 255 - in(x,y)";
    }

    getControls() {
        return `<p>Inversión total de bits.</p>`;
    }

    apply(data) {
        const out = new Uint8ClampedArray(data.length);
        const L = this.getMaxIntensity();
        for (let i = 0; i < data.length; i += 4) {
            out[i] = out[i + 1] = out[i + 2] = L - data[i];
            out[i + 3] = 255;
        }
        return out;
    }
}
