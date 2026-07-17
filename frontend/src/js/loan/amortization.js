export class AmortizationSchedule {
    constructor(principal, rate, tenure) {
        this.principal = principal;
        this.rate = rate;
        this.tenure = tenure;
    }
    
    generate() {
        const monthlyRate = this.rate / 12 / 100;
        const months = this.tenure * 12;
        const emi = this.principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
                    (Math.pow(1 + monthlyRate, months) - 1);
        
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
        
        return {
            schedule,
            emi: Math.round(emi * 100) / 100,
            totalInterest: Math.round((emi * months - this.principal) * 100) / 100,
            totalPayment: Math.round((emi * months) * 100) / 100
        };
    }
}
