export class FDCalculator {
    constructor(principal, rate, tenure, compounding = 'quarterly') {
        this.principal = principal;
        this.rate = rate;
        this.tenure = tenure;
        this.compounding = compounding;
    }
    
    calculate() {
        const compoundingFreq = { yearly: 1, half_yearly: 2, quarterly: 4, monthly: 12 };
        const n = compoundingFreq[this.compounding] || 4;
        const years = this.tenure;
        
        const maturityValue = this.principal * Math.pow(1 + (this.rate / 100 / n), n * years);
        const interestEarned = maturityValue - this.principal;
        
        return {
            maturityValue: Math.round(maturityValue * 100) / 100,
            interestEarned: Math.round(interestEarned * 100) / 100,
            principal: this.principal,
            effectiveYield: Math.round(((Math.pow(1 + (this.rate / 100 / n), n) - 1) * 100) * 100) / 100
        };
    }
}
