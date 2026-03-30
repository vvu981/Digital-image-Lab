/**
 * Clase base abstracta para todas las estrategias de procesamiento
 * Define el contrato que debe cumplir cada filtro/operación
 * 
 * @abstract
 */
export class BaseStrategy {
    constructor() {
        this.maxIntensity = 255; // Será actualizado dinámicamente desde la imagen
    }

    /**
     * Limita un valor dentro del rango dado (por defecto 0..L-1)
     * @param {number} value
     * @param {number} [min=0]
     * @param {number} [max=this.maxIntensity]
     * @returns {number}
     */
    clamp(value, min = 0, max = this.maxIntensity) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Actualiza el máximo de intensidad detectado de la imagen cargada
     * @param {number} value - Valor máximo encontrado en la imagen
     */
    setMaxIntensity(value) {
        this.maxIntensity = value;
    }

    /**
     * Obtiene el número máximo de nivel de intensidad (L - 1)
     * Detectado dinámicamente de la imagen cargada
     * @returns {number} Valor máximo de intensidad (L - 1)
     */
    getMaxIntensity() {
        return this.maxIntensity;
    }

    /**
     * Obtiene la descripción de la estrategia
     * @abstract
     * @returns {string} Descripción clara de qué hace la operación
     */
    getDescription() {
        throw new Error('getDescription() debe ser implementado por la subclase');
    }

    /**
     * Obtiene la fórmula en formato texto simple
     * @abstract
     * @returns {string} Fórmula simple legible
     */
    getFormula() {
        throw new Error('getFormula() debe ser implementado por la subclase');
    }

    /**
     * Obtiene la fórmula en formato LaTeX para renderizar
     * @abstract
     * @returns {string} Fórmula en LaTeX (para KaTeX)
     */
    getFormulaLatex() {
        throw new Error('getFormulaLatex() debe ser implementado por la subclase');
    }

    /**
     * Obtiene los controles HTML (sliders, inputs, etc.)
     * @abstract
     * @returns {string} HTML de los controles de la operación
     */
    getControls() {
        throw new Error('getControls() debe ser implementado por la subclase');
    }

    /**
     * Permite que la estrategia reciba referencias a los controles renderizados
     * @param {HTMLElement|null} container
     */
    attachControls(container) {
        this.controlsRoot = container ?? null;
    }

    /**
     * Aplica el filtro/operación a los datos de píxeles
     * @abstract
     * @param {Uint8ClampedArray} data - Array de píxeles RGBA
     * @param {number} w - Ancho de la imagen
     * @param {number} h - Alto de la imagen
     * @returns {Uint8ClampedArray} Píxeles procesados
     */
    apply(data, w, h) {
        throw new Error('apply() debe ser implementado por la subclase');
    }
}
