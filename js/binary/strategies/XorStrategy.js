import { BinaryStrategy } from '../BinaryStrategy.js';

export class XorStrategy extends BinaryStrategy {
    getDescription() {
        return 'Operación bit a bit XOR; enfatiza regiones donde solo una de las imágenes posee intensidad.';
    }

    getFormula() {
        return 'out(x,y) = in1(x,y) XOR in2(x,y)';
    }

    getFormulaLatex() {
        return '\\text{out}(x,y) = f(x,y) \\oplus g(x,y)';
    }

    apply(dataA, dataB) {
        const out = new Uint8ClampedArray(dataA.length);
        for (let i = 0; i < dataA.length; i += 4) {
            const value = dataA[i] ^ dataB[i];
            out[i] = out[i + 1] = out[i + 2] = value;
            out[i + 3] = 255;
        }
        return out;
    }
}
