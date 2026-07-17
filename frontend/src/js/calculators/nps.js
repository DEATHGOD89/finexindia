export class NPSCalculator {
    constructor(monthlyAmount, rate, tenure, annuityRate = 0.4, annuityReturn = 6) {
        this.monthlyAmount = monthlyAmount;
        this.rate = rate;
        this.tenure = tenure;
        this.annuityRate = annuityRate;
        this.annuityReturn = annuityReturn;
    }
    
    calculate() {
        const monthlyRate = this.rate / 12 / 100;
        const months = this.tenure * 12;
        let totalInvestment = 0;
        let corpusAtRetirement = 0;
        
        for (let month = 1; month <= months; month++) {
            totalInvestment += this.monthlyAmount;
            corpusAtRetirement = (corpusAtRetirement + this.monthlyAmount) * (1 + monthlyRate);
        }
        
        const lumpSum = corpusAtRetirement * (1 - this.annuityRate);
        const annuityCorpus = corpusAtRetirement * this.annuityRate;
        const monthlyPension = annuityCorpus * (this.annuityReturn / 12 / 100);
        
        return {
            totalInvestment: Math.round(totalInvestment),
            corpusAtRetirement: Math.round(corpusAtRetirement),
            lumpSum: Math.round(lumpSum),
            annuityCorpus: Math.round(annuityCorpus),
            monthlyPension: Math.round(monthlyPension * 100) / 100
        };
    }
}
