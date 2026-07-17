export class IndianTaxCalculator {
    constructor(income, deductions, incomeType = 'salary') {
        this.income = income;
        this.deductions = deductions;
        this.incomeType = incomeType;
        this.standardDeduction = (incomeType === 'salary') ? 50000 : 0;
    }
    
    calculate() {
        return {
            oldRegime: this.calculateOldRegime(),
            newRegime: this.calculateNewRegime()
        };
    }
    
    applySurchargeAndCess(tax, income) {
        let surchargeRate = 0;
        if (income > 50000000) { // > 5 Cr
            surchargeRate = 0.25; 
        } else if (income > 20000000) { // > 2 Cr
            surchargeRate = 0.25; // Capped at 25% for new regime, but let's just use 25% for both for simplicity here
        } else if (income > 10000000) { // > 1 Cr
            surchargeRate = 0.15;
        } else if (income > 5000000) { // > 50 L
            surchargeRate = 0.10;
        }
        
        let taxWithSurcharge = tax + (tax * surchargeRate);
        
        // Marginal relief logic could go here (omitted for brevity)
        
        // Add 4% Health & Education Cess
        return taxWithSurcharge * 1.04;
    }
    
    calculateOldRegime() {
        const totalDeductions = this.deductions.section80C + 
                               this.deductions.section80D +
                               this.deductions.hra +
                               this.deductions.homeLoan + 
                               this.standardDeduction;
        
        const taxableIncome = Math.max(0, this.income - totalDeductions);
        const tax = this.computeOldRegimeTax(taxableIncome, this.income);
        
        return {
            taxableIncome: Math.round(taxableIncome),
            tax: Math.round(tax),
            deductions: totalDeductions
        };
    }
    
    computeOldRegimeTax(taxableIncome, grossIncome) {
        let tax = 0;
        let remaining = taxableIncome;
        
        const slabs = [
            { limit: 250000, rate: 0 },
            { limit: 500000, rate: 0.05 },
            { limit: 1000000, rate: 0.20 },
            { limit: Infinity, rate: 0.30 }
        ];
        
        let prevLimit = 0;
        for (const slab of slabs) {
            const amount = Math.min(remaining, slab.limit - prevLimit);
            if (amount > 0) {
                tax += amount * slab.rate;
                remaining -= amount;
            }
            prevLimit = slab.limit;
            if (remaining <= 0) break;
        }
        
        // Section 87A Rebate
        if (taxableIncome <= 500000) {
            tax = Math.max(0, tax - 12500);
        }
        
        return tax > 0 ? this.applySurchargeAndCess(tax, grossIncome) : 0;
    }
    
    calculateNewRegime() {
        const taxableIncome = Math.max(0, this.income - this.standardDeduction);
        const tax = this.computeNewRegimeTax(taxableIncome, this.income);
        
        return {
            taxableIncome: Math.round(taxableIncome),
            tax: Math.round(tax),
            standardDeduction: this.standardDeduction
        };
    }
    
    computeNewRegimeTax(taxableIncome, grossIncome) {
        let tax = 0;
        let remaining = taxableIncome;
        
        const slabs = [
            { limit: 300000, rate: 0 },
            { limit: 600000, rate: 0.05 },
            { limit: 900000, rate: 0.10 },
            { limit: 1200000, rate: 0.15 },
            { limit: 1500000, rate: 0.20 },
            { limit: Infinity, rate: 0.30 }
        ];
        
        let prevLimit = 0;
        for (const slab of slabs) {
            const amount = Math.min(remaining, slab.limit - prevLimit);
            if (amount > 0) {
                tax += amount * slab.rate;
                remaining -= amount;
            }
            prevLimit = slab.limit;
            if (remaining <= 0) break;
        }
        
        // Section 87A Rebate for New Regime (up to 7 Lakhs)
        if (taxableIncome <= 700000) {
            tax = 0; // Marginal relief around 7L omitted for brevity
        }
        
        return tax > 0 ? this.applySurchargeAndCess(tax, grossIncome) : 0;
    }
}
