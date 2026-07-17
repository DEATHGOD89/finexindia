export class SIPCalculator {
    constructor(monthlyAmount, rate, years, stepup = 0) {
        this.monthlyAmount = monthlyAmount;
        this.rate = rate;
        this.years = years;
        this.stepup = stepup;
    }
    
    calculate() {
        const monthlyRate = this.rate / 12 / 100;
        const months = this.years * 12;
        let totalInvestment = 0;
        let maturityValue = 0;
        const timeline = [];
        
        let currentMonthlyAmount = this.monthlyAmount;
        
        for (let month = 1; month <= months; month++) {
            if (month > 1 && month % 12 === 1) {
                currentMonthlyAmount *= (1 + this.stepup / 100);
            }
            
            totalInvestment += currentMonthlyAmount;
            maturityValue = (maturityValue + currentMonthlyAmount) * (1 + monthlyRate);
            
            if (month % 12 === 0) {
                timeline.push({
                    year: month / 12,
                    investment: Math.round(totalInvestment),
                    value: Math.round(maturityValue)
                });
            }
        }
        
        return {
            totalInvestment: Math.round(totalInvestment),
            estimatedReturns: Math.round(maturityValue - totalInvestment),
            maturityValue: Math.round(maturityValue),
            timeline
        };
    }
}
