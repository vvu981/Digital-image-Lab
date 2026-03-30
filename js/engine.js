/**
 * Motor principal de procesamiento TDI
 * Gestiona canvas, histogramas y la aplicación de estrategias
 */
import { BaseLabEngine } from './core/BaseLabEngine.js';

export class LabEngine extends BaseLabEngine {
    constructor({ registry, modalService, histogramService, statusService = null, uiSelectors = {}, uiRefs = {} }) {
        super({ registry, modalService, histogramService, statusService, uiSelectors, uiRefs });
        this.canvasIn = uiRefs.canvasIn ?? document.getElementById(uiSelectors.canvasInId ?? 'canvasIn');
        this.canvasOut = uiRefs.canvasOut ?? document.getElementById(uiSelectors.canvasOutId ?? 'canvasOut');
        this.histIn = uiRefs.histIn ?? document.getElementById(uiSelectors.histInId ?? 'histIn');
        this.histOut = uiRefs.histOut ?? document.getElementById(uiSelectors.histOutId ?? 'histOut');
        this.originalData = null;
        this.maxIntensity = 255;
    }

    /**
     * Calcula el máximo valor de intensidad en los datos
     */
    calculateMaxIntensity(data) {
        const max = BaseLabEngine.getMaxIntensityFrom(data);
        this.broadcastMaxIntensity(max);
        this.maxIntensity = max;
        return max;
    }

    render() {
        if (!this.originalData || !this.canvasIn || !this.canvasOut) return;
        const strategy = this.getActiveStrategy();
        if (!strategy) return;

        const outPixels = strategy.apply(this.originalData.data, this.canvasIn.width, this.canvasIn.height);
        const outputCtx = this.canvasOut.getContext('2d');
        outputCtx.putImageData(new ImageData(outPixels, this.canvasIn.width, this.canvasIn.height), 0, 0);

        this.histogramService?.draw(this.histIn, this.originalData.data, '#666');
        this.histogramService?.draw(this.histOut, outPixels, '#0d6efd');
    }
}
