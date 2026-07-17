export class RCCalculator {
    constructor(monthlyAmount, rate, tenure) {
        this.monthlyAmount = monthlyAmount;
        this.rate = rate;
        this.tenure = tenure;
    }
    
    calculate() {
        const months = this.tenure;
        const monthlyRate = this.rate / 12 / 100;
        let maturityValue = 0;
        let totalInvestment = this.monthlyAmount * months;
        
        for (let i = 1; i <= months; i++) {
            maturityValue += this.monthlyAmount * Math.pow(1 + monthlyRate, months - i + 1);
        }
        
        const interestEarned = maturityValue - totalInvestment;
        
        return {
            maturityValue: Math.round(maturityValue * 100) / 100,
            totalInvestment: Math.round(totalInvestment * 100) / 100,
            interestEarned: Math.round(interestEarned * 100) / 100
        };
    }
}
