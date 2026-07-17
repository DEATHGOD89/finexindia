export class EMICalculator {
    constructor(principal, rate, tenure) {
        this.principal = principal;
        this.rate = rate;
        this.tenure = tenure;
    }
    
    calculate() {
        if (this.principal <= 0 || this.rate < 0 || this.tenure <= 0) {
            return { emi: 0, totalInterest: 0, totalPayment: 0, schedule: [] };
        }
        
        const monthlyRate = this.rate / 12 / 100;
        const months = this.tenure * 12;
        
        let emi, totalPayment, totalInterest;
        
        if (this.rate === 0) {
            emi = this.principal / months;
            totalPayment = this.principal;
            totalInterest = 0;
        } else {
            emi = this.principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
                  (Math.pow(1 + monthlyRate, months) - 1);
            totalPayment = emi * months;
            totalInterest = totalPayment - this.principal;
        }
        
        const schedule = this.generateSchedule(monthlyRate, months, emi);
        
        return {
            emi: Math.round(emi * 100) / 100,
            totalInterest: Math.round(totalInterest * 100) / 100,
            totalPayment: Math.round(totalPayment * 100) / 100,
            schedule
        };
    }
    
    generateSchedule(monthlyRate, months, emi) {
        const schedule = [];
        let balance = this.principal;
        
        for (let month = 1; month <= months; month++) {
            const interest = balance * monthlyRate;
            let principalPaid = emi - interest;
            
            if (principalPaid > balance) {
                principalPaid = balance;
            }
            
            balance -= principalPaid;
            
            schedule.push({
                month,
                emi: Math.round(emi * 100) / 100,
                principal: Math.round(principalPaid * 100) / 100,
                interest: Math.round(interest * 100) / 100,
                balance: Math.round(Math.max(0, balance) * 100) / 100
            });
            
            if (balance <= 0) break;
        }
        
        return schedule;
    }
}
