export class HistoryManager {
    constructor() {
        this.storageKey = 'financePro_history';
    }

    saveCalculation(type, inputs, result) {
        const history = this.getHistory();
        const entry = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            type: type,
            inputs: inputs,
            result: result
        };
        
        history.unshift(entry);
        if (history.length > 50) {
            history.pop();
        }
        
        localStorage.setItem(this.storageKey, JSON.stringify(history));
        return entry;
    }

    getHistory() {
        const data = localStorage.getItem(this.storageKey);
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error("Error parsing history:", e);
                return [];
            }
        }
        return [];
    }

    clearHistory() {
        localStorage.removeItem(this.storageKey);
    }
}
