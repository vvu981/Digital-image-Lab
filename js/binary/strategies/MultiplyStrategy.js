import { BinaryStrategy } from '../BinaryStrategy.js';

export class MultiplyStrategy extends BinaryStrategy {
    getDescription() {
        return 'Multiplica intensidades para reforzar coincidencias luminosas y atenuar áreas oscuras simultáneas.';
    }

    getFormula() {
        return 'out(x,y) = clamp((in1(x,y) * in2(x,y)) / (L-1), 0, L-1)';
    }

    getFormulaLatex() {
        return '\\text{out}(x,y) = \\operatorname{clip}\\left( \\frac{f(x,y) \\cdot g(x,y)}{L-1}, 0, L-1 \\right)';
    }

    apply(dataA, dataB) {
        const out = new Uint8ClampedArray(dataA.length);
        const L = this.getMaxIntensity() || 255;
        const divider = L === 0 ? 1 : L;
        for (let i = 0; i < dataA.length; i += 4) {
            const value = (dataA[i] * dataB[i]) / divider;
            const clamped = this.clamp(value, 0, L);
            out[i] = out[i + 1] = out[i + 2] = clamped;
            out[i + 3] = 255;
        }
        return out;
    }
}
