/**
 * Estrategia de Ecualización de Histograma
 * Redistribuye el histograma usando CDF para mejorar contraste.
 */
import { BaseStrategy } from '../BaseStrategy.js';

export class EqualizeStrategy extends BaseStrategy {
    constructor() {
        super();
    }

    getDescription() {
        return "Realce de contraste. Busca maximizar el contraste global de una imagen mediante la redistribución estadística de las intensidades de los píxeles, permitiendo que los detalles ocultos en zonas muy oscuras o muy claras se vuelvan plenamente visibles.";
    }

    getFormula() {
        return "out(x,y) = (L - 1) × Σ p(rj) donde j ∈ [0, k] y k = in(x,y)";
    }

    getFormulaLatex() {
        return "out(x,y) = (L - 1) \\times \\sum_{j=0}^{k} p(r_j) \\quad \\text{donde} \\quad p(r_j) = \\frac{h(r_j)}{N} \\quad \\text{y} \\quad k = in(x,y)";
    }

    getControls() {
        return `<p>Redistribución estadística (CDF).</p>`;
    }

    apply(data, w, h) {
        const hist = new Array(256).fill(0);
        for (let i = 0; i < data.length; i += 4) hist[data[i]]++;
        let cdf = new Array(256).fill(0), sum = 0;
        for (let i = 0; i < 256; i++) {
            sum += hist[i];
            cdf[i] = sum;
        }
        const minCdf = cdf.find(x => x > 0);
        const out = new Uint8ClampedArray(data.length);
        const L = this.getMaxIntensity();
        for (let i = 0; i < data.length; i += 4) {
            const res = ((cdf[data[i]] - minCdf) / ((w * h) - minCdf)) * L;
            out[i] = out[i + 1] = out[i + 2] = res;
            out[i + 3] = 255;
        }
        return out;
    }
}
