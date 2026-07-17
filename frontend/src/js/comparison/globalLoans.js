import { currencyConverter } from '../currency/converter.js';

export class GlobalLoanComparison {
    constructor(amount, tenure, countryCode) {
        this.amount = amount;
        this.tenure = tenure;
        this.countryCode = countryCode;
        this.loans = this.getLoansByCountry(countryCode);
    }
    
    getLoansByCountry(countryCode) {
        const loans = {
            IN: [
                { bank: "SBI", rate: 8.5, processingFee: 0.5 },
                { bank: "HDFC", rate: 8.75, processingFee: 0.25 }
            ],
            US: [
                { bank: "Wells Fargo", rate: 6.5, processingFee: 1.0 },
                { bank: "Chase", rate: 6.6, processingFee: 0.9 }
            ],
            GB: [
                { bank: "Barclays", rate: 4.5, processingFee: 0.5 },
                { bank: "HSBC UK", rate: 4.55, processingFee: 0.45 }
            ],
            EU: [
                { bank: "Deutsche Bank", rate: 3.5, processingFee: 0.5 },
                { bank: "Santander", rate: 3.7, processingFee: 0.45 }
            ],
            AU: [
                { bank: "Commonwealth", rate: 5.0, processingFee: 0.6 },
                { bank: "Westpac", rate: 5.15, processingFee: 0.5 }
            ],
            CA: [
                { bank: "RBC", rate: 6.0, processingFee: 0.5 },
                { bank: "TD Canada", rate: 6.15, processingFee: 0.45 },
                { bank: "Scotia", rate: 6.1, processingFee: 0.5 }
            ]
        };
        return loans[countryCode] || loans['US'];
    }
    
    async compare() {
        const results = [];
        const currencyMap = {
            IN: 'INR', US: 'USD', GB: 'GBP', EU: 'EUR', AU: 'AUD'
        };
        const targetCurrency = currencyMap[this.countryCode] || 'USD';
        
        for (const loan of this.loans) {
            const emi = this.calculateEMI(this.amount, loan.rate, this.tenure);
            const totalPayment = emi * this.tenure * 12;
            const totalInterest = totalPayment - this.amount;
            const processingFeeAmount = this.amount * loan.processingFee / 100;
            
            results.push({
                ...loan,
                emi: Math.round(emi * 100) / 100,
                totalInterest: Math.round(totalInterest * 100) / 100,
                totalPayment: Math.round(totalPayment * 100) / 100,
                processingFeeAmount: Math.round(processingFeeAmount * 100) / 100,
                currency: targetCurrency
            });
        }
        return results.sort((a, b) => a.emi - b.emi);
    }
    
    calculateEMI(principal, rate, tenure) {
        const monthlyRate = rate / 12 / 100;
        const months = tenure * 12;
        return principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
               (Math.pow(1 + monthlyRate, months) - 1);
    }
}
