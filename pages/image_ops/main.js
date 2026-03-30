import { LabEngine } from '../../js/engine.js';
import { Registry } from '../../js/registry.js';
import { ModalService } from '../../js/core/ModalService.js';
import { HistogramService } from '../../js/core/HistogramService.js';
import { StatusService } from '../../js/core/StatusService.js';
import { convertToGrayscale } from '../../js/utils/imageUtils.js';

const modalService = new ModalService();
const histogramService = new HistogramService();
const statusService = new StatusService({
    dot: document.getElementById('statusDot'),
    text: document.getElementById('statusText'),
});

const uiRefs = {
    selector: document.getElementById('opSelector'),
    description: document.getElementById('description'),
    formula: document.getElementById('formula'),
    dynamicParams: document.getElementById('dynamicParams'),
    canvasIn: document.getElementById('canvasIn'),
    canvasOut: document.getElementById('canvasOut'),
    histIn: document.getElementById('histIn'),
    histOut: document.getElementById('histOut'),
};

const SingleImageLab = new LabEngine({
    registry: Registry,
    modalService,
    histogramService,
    statusService,
    uiRefs,
});
SingleImageLab.init();
SingleImageLab.setStatus('idle', 'Carga una imagen para comenzar');

const uploadInput = document.getElementById('upload');
if (uploadInput) {
    uploadInput.addEventListener('change', handleUpload);
}

function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
        SingleImageLab.setStatus('warn', 'Selecciona un archivo de imagen válido');
        return;
    }

    SingleImageLab.setStatus('active', 'Procesando imagen...');

    const reader = new FileReader();
    reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => processImage(img);
        img.onerror = () => SingleImageLab.setStatus('warn', 'No se pudo cargar la imagen. Intenta con otro archivo.');
        img.src = ev.target?.result;
    };
    reader.readAsDataURL(file);
}

function processImage(img) {
    const width = 500;
    const height = Math.round(500 * (img.height / img.width));
    SingleImageLab.canvasIn.width = SingleImageLab.canvasOut.width = width;
    SingleImageLab.canvasIn.height = SingleImageLab.canvasOut.height = height;

    const ctx = SingleImageLab.canvasIn.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    const grayscaleData = ctx.getImageData(0, 0, width, height);
    convertToGrayscale(grayscaleData);
    ctx.putImageData(grayscaleData, 0, 0);

    SingleImageLab.originalData = grayscaleData;
    SingleImageLab.calculateMaxIntensity(grayscaleData.data);
    SingleImageLab.updateUI();
    SingleImageLab.setStatus('active', 'Imagen lista para aplicar operaciones');
}
