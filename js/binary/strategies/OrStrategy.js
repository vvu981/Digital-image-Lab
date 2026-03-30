import { BinaryStrategy } from '../BinaryStrategy.js';

export class OrStrategy extends BinaryStrategy {
    getDescription() {
        return 'Operación bit a bit OR; combina la información luminosa de ambas imágenes.';
    }

    getFormula() {
        return 'out(x,y) = in1(x,y) OR in2(x,y)';
    }

    getFormulaLatex() {
        return '\\text{out}(x,y) = f(x,y) \\vee g(x,y)';
    }

    apply(dataA, dataB) {
        const out = new Uint8ClampedArray(dataA.length);
        for (let i = 0; i < dataA.length; i += 4) {
            const value = dataA[i] | dataB[i];
            out[i] = out[i + 1] = out[i + 2] = value;
            out[i + 3] = 255;
        }
        return out;
    }
}
