/**
 * Estrategia de Filtro de Media (Average Filter / Box Filter)
 * Reemplaza cada píxel con el promedio de sus píxeles vecinos
 * Efectivo para suavizar ruido gaussiano
 */
import { ConvolutionStrategy } from './ConvolutionStrategy.js';

export class AverageFilterStrategy extends ConvolutionStrategy {
    constructor() {
        super();
        this.controls = {
            slider: null,
            label: null,
        };
    }

    getDescription() {
        return "Filtro de media que promedia los valores de píxeles vecinos. Suaviza la imagen reduciendo ruido gaussiano. El parámetro controla el tamaño de la región de vecindad.\n1. Define una ventana (kernel) alrededor de cada píxel.\n2. Suma todos los valores de píxeles en esa ventana.\n3. Divide el resultado por el número de píxeles en la ventana.\n4. El resultado es el promedio (media).";
    }

    getFormula() {
        return "Ver descripción";
    }

    getFormulaLatex() {
        return "Ver-Descripción";
    }

    getControls() {
        return `<label>Tamaño del kernel: <span id="kernelSize">3</span>×<span id="kernelSize2">3</span></label>
                <input type="range" id="kernelRange" min="1" max="6" step="1" value="1">
                <small>(Tamaños: 3, 5, 7, 9, 11, 13)</small>`;
    }

    attachControls(container) {
        super.attachControls(container);
        this.controls.slider = container?.querySelector('#kernelRange') ?? null;
        this.controls.sizeLabel = container?.querySelector('#kernelSize') ?? null;
        this.controls.sizeLabel2 = container?.querySelector('#kernelSize2') ?? null;
    }

    getKernelSize() {
        const slider = this.controls.slider;
        if (!slider) return 3;
        
        const sizes = [3, 5, 7, 9, 11, 13];
        const index = parseInt(slider.value);
        return sizes[index] || 3;
    }

    apply(data, w, h) {
        const kernelSize = this.getKernelSize();
        
        // Actualizar etiquetas
        if (this.controls.sizeLabel) {
            this.controls.sizeLabel.innerText = kernelSize;
            this.controls.sizeLabel2.innerText = kernelSize;
        }

        const kernel = this.createAverageKernel(kernelSize);
        return this.applyConvolution(data, w, h, kernel, kernelSize);
    }
}
