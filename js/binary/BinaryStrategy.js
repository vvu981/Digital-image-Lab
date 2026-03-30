import { BaseStrategy } from '../BaseStrategy.js';

export class BinaryStrategy extends BaseStrategy {
    /**
     * Aplica la operación entre dos imágenes (RGBA ya alineadas)
     * @param {Uint8ClampedArray} dataA
     * @param {Uint8ClampedArray} dataB
     * @param {number} width
     * @param {number} height
     * @returns {Uint8ClampedArray}
     */
    // eslint-disable-next-line no-unused-vars
    apply(dataA, dataB, width, height) {
        throw new Error('apply() debe procesar dos imágenes en BinaryStrategy');
    }

    /**
     * Devuelve los controles HTML de la estrategia binaria
     * Por defecto no hay parámetros adicionales
     */
    getControls() {
        return '<p>No hay parámetros adicionales para esta operación.</p>';
    }
}
