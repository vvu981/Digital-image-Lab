import { BinaryLabEngine } from '../js/binary/BinaryLabEngine.js';
import { BinaryRegistry } from '../js/binary/registry.js';
import { ModalService } from '../js/core/ModalService.js';
import { HistogramService } from '../js/core/HistogramService.js';
import { StatusService } from '../js/core/StatusService.js';
import { convertToGrayscale } from '../js/utils/imageUtils.js';

const CANVAS_SIZE = 512;

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
    canvasA: document.getElementById('canvasA'),
    canvasB: document.getElementById('canvasB'),
    canvasOut: document.getElementById('canvasOut'),
    histA: document.getElementById('histA'),
    histB: document.getElementById('histB'),
    histOut: document.getElementById('histOut'),
};

const BinaryLab = new BinaryLabEngine({
    registry: BinaryRegistry,
    modalService,
    histogramService,
    statusService,
    uiRefs,
});

BinaryLab.init();
BinaryLab.updateUI();

setupUpload('uploadA', 'A');
setupUpload('uploadB', 'B');

function setupUpload(inputId, label) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener('change', (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        loadImage(file, label);
    });
}

function loadImage(file, label) {
    const reader = new FileReader();
    reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
            const canvas = label === 'A' ? BinaryLab.canvasA : BinaryLab.canvasB;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            canvas.width = CANVAS_SIZE;
            canvas.height = CANVAS_SIZE;
            ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

            const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            convertToGrayscale(imageData);
            ctx.putImageData(imageData, 0, 0);

            BinaryLab.setInputImage(label, imageData);
            BinaryLab.updateUI();
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}
