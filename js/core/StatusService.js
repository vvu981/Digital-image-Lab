const KNOWN_STATES = ['idle', 'active', 'warn'];

export class StatusService {
    constructor({ dot = null, text = null } = {}) {
        this.dot = dot;
        this.text = text;
        this.currentState = null;
    }

    setState(state, message) {
        if (message && this.text) {
            this.text.textContent = message;
        }
        if (!this.dot) return;
        this.dot.classList.remove(...KNOWN_STATES);
        const nextState = KNOWN_STATES.includes(state) ? state : 'idle';
        this.currentState = nextState;
        this.dot.classList.add(nextState);
    }
}
