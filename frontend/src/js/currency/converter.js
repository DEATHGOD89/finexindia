export class GlobalCurrencyConverter {
    constructor() {
        this.rates = {};
        this.baseCurrency = 'USD';
        this.lastUpdated = null;
        this.cacheDuration = 3600000;
    }
    
    async fetchRates() {
        if (this.rates && this.lastUpdated && (Date.now() - this.lastUpdated) < this.cacheDuration) {
            return this.rates;
        }
        try {
            const sources = [
                'https://api.exchangerate-api.com/v4/latest/USD',
                'https://open.er-api.com/v6/latest/USD'
            ];
            let data = null;
            for (const source of sources) {
                try {
                    const response = await fetch(source);
                    if (response.ok) {
                        data = await response.json();
                        break;
                    }
                } catch (e) {
                    console.log(`Source ${source} failed, trying next...`);
                }
            }
            if (!data) throw new Error('All currency APIs failed');
            
            this.rates = data.rates;
            this.lastUpdated = Date.now();
            this.baseCurrency = data.base || 'USD';
            return this.rates;
        } catch (error) {
            console.error('Failed to fetch exchange rates:', error);
            if (this.rates) return this.rates;
            return this.getDefaultRates();
        }
    }
    
    getDefaultRates() {
        return {
            USD: 1, INR: 83.5, EUR: 0.92, GBP: 0.78, AUD: 1.52, CAD: 1.35, SG: 1.34
        };
    }
    
    async convert(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return amount;
        const rates = await this.fetchRates();
        if (!rates[fromCurrency] || !rates[toCurrency]) {
            return this.fallbackConvert(amount, fromCurrency, toCurrency);
        }
        const inBase = amount / rates[fromCurrency];
        const result = inBase * rates[toCurrency];
        return Math.round(result * 100) / 100;
    }
    
    fallbackConvert(amount, fromCurrency, toCurrency) {
        const fallbackRates = this.getDefaultRates();
        const fromRate = fallbackRates[fromCurrency] || 1;
        const toRate = fallbackRates[toCurrency] || 1;
        return (amount / fromRate) * toRate;
    }
}
export const currencyConverter = new GlobalCurrencyConverter();
