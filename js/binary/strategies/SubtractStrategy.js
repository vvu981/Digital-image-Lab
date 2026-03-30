import { BinaryStrategy } from '../BinaryStrategy.js';

export class SubtractStrategy extends BinaryStrategy {
    getDescription() {
        return 'Calcula la diferencia punto a punto, útil para resaltar cambios o detectar bordes entre imágenes.';
    }

    getFormula() {
        return 'out(x,y) = clamp(in1(x,y) - in2(x,y), 0, L-1)';
    }

    getFormulaLatex() {
        return '\\text{out}(x,y) = \\operatorname{clip}(f(x,y) - g(x,y), 0, L-1)';
    }

    apply(dataA, dataB) {
        const out = new Uint8ClampedArray(dataA.length);
        for (let i = 0; i < dataA.length; i += 4) {
            const value = dataA[i] - dataB[i];
            const clamped = this.clamp(value, 0, this.getMaxIntensity());
            out[i] = out[i + 1] = out[i + 2] = clamped;
            out[i + 3] = 255;
        }
        return out;
    }
}
