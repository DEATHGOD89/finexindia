export class GoalPlanner {
    constructor(targetAmount, years, rate, existingSavings = 0, adjustForInflation = false) {
        this.baseTarget = targetAmount;
        this.years = years;
        this.rate = rate;
        this.existingSavings = existingSavings;
        this.adjustForInflation = adjustForInflation;
        this.inflationRate = 0.06; // 6% average Indian inflation
    }
    
    plan() {
        const adjustedTarget = this.adjustForInflation 
            ? this.baseTarget * Math.pow(1 + this.inflationRate, this.years)
            : this.baseTarget;
            
        this.targetAmount = adjustedTarget;

        const monthlyRate = this.rate / 12 / 100;
        const months = this.years * 12;
        
        const futureValueOfExisting = this.existingSavings * Math.pow(1 + monthlyRate, months);
        const remainingTarget = this.targetAmount - futureValueOfExisting;
        
        let monthlySIP = 0;
        if (remainingTarget > 0) {
            monthlySIP = remainingTarget * monthlyRate / 
                        (Math.pow(1 + monthlyRate, months) - 1) * 
                        (1 + monthlyRate);
        }
        
        const timeline = [];
        let corpus = this.existingSavings;
        let totalInvestment = this.existingSavings;
        
        for (let month = 1; month <= months; month++) {
            corpus = (corpus + monthlySIP) * (1 + monthlyRate);
            totalInvestment += monthlySIP;
            
            if (month % 12 === 0) {
                timeline.push({
                    year: month / 12,
                    corpus: Math.round(corpus),
                    investment: Math.round(totalInvestment),
                    percentage: Math.round((corpus / this.targetAmount) * 100)
                });
            }
        }
        
        return {
            adjustedTarget: Math.round(adjustedTarget),
            monthlySIP: Math.round(monthlySIP * 100) / 100,
            totalInvestment: Math.round(totalInvestment),
            maturityValue: Math.round(corpus),
            timeline
        };
    }
}
