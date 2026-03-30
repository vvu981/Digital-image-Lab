import { BaseLabEngine } from '../core/BaseLabEngine.js';

export class BinaryLabEngine extends BaseLabEngine {
    constructor({ registry, modalService, histogramService, statusService = null, uiSelectors = {}, uiRefs = {} }) {
        super({ registry, modalService, histogramService, statusService, uiSelectors, uiRefs });

        this.canvasA = uiRefs.canvasA ?? document.getElementById(uiSelectors.canvasAId ?? 'canvasA');
        this.canvasB = uiRefs.canvasB ?? document.getElementById(uiSelectors.canvasBId ?? 'canvasB');
        this.canvasOut = uiRefs.canvasOut ?? document.getElementById(uiSelectors.canvasOutId ?? 'canvasOut');

        this.histA = uiRefs.histA ?? document.getElementById(uiSelectors.histAId ?? 'histA');
        this.histB = uiRefs.histB ?? document.getElementById(uiSelectors.histBId ?? 'histB');
        this.histOut = uiRefs.histOut ?? document.getElementById(uiSelectors.histOutId ?? 'histOut');

        this.inputs = { A: null, B: null };
        this.maxIntensity = 255;
        this.setStatus('idle', 'Carga ambas imágenes para comenzar');
    }

    setInputImage(label, imageData) {
        if (!['A', 'B'].includes(label)) {
            throw new Error('label debe ser "A" o "B"');
        }
        if (!imageData) return;

        this.inputs[label] = {
            data: imageData.data,
            width: imageData.width,
            height: imageData.height,
        };
        this.render();
    }

    onStrategyChanged() {
        this.render();
    }

    render() {
        const strategy = this.getActiveStrategy();
        if (!strategy) return;

        if (!this.inputs.A || !this.inputs.B) {
            this.setStatus('idle', 'Carga ambas imágenes para operar');
            return;
        }

        const { width: widthA, height: heightA, data: dataA } = this.inputs.A;
        const { width: widthB, height: heightB, data: dataB } = this.inputs.B;

        if (widthA !== widthB || heightA !== heightB) {
            this.setStatus('warn', 'Ambas imágenes deben compartir dimensiones (ajústalas y vuelve a intentar)');
            return;
        }

        if (!this.canvasOut) return;

        this.updateMaxIntensityFromInputs();
        const width = widthA;
        const height = heightA;

        const outputPixels = strategy.apply(dataA, dataB, width, height);
        this.canvasOut.width = width;
        this.canvasOut.height = height;
        const outCtx = this.canvasOut.getContext('2d');
        outCtx.putImageData(new ImageData(outputPixels, width, height), 0, 0);

        this.histogramService?.draw(this.histA, dataA, '#00f5ff');
        this.histogramService?.draw(this.histB, dataB, '#ff6b00');
        this.histogramService?.draw(this.histOut, outputPixels, '#0d6efd');

        this.setStatus('active', 'Operación aplicada');
    }

    updateMaxIntensityFromInputs() {
        if (!this.inputs.A || !this.inputs.B) return;
        const maxA = BaseLabEngine.getMaxIntensityFrom(this.inputs.A.data);
        const maxB = BaseLabEngine.getMaxIntensityFrom(this.inputs.B.data);
        const max = Math.max(maxA, maxB);
        this.maxIntensity = max;
        this.broadcastMaxIntensity(max);
    }

}
