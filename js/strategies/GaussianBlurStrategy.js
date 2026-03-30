/**
 * Estrategia de Filtro Gaussiano (Desenfoque)
 * Aplica convolución con kernel gaussiano para suavizar.
 */
import { BaseStrategy } from '../BaseStrategy.js';

export class GaussianBlurStrategy extends BaseStrategy {
    constructor() {
        super();
        this.controls = {
            slider: null,
            label: null,
        };
    }

    getDescription() {
        return "Aplica un filtro de desenfoque gaussiano para suavizar la imagen y reducir ruido. El parámetro σ controla la intensidad del suavizado.";
    }

    getFormula() {
        return "out(x,y) = Σ G(σ) × in(x+i, y+j) | G(σ) = e^(-(i²+j²)/(2σ²))";
    }

    getFormulaLatex() {
        return "out(x,y) = \\sum_{i,j} G(\\sigma) \\cdot in(x+i, y+j) \\quad \\text{donde} \\quad G(\\sigma) = e^{-\\frac{i^2+j^2}{2\\sigma^2}}";
    }

    getControls() {
        return `<label>Sigma (Suavizado): <span id="sVal">1.5</span></label>
                <input type="range" id="sigma" min="0.5" max="5" step="0.5" value="1.5">`;
    }

    attachControls(container) {
        super.attachControls(container);
        this.controls.slider = container?.querySelector('#sigma') ?? null;
        this.controls.label = container?.querySelector('#sVal') ?? null;
    }

    generateGaussianKernel(sigma, size = 5) {
        const kernel = new Array(size * size);
        const half = Math.floor(size / 2);
        let sum = 0;

        for (let y = -half; y <= half; y++) {
            for (let x = -half; x <= half; x++) {
                const value = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
                kernel[(y + half) * size + (x + half)] = value;
                sum += value;
            }
        }

        // Normalizar el kernel
        for (let i = 0; i < kernel.length; i++) {
            kernel[i] /= sum;
        }

        return kernel;
    }

    apply(data, w, h) {
        const slider = this.controls.slider;
        const label = this.controls.label;
        const sigma = slider ? parseFloat(slider.value) : 1.5;
        if (label) {
            label.innerText = sigma.toFixed(1);
        }

        const kernel = this.generateGaussianKernel(sigma, 5);
        const out = new Uint8ClampedArray(data.length);
        const side = 5, half = 2;
        const L = this.getMaxIntensity();

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let r = 0;
                for (let ky = 0; ky < side; ky++) {
                    for (let kx = 0; kx < side; kx++) {
                        const scy = Math.min(h - 1, Math.max(0, y + ky - half));
                        const scx = Math.min(w - 1, Math.max(0, x + kx - half));
                        r += data[(scy * w + scx) * 4] * kernel[ky * side + kx];
                    }
                }
                const idx = (y * w + x) * 4;
                out[idx] = out[idx + 1] = out[idx + 2] = Math.min(L, r);
                out[idx + 3] = 255;
            }
        }
        return out;
    }
}
