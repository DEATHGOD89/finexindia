import { EMICalculator } from './src/js/calculators/emi.js';
import { PPFCalculator } from './src/js/calculators/ppf.js';
import { NPSCalculator } from './src/js/calculators/nps.js';
import { GlobalLoanComparison } from './src/js/comparison/globalLoans.js';

async function runTests() {
    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`✅ PASS: ${message}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${message}`);
            failed++;
        }
    }

    console.log("Starting Financial Calculations Tests...");

    // 1. Tax Calculator (Backend API)
    try {
        const taxPayload = {
            income: 1800000,
            section_80c: 150000,
            section_80d: 50000,
            hra: 100000,
            home_loan: 200000
        };
        const response = await fetch('http://localhost:8080/api/v1/tax/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taxPayload)
        });
        const taxResult = await response.json();
        
        assert(taxResult.old_regime !== undefined && taxResult.new_regime !== undefined, "Tax API returns old and new regime tax amounts");
    } catch (e) {
        console.error("Tax API Test Error:", e);
        failed++;
    }

    // 2. PPF Calculator
    try {
        const ppf = new PPFCalculator(150000, 7.1, 15);
        const ppfResult = ppf.calculate();
        // 1.5L for 15 years @ 7.1% is approx 40,68,209
        assert(ppfResult.maturityValue > 4000000 && ppfResult.maturityValue < 4100000, `PPF calculation is accurate (Got: ${ppfResult.maturityValue})`);
        assert(ppfResult.totalInvestment === 2250000, `PPF total investment is correct (Got: ${ppfResult.totalInvestment})`);
    } catch (e) {
        console.error("PPF Test Error:", e);
        failed++;
    }

    // 3. NPS Calculator
    try {
        const nps = new NPSCalculator(5000, 10, 30);
        const npsResult = nps.calculate();
        // 5000/mo = 60,000/yr for 30 years @ 10%
        // Total invested = 18,00,000
        assert(npsResult.totalInvestment === 1800000, `NPS total investment is correct (Got: ${npsResult.totalInvestment})`);
        assert(npsResult.corpusAtRetirement > 10000000, `NPS corpus calculation makes sense (Got: ${npsResult.corpusAtRetirement})`);
    } catch (e) {
        console.error("NPS Test Error:", e);
        failed++;
    }

    // 4. EMI Calculator
    try {
        const emi = new EMICalculator(5000000, 8.5, 20);
        const emiResult = emi.calculate();
        // EMI for 50L @ 8.5% for 20 years = 43,391 approx
        assert(Math.round(emiResult.emi) === 43391, `EMI calculation is accurate (Got: ${emiResult.emi})`);
    } catch (e) {
        console.error("EMI Test Error:", e);
        failed++;
    }

    // 5. Global Loan Comparison
    try {
        const globalLoans = new GlobalLoanComparison(100000, 20, 'US');
        const glResult = await globalLoans.compare();
        assert(glResult.length > 0, "Global Loans returns multiple banks");
        assert(glResult[0].bank !== undefined, "Global Loans result has bank name");
        assert(glResult[0].emi > 0, "Global Loans calculates EMI for international banks");
    } catch (e) {
        console.error("Global Loans Test Error:", e);
        failed++;
    }

    console.log(`\nTest Summary: ${passed} Passed, ${failed} Failed`);
}

runTests();
