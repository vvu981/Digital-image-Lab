export class ModalService {
    constructor({ modalId = 'formulaModal', displayId = 'formulaDisplay' } = {}) {
        this.modal = document.getElementById(modalId);
        this.display = document.getElementById(displayId);
        this.title = this.modal?.querySelector('h2') ?? null;
        this.closeBtn = this.modal?.querySelector('.modal-close') ?? null;
        this.isBound = false;

        this.handleEscape = this.handleEscape.bind(this);
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

    showFormula(latex) {
        if (!this.display) return;
        this.setTitle('Fórmula Matemática');
        this.display.innerHTML = '';
        this.display.style.fontSize = '';
        try {
            katex.render(latex, this.display, {
                displayMode: true,
                throwOnError: false,
                macros: { '\\RR': '\\mathbb{R}' }
            });
        } catch (error) {
            this.display.innerHTML = `<code>${latex}</code>`;
        }
        requestAnimationFrame(() => this.fitFormulaToContainer());
        this.open();
    }

    showDescription(description) {
        if (!this.display) return;
        this.setTitle('Descripción');
        this.display.style.fontSize = '';
        this.display.innerHTML = `<p style="font-size: 16px; font-family: var(--font-body); color: var(--text-secondary); line-height: 1.8;">${description}</p>`;
        this.open();
    }

    open() {
        this.modal?.classList.add('active');
    }

    close() {
        this.modal?.classList.remove('active');
    }

    setTitle(text) {
        if (this.title) {
            this.title.textContent = text;
        }
    }

    fitFormulaToContainer() {
        if (!this.display) return;
        const target = this.display.querySelector('.katex-display, code');
        if (!target || this.display.clientWidth === 0) return;

        this.display.classList.remove('formula-scrollable');
        target.style.whiteSpace = 'normal';
        target.style.wordBreak = 'break-word';
        target.style.textAlign = 'left';

        const computed = window.getComputedStyle(this.display);
        const initialSize = Math.min(parseFloat(computed.fontSize) || 24, 24);
        let currentSize = initialSize;
        this.display.style.fontSize = `${currentSize}px`;

        let iterations = 0;
        const maxIterations = 24;
        while (iterations < maxIterations && target.scrollWidth > this.display.clientWidth && currentSize > 10) {
            currentSize -= 1;
            this.display.style.fontSize = `${currentSize}px`;
            iterations++;
        }

        if (target.scrollWidth > this.display.clientWidth) {
            this.display.classList.add('formula-scrollable');
            this.display.scrollLeft = 0;
        }
    }
}
