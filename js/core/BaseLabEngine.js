export class BaseLabEngine {
    /**
     * @param {Object} options
     * @param {Object} options.registry - Estrategias disponibles para la UI
     * @param {import('./ModalService.js').ModalService} [options.modalService]
     * @param {import('./HistogramService.js').HistogramService} [options.histogramService]
     * @param {Object} [options.uiSelectors]
     * @param {Object} [options.uiRefs]
     */
    constructor({ registry, modalService = null, histogramService = null, statusService = null, uiSelectors = {}, uiRefs = {} }) {
        if (!registry) {
            throw new Error('BaseLabEngine requiere un registry de estrategias');
        }
        this.registry = registry;
        this.modalService = modalService;
        this.histogramService = histogramService;
        this.statusService = statusService;

        this.ui = {
            selector: uiRefs.selector ?? document.getElementById(uiSelectors.opSelectorId ?? 'opSelector'),
            description: uiRefs.description ?? document.getElementById(uiSelectors.descriptionId ?? 'description'),
            formula: uiRefs.formula ?? document.getElementById(uiSelectors.formulaId ?? 'formula'),
            dynamicParams: uiRefs.dynamicParams ?? document.getElementById(uiSelectors.dynamicParamsId ?? 'dynamicParams'),
        };
    }

    /**
     * Configura la UI base (selector y modal)
     */
    init() {
        this.#initializeSelectOptions();
        this.modalService?.bind();
    }

    /**
     * Rellena el selector de estrategias y añade listeners
     */
    #initializeSelectOptions() {
        if (!this.ui.selector) return;
        this.ui.selector.innerHTML = '';
        Object.keys(this.registry).forEach(key => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.innerText = this.registry[key].name;
            this.ui.selector.appendChild(opt);
        });
        this.ui.selector.onchange = () => this.updateUI();
    }

    /**
     * Refresca la descripción, fórmula y controles de la estrategia seleccionada
     */
    updateUI() {
        const entry = this.#getActiveEntry();
        if (!entry) return;

        this.#renderMetadata(entry.strategy);
        this.#renderControls(entry.strategy);
        this.onStrategyChanged(entry.strategy);
        this.render();
    }

    /**
     * Hook opcional que los motores concretos pueden sobreescribir
     */
    // eslint-disable-next-line no-unused-vars
    onStrategyChanged(/* strategy */) {}

    /**
     * Método abstracto que debe implementar cada motor concreto
     */
    render() {
        throw new Error('render() debe implementarse en el motor concreto');
    }

    /**
     * Actualiza el estado del indicador de estado si existe StatusService
     * @param {'idle'|'active'|'warn'} state
     * @param {string} message
     */
    setStatus(state, message) {
        this.statusService?.setState(state, message);
    }

    /**
     * Calcula el máximo de intensidad en un arreglo de píxeles (posiciones R)
     * @param {Uint8ClampedArray} data
     * @returns {number}
     */
    static getMaxIntensityFrom(data) {
        let max = 0;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i] > max) max = data[i];
        }
        return max;
    }

    /**
     * Propaga el máximo detectado a todas las estrategias del registry
     * @param {number} value
     */
    broadcastMaxIntensity(value) {
        Object.values(this.registry).forEach(reg => {
            if (typeof reg.strategy?.setMaxIntensity === 'function') {
                reg.strategy.setMaxIntensity(value);
            }
        });
    }

    /**
     * Devuelve la estrategia activa
     */
    getActiveStrategy() {
        return this.#getActiveEntry()?.strategy ?? null;
    }

    /**
     * Renderiza descripción y fórmula, y prepara listeners para los modales
     * @param {import('../BaseStrategy.js').BaseStrategy} strategy
     */
    #renderMetadata(strategy) {
        if (!this.ui.description || !this.ui.formula) return;

        const descriptionText = strategy.getDescription();
        const descriptionNode = this.#replaceWithClone(this.ui.description);
        descriptionNode.innerHTML = `<strong>Descripción:</strong><p>${descriptionText}</p>`;
        if (this.modalService) {
            descriptionNode.style.cursor = 'pointer';
            descriptionNode.addEventListener('click', () => {
                this.modalService.showDescription(descriptionText);
            });
        } else {
            descriptionNode.style.cursor = 'default';
        }
        this.ui.description = descriptionNode;

        const formulaText = strategy.getFormula();
        const latex = typeof strategy.getFormulaLatex === 'function'
            ? strategy.getFormulaLatex()
            : null;
        const formulaNode = this.#replaceWithClone(this.ui.formula);
        formulaNode.innerHTML = `<strong>Fórmula:</strong><p class="formula">${formulaText}</p>`;
        const formulaContent = formulaNode.querySelector('.formula');
        if (formulaContent && latex && this.modalService) {
            formulaContent.style.cursor = 'pointer';
            formulaContent.addEventListener('click', () => {
                this.modalService.showFormula(latex);
            });
        } else if (formulaContent) {
            formulaContent.style.cursor = 'default';
        }
        this.ui.formula = formulaNode;
    }

    /**
     * Inserta los controles dinámicos y registra listeners por defecto
     * @param {import('../BaseStrategy.js').BaseStrategy} strategy
     */
    #renderControls(strategy) {
        if (!this.ui.dynamicParams) return;
        const controlsMarkup = typeof strategy.getControls === 'function'
            ? strategy.getControls()
            : '<p>Sin parámetros configurables.</p>';
        this.ui.dynamicParams.innerHTML = controlsMarkup;
        strategy.attachControls?.(this.ui.dynamicParams);
        this.#bindControlListeners();
    }

    /**
     * Lista inputs/selects recién insertados y los conecta a render()
     */
    #bindControlListeners() {
        if (!this.ui.dynamicParams) return;
        const controls = this.ui.dynamicParams.querySelectorAll('input, select, textarea');
        controls.forEach(control => {
            control.addEventListener('input', () => this.render());
            control.addEventListener('change', () => this.render());
        });
    }

    /**
     * Obtiene la entrada activa del registry
     * @returns {{name: string, strategy: import('../BaseStrategy.js').BaseStrategy}|null}
     */
    #getActiveEntry() {
        const keys = Object.keys(this.registry);
        if (keys.length === 0) return null;
        const selectedKey = this.ui.selector?.value || keys[0];
        if (this.ui.selector && !this.ui.selector.value) {
            this.ui.selector.value = selectedKey;
        }
        return this.registry[selectedKey] ?? null;
    }

    /**
     * Reemplaza un nodo por su clon para limpiar listeners previos
     * @param {HTMLElement} node
     * @returns {HTMLElement}
     */
    #replaceWithClone(node) {
        if (!node?.parentNode) return node;
        const clone = node.cloneNode(false);
        node.parentNode.replaceChild(clone, node);
        return clone;
    }
}
