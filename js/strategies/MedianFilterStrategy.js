/**
 * Estrategia de Filtro Mediana
 * Reemplaza cada píxel con la mediana de sus píxeles vecinos
 * Muy efectivo para eliminar ruido salt-and-pepper sin desenfoque excesivo
 */
import { ConvolutionStrategy } from './ConvolutionStrategy.js';

export class MedianFilterStrategy extends ConvolutionStrategy {
    constructor() {
        super();
        this.controls = {
            slider: null,
            label: null,
        };
    }

    getDescription() {
        return "Filtro mediana que reemplaza cada píxel con la mediana de sus vecinos. Excelente para eliminar ruido salt-and-pepper preservando bordes. El parámetro controla el tamaño de la región de vecindad.\n1. Define una ventana (kernel) alrededor de cada píxel.\n2. Recopila todos los valores de píxeles en esa ventana.\n3. Ordena los valores de menor a mayor.\n4. Toma el valor del medio (mediana) como resultado.";
    }

    getFormula() {
        return "Ver descripción";
    }

    getFormulaLatex() {
        return "Ver-Descripción";
    }

    getControls() {
        return `<label>Tamaño del kernel: <span id="medianSize">3</span>×<span id="medianSize2">3</span></label>
                <input type="range" id="medianRange" min="1" max="5" step="1" value="1">
                <small>(Tamaños: 3, 5, 7, 9, 11)</small>`;
    }

    attachControls(container) {
        super.attachControls(container);
        this.controls.slider = container?.querySelector('#medianRange') ?? null;
        this.controls.sizeLabel = container?.querySelector('#medianSize') ?? null;
        this.controls.sizeLabel2 = container?.querySelector('#medianSize2') ?? null;
    }

    getKernelSize() {
        const slider = this.controls.slider;
        if (!slider) return 3;
        
        const sizes = [3, 5, 7, 9, 11];
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

        return this.applyMedianFilter(data, w, h, kernelSize);
    }
}
