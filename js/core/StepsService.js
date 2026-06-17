/**
 * Servicio especializado para visualizar pasos de algoritmos (ej: Watershed)
 * Responsabilidad única: gestionar modal de pasos y navegación
 */
export class StepsService {
    constructor({ modalId = 'stepsModal', canvasId = 'stepsCanvas' } = {}) {
        this.modal = document.getElementById(modalId);
        this.canvas = document.getElementById(canvasId);
        this.title = this.modal?.querySelector('h2') ?? null;
        this.closeBtn = this.modal?.querySelector('.modal-close') ?? null;

        this.steps = [];
        this.currentStep = 0;
        this.isBound = false;

        this.handleEscape = this.handleEscape.bind(this);
        this.handlePrevStep = this.handlePrevStep.bind(this);
        this.handleNextStep = this.handleNextStep.bind(this);
    }

    bind() {
        if (!this.modal || this.isBound) return;

        this.closeBtn?.addEventListener('click', () => this.close());
        this.modal.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.close();
            }
        });
        document.addEventListener('keydown', this.handleEscape);

        this.isBound = true;
    }

    handleEscape(event) {
        if (event.key === 'Escape') {
            this.close();
        }
    }

    /**
     * Muestra los pasos del algoritmo
     * @param {Array} steps - Array de {title, data} donde data es Uint8ClampedArray RGBA
     * @param {number} width
     * @param {number} height
     */
    showSteps(steps, width, height) {
        this.steps = steps;
        this.currentStep = 0;

        if (!this.canvas) return;

        this.canvas.width = width;
        this.canvas.height = height;

        // Crear/actualizar controles
        this.#ensureControls();
        this.#updateDisplay();
        this.#updateControls();
        this.open();
    }

    /**
     * Asegura que los controles existan
     */
    #ensureControls() {
        // Buscar si ya existen
        let prevBtn = document.getElementById('prevStep');
        let nextBtn = document.getElementById('nextStep');
        let indicator = document.getElementById('stepIndicator');

        if (!prevBtn || !nextBtn || !indicator) {
            // Remover controles viejos si existen
            document.getElementById('stepsControls')?.remove();

            // Crear nuevos controles
            const controlsDiv = document.createElement('div');
            controlsDiv.id = 'stepsControls';
            controlsDiv.className = 'steps-controls';
            controlsDiv.innerHTML = `
                <button id="prevStep" class="btn btn-secondary" disabled>← Anterior</button>
                <span id="stepIndicator" class="step-indicator">Paso 0 de 0</span>
                <button id="nextStep" class="btn btn-primary" disabled>Siguiente →</button>
            `;

            const display = this.modal?.querySelector('#stepsDisplay');
            if (display?.parentNode) {
                display.parentNode.insertBefore(controlsDiv, display.nextSibling);
            }
        }

        // Obtener referencias y vincular listeners
        const newPrevBtn = document.getElementById('prevStep');
        const newNextBtn = document.getElementById('nextStep');

        if (newPrevBtn && !newPrevBtn._boundByStepsService) {
            newPrevBtn.addEventListener('click', this.handlePrevStep);
            newPrevBtn._boundByStepsService = true;
        }

        if (newNextBtn && !newNextBtn._boundByStepsService) {
            newNextBtn.addEventListener('click', this.handleNextStep);
            newNextBtn._boundByStepsService = true;
        }
    }

    /**
     * Renderiza el paso actual en el canvas
     */
    #updateDisplay() {
        if (this.currentStep >= this.steps.length || !this.canvas) return;

        const step = this.steps[this.currentStep];
        const ctx = this.canvas.getContext('2d');

        const imageData = new ImageData(step.data, this.canvas.width, this.canvas.height);
        ctx.putImageData(imageData, 0, 0);

        if (this.title) {
            this.title.textContent = `Paso ${this.currentStep + 1}: ${step.title}`;
        }
    }

    /**
     * Actualiza estado de botones y indicador
     */
    #updateControls() {
        const prevBtn = document.getElementById('prevStep');
        const nextBtn = document.getElementById('nextStep');
        const indicator = document.getElementById('stepIndicator');

        if (prevBtn) {
            prevBtn.disabled = this.currentStep === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = this.currentStep >= this.steps.length - 1;
        }
        if (indicator) {
            indicator.textContent = `Paso ${this.currentStep + 1} de ${this.steps.length}`;
        }
    }

    handlePrevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.#updateDisplay();
            this.#updateControls();
        }
    }

    handleNextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.#updateDisplay();
            this.#updateControls();
        }
    }

    open() {
        this.modal?.classList.add('active');
    }

    close() {
        this.modal?.classList.remove('active');
    }
}
