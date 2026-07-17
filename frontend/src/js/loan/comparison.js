export class LoanComparison {
    constructor(amount, tenure) {
        this.amount = amount;
        this.tenure = tenure;
    }
    
    getBanks() {
        return [
            { bank: "SBI", rate: 8.50, processingFee: 0.50 },
            { bank: "HDFC", rate: 8.75, processingFee: 0.25 },
            { bank: "ICICI", rate: 8.65, processingFee: 0.35 },
            { bank: "Axis Bank", rate: 8.90, processingFee: 0.30 },
            { bank: "Kotak Mahindra", rate: 8.80, processingFee: 0.40 },
            { bank: "Bank of Baroda", rate: 8.60, processingFee: 0.50 },
            { bank: "Punjab National Bank", rate: 8.55, processingFee: 0.75 },
            { bank: "Union Bank", rate: 8.70, processingFee: 0.50 },
            { bank: "Canara Bank", rate: 8.65, processingFee: 0.55 },
            { bank: "IDFC First", rate: 8.85, processingFee: 0.25 }
        ];
    }
    
    compare() {
        const results = [];
        
        for (const bank of this.getBanks()) {
            const emi = this.calculateEMI(this.amount, bank.rate, this.tenure);
            const totalPayment = emi * this.tenure * 12;
            const totalInterest = totalPayment - this.amount;
            const processingFeeAmount = this.amount * bank.processingFee / 100;
            
            results.push({
                ...bank,
                emi: Math.round(emi * 100) / 100,
                totalInterest: Math.round(totalInterest * 100) / 100,
                totalPayment: Math.round(totalPayment * 100) / 100,
                processingFeeAmount: Math.round(processingFeeAmount * 100) / 100,
                score: this.calculateScore(emi, totalInterest, processingFeeAmount)
            });
        }
        
        return results.sort((a, b) => a.score - b.score);
    }
    
    calculateEMI(principal, rate, tenure) {
        const monthlyRate = rate / 12 / 100;
        const months = tenure * 12;
        return principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
               (Math.pow(1 + monthlyRate, months) - 1);
    }
    
    calculateScore(emi, interest, processingFee) {
        const emiWeight = 0.4;
        const interestWeight = 0.4;
        const feeWeight = 0.2;
        
        return (emi * emiWeight) + (interest * interestWeight) + (processingFee * feeWeight);
    }
}
