export class EMICalculator {
    constructor(principal, rate, tenure, expectedEmi = 0, calculateMode = 'emi') {
        this.principal = parseFloat(principal) || 0;
        this.rate = parseFloat(rate) || 0;
        this.tenure = parseFloat(tenure) || 0;
        this.expectedEmi = parseFloat(expectedEmi) || 0;
        this.calculateMode = calculateMode;
    }
    
    static calculatePrincipal(emi, rate, tenure) {
        const r = rate / 12 / 100;
        const n = tenure * 12;
        if (r === 0) return emi * n;
        const P = (emi * (Math.pow(1+r, n) - 1)) / (r * Math.pow(1+r, n));
        return Math.round(P);
    }

    static calculateTenure(emi, principal, rate) {
        const r = rate / 12 / 100;
        if (r === 0) return principal / emi / 12; // in years
        if (emi <= principal * r) return 0; // Will never pay off
        const n = Math.log(emi / (emi - principal * r)) / Math.log(1 + r);
        return Math.round((n / 12) * 10) / 10; // in years
    }

    static calculateRate(emi, principal, tenure) {
        const n = tenure * 12;
        if (principal <= 0 || emi <= 0 || tenure <= 0) return 0;
        let r = 0.005; // Initial guess
        for (let i = 0; i < 100; i++) {
            let f = principal * r * Math.pow(1+r, n) - emi * (Math.pow(1+r, n) - 1);
            let df = principal * Math.pow(1+r, n) + principal * r * n * Math.pow(1+r, n-1) - emi * n * Math.pow(1+r, n-1);
            if (df === 0) break;
            let rNext = r - f/df;
            if (Math.abs(rNext - r) < 1e-7) {
                r = rNext;
                break;
            }
            r = rNext;
        }
        return Math.round((r * 12 * 100) * 100) / 100; // Annual rate
    }

    calculate() {
        if (this.calculateMode === 'principal') {
            this.principal = EMICalculator.calculatePrincipal(this.expectedEmi, this.rate, this.tenure);
        } else if (this.calculateMode === 'tenure') {
            this.tenure = EMICalculator.calculateTenure(this.expectedEmi, this.principal, this.rate);
            if (this.tenure === 0) {
                return { emi: this.expectedEmi, totalInterest: 0, totalPayment: 0, schedule: [], principal: this.principal, rate: this.rate, tenure: this.tenure, error: 'EMI too low to cover interest' };
            }
        } else if (this.calculateMode === 'rate') {
            this.rate = EMICalculator.calculateRate(this.expectedEmi, this.principal, this.tenure);
        }

        if (this.principal <= 0 || this.rate < 0 || this.tenure <= 0) {
            return { emi: 0, totalInterest: 0, totalPayment: 0, schedule: [], principal: this.principal, rate: this.rate, tenure: this.tenure };
        }
        
        const monthlyRate = this.rate / 12 / 100;
        const months = Math.ceil(this.tenure * 12);
        
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
        
        // If we calculated emi via expectedEmi, use that for schedule to avoid rounding differences
        const finalEmi = (this.calculateMode !== 'emi') ? this.expectedEmi : emi;
        const schedule = this.generateSchedule(monthlyRate, months, finalEmi);
        
        return {
            emi: Math.round(finalEmi * 100) / 100,
            totalInterest: Math.round(totalInterest * 100) / 100,
            totalPayment: Math.round(totalPayment * 100) / 100,
            principal: this.principal,
            rate: this.rate,
            tenure: this.tenure,
            schedule
        };
    }
    
    generateSchedule(monthlyRate, months, emi) {
        const schedule = [];
        let balance = this.principal;
        
        for (let month = 1; month <= months; month++) {
            const interest = balance * monthlyRate;
            let principalPaid = emi - interest;
            
            if (principalPaid > balance || month === months) {
                principalPaid = balance;
                emi = principalPaid + interest; // Adjust last EMI
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
