export class PPFCalculator {
    constructor(annualAmount, rate, tenure) {
        this.annualAmount = annualAmount;
        this.rate = rate;
        this.tenure = tenure;
    }
    
    calculate() {
        const rate = this.rate / 100;
        let totalInvestment = 0;
        let maturityValue = 0;
        const timeline = [];
        
        for (let year = 1; year <= this.tenure; year++) {
            totalInvestment += this.annualAmount;
            maturityValue = (maturityValue + this.annualAmount) * (1 + rate);
            
            timeline.push({
                year,
                investment: Math.round(totalInvestment),
                value: Math.round(maturityValue)
            });
        }
        
        return {
            totalInvestment: Math.round(totalInvestment),
            interestEarned: Math.round(maturityValue - totalInvestment),
            maturityValue: Math.round(maturityValue),
            timeline
        };
    }
}
