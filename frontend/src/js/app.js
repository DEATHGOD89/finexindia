import '../css/style.css';
import '../css/responsive.css';
import { EMICalculator } from './calculators/emi.js';
import { SIPCalculator } from './calculators/sip.js';
import { FDCalculator } from './calculators/fd.js';
import { RCCalculator } from './calculators/rd.js';
import { PPFCalculator } from './calculators/ppf.js';
import { NPSCalculator } from './calculators/nps.js';
import { LoanComparison } from './loan/comparison.js';
import { AmortizationSchedule } from './loan/amortization.js';
import { IndianTaxCalculator } from './tax/indianTax.js';
import { GoalPlanner } from './planning/goalPlanner.js';
import { CurrencyFormatter } from './utils/currency.js';
import { GlobalI18n } from './utils/i18n.js';
import { ExportManager } from './utils/export.js';
import { ChartManager } from './charts/chartConfig.js';
import { GlobalLoanComparison } from './comparison/globalLoans.js';
import { GlobalCurrencyConverter } from './currency/converter.js';
import { HistoryManager } from './utils/historyManager.js';

class FinanceApp {
    constructor() {
        this.currency = new CurrencyFormatter();
        this.language = new GlobalI18n();
        this.exportManager = new ExportManager();
        this.chartManager = new ChartManager();
        this.historyManager = new HistoryManager();
        this.currencyConverter = new GlobalCurrencyConverter();
        this.selectedCountry = 'US';

        this.initTheme();
        this.initNavigation();
        this.initLanguageSelector();
        this.initCountrySelector();
        this.initMobileMenu();
        this.initServiceWorker();
        this.initAutoSave();
        this.initDefaultCalculations();
    }

    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);

        document.getElementById('themeToggle').addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    initNavigation() {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo(link.dataset.page);
            });
        });
    }

    navigateTo(pageId) {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageId);
        });

        document.querySelectorAll('.page').forEach(page => {
            page.classList.toggle('active', page.id === `page-${pageId}`);
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.getElementById('navLinks').classList.remove('open');
        this.calculatePage(pageId);
        if (pageId === 'history') {
            this.renderHistory();
        }
    }

    renderHistory() {
        const historyList = document.getElementById('historyList');
        const history = this.historyManager.getHistory();
        
        if (history.length === 0) {
            historyList.innerHTML = '<div style="text-align: center; color: #a1a1aa; padding: 2rem;">No calculations saved yet.</div>';
            return;
        }

        historyList.innerHTML = '';
        history.forEach(item => {
            const card = document.createElement('div');
            card.style.cssText = 'background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;';
            
            const date = new Date(item.date).toLocaleDateString();
            
            if (item.type === 'Tax') {
                const saving = item.result.oldRegime.tax - item.result.newRegime.tax;
                const best = saving > 0 ? 'Old' : 'New';
                card.innerHTML = `
                    <div>
                        <h4 style="color: white; margin-bottom: 0.5rem;"><i class="fas fa-file-invoice"></i> Income Tax (${date})</h4>
                        <div style="color: #a1a1aa; font-size: 0.9rem;">Income: ${this.currency.format(item.inputs.income)}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: #4caf50; font-weight: bold; margin-bottom: 0.3rem;">Best: ${best} Regime</div>
                        <div style="color: white;">Tax: ${this.currency.format(Math.min(item.result.oldRegime.tax, item.result.newRegime.tax))}</div>
                    </div>
                `;
            }
            historyList.appendChild(card);
        });
    }

    calculatePage(pageId) {
        switch(pageId) {
            case 'emi': calculateEMI(); break;
            case 'sip': calculateSIP(); break;
            case 'tax': calculateTax(); break;
            case 'loan-comparison': compareLoans(); break;
            case 'goals': calculateGoal(); break;
            case 'ppf': calculatePPF(); break;
            case 'nps': calculateNPS(); break;
            case 'global-loan': compareGlobalLoans(); break;
        }
    }

    initLanguageSelector() {
        const langBtn = document.getElementById('langBtn');
        const dropdown = document.querySelector('#langBtn').parentElement.querySelector('.lang-dropdown');

        if (!langBtn || !dropdown) return;

        langBtn.addEventListener('click', () => dropdown.classList.toggle('show'));

        dropdown.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = link.dataset.lang;
                if (!lang) return;
                this.language.setLanguage(lang);
                dropdown.classList.remove('show');
                langBtn.innerHTML = `<i class="fas fa-globe"></i> ${lang.toUpperCase()}`;
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#langBtn') && !e.target.closest('.lang-dropdown')) {
                dropdown.classList.remove('show');
            }
        });
    }

    initCountrySelector() {
        const countryBtn = document.getElementById('countryBtn');
        const dropdown = document.querySelector('#countryBtn').parentElement.querySelector('.lang-dropdown');
        if (!countryBtn || !dropdown) return;

        countryBtn.addEventListener('click', () => dropdown.classList.toggle('show'));

        dropdown.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const country = link.dataset.country;
                this.selectedCountry = country;
                dropdown.classList.remove('show');
                const names = { US: 'US', GB: 'UK', EU: 'EU', AU: 'AU', CA: 'CA' };
                countryBtn.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${names[country] || country}`;

                if (document.getElementById('page-global-loan').classList.contains('active')) {
                    compareGlobalLoans();
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-selector')) dropdown.classList.remove('show');
        });
    }

    initMobileMenu() {
        document.getElementById('mobileMenu').addEventListener('click', () => {
            document.getElementById('navLinks').classList.toggle('open');
        });
    }

    initServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
        }
    }

    initAutoSave() {
        try {
            const savedState = sessionStorage.getItem('financeProState');
            if (savedState) {
                const state = JSON.parse(savedState);
                Object.keys(state).forEach(id => {
                    const el = document.getElementById(id);
                    if (el && el.type !== 'radio' && el.type !== 'checkbox') {
                        el.value = state[id];
                    }
                });
                if (state._emiMode) {
                    const radio = document.querySelector(`input[name="emiCalcMode"][value="${state._emiMode}"]`);
                    if (radio) {
                        radio.checked = true;
                        if(window.toggleEmiMode) window.toggleEmiMode();
                    }
                }
            }
        } catch (e) {
            console.error('Error restoring state:', e);
        }

        const saveState = () => {
            const state = {};
            document.querySelectorAll('input[type="number"], input[type="range"], select').forEach(el => {
                if (el.id) state[el.id] = el.value;
            });
            const emiMode = document.querySelector('input[name="emiCalcMode"]:checked');
            if (emiMode) state._emiMode = emiMode.value;
            sessionStorage.setItem('financeProState', JSON.stringify(state));
        };

        document.addEventListener('input', saveState);
        document.addEventListener('change', saveState);
    }

    initDefaultCalculations() {
        setTimeout(() => {
            calculateEMI();
            calculateSIP();
            calculateTax();
            compareLoans();
            calculateGoal();
            calculatePPF();
            calculateNPS();
        }, 100);
    }
}

window.navigateTo = (pageId) => { app.navigateTo(pageId); };
const app = new FinanceApp();

// ============ EMI ============
window.toggleEmiMode = function() {
    const mode = document.querySelector('input[name="emiCalcMode"]:checked').value;
    
    // Toggle EMI input visibility
    document.getElementById('emiInputGroup').style.display = (mode === 'emi') ? 'none' : 'block';
    
    // Reset badges and disabled states
    document.querySelectorAll('#loanAmountGroup .calc-badge, #interestRateGroup .calc-badge, #loanTenureGroup .calc-badge').forEach(el => el.style.display = 'none');
    ['loanAmount', 'loanAmountRange', 'interestRate', 'interestRateRange', 'loanTenure', 'loanTenureRange'].forEach(id => {
        const el = document.getElementById(id);
        el.disabled = false;
        el.style.opacity = '1';
    });
    
    if (mode === 'principal') {
        document.querySelector('#loanAmountGroup .calc-badge').style.display = 'inline-block';
        ['loanAmount', 'loanAmountRange'].forEach(id => {
            document.getElementById(id).disabled = true;
            document.getElementById(id).style.opacity = '0.5';
        });
    } else if (mode === 'rate') {
        document.querySelector('#interestRateGroup .calc-badge').style.display = 'inline-block';
        ['interestRate', 'interestRateRange'].forEach(id => {
            document.getElementById(id).disabled = true;
            document.getElementById(id).style.opacity = '0.5';
        });
    } else if (mode === 'tenure') {
        document.querySelector('#loanTenureGroup .calc-badge').style.display = 'inline-block';
        ['loanTenure', 'loanTenureRange'].forEach(id => {
            document.getElementById(id).disabled = true;
            document.getElementById(id).style.opacity = '0.5';
        });
    }
    
    calculateEMI();
};

window.calculateEMI = function() {
    const mode = document.querySelector('input[name="emiCalcMode"]:checked')?.value || 'emi';
    const expectedEmi = parseFloat(document.getElementById('expectedEmi').value) || 0;
    const amount = parseFloat(document.getElementById('loanAmount').value) || 0;
    const rate = parseFloat(document.getElementById('interestRate').value) || 0;
    const tenure = parseFloat(document.getElementById('loanTenure').value) || 0;

    const emiCalc = new EMICalculator(amount, rate, tenure, expectedEmi, mode);
    const result = emiCalc.calculate();

    if (result.error) {
        document.getElementById('emiResult').textContent = 'Error';
        document.getElementById('totalInterest').textContent = '₹0';
        document.getElementById('totalPayment').textContent = '₹0';
        return;
    }

    if (mode === 'principal') {
        document.getElementById('loanAmount').value = result.principal;
        document.getElementById('loanAmountRange').value = result.principal;
    } else if (mode === 'rate') {
        document.getElementById('interestRate').value = result.rate;
        document.getElementById('interestRateRange').value = result.rate;
    } else if (mode === 'tenure') {
        document.getElementById('loanTenure').value = result.tenure;
        document.getElementById('loanTenureRange').value = result.tenure;
    } else {
        document.getElementById('loanAmountRange').value = amount;
        document.getElementById('interestRateRange').value = rate;
        document.getElementById('loanTenureRange').value = tenure;
    }

    document.getElementById('emiResult').textContent = app.currency.format(result.emi);
    document.getElementById('totalInterest').textContent = app.currency.format(result.totalInterest);
    document.getElementById('totalPayment').textContent = app.currency.format(result.totalPayment);

    app.chartManager.renderEMIChart(result.schedule);
    renderAmortizationSchedule(result.schedule);
};

// ============ SIP ============
window.calculateSIP = function() {
    const amount = parseFloat(document.getElementById('sipAmount').value) || 0;
    const rate = parseFloat(document.getElementById('sipReturn').value) || 0;
    const years = parseFloat(document.getElementById('sipYears').value) || 0;
    const stepup = parseFloat(document.getElementById('sipStepup').value) || 0;

    const sipCalc = new SIPCalculator(amount, rate, years, stepup);
    const result = sipCalc.calculate();

    document.getElementById('sipTotalInvestment').textContent = app.currency.format(result.totalInvestment);
    document.getElementById('sipReturns').textContent = app.currency.format(result.estimatedReturns);
    document.getElementById('sipMaturity').textContent = app.currency.format(result.maturityValue);

    app.chartManager.renderSIPChart(result.timeline);
};

// ============ TAX ============
window.calculateTax = async function() {
    const btn = document.querySelector('#page-tax .btn-primary');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
    btn.disabled = true;

    try {
        const income = parseFloat(document.getElementById('taxIncome').value) || 0;
        const section80C = parseFloat(document.getElementById('tax80C').value) || 0;
        const section80D = parseFloat(document.getElementById('tax80D').value) || 0;
        const hra = parseFloat(document.getElementById('taxHRA').value) || 0;
        const homeLoan = parseFloat(document.getElementById('taxHomeLoan').value) || 0;

        // Perform calculation completely client-side using the imported class
        const calculator = new IndianTaxCalculator(income, {
            section80C: section80C,
            section80D: section80D,
            hra: hra,
            homeLoan: homeLoan
        });
        
        // Simulate a slight delay to show the loading state
        await new Promise(r => setTimeout(r, 400));
        
        const result = calculator.calculate();

        document.getElementById('oldRegimeTax').textContent = app.currency.format(result.oldRegime.tax);
        document.getElementById('newRegimeTax').textContent = app.currency.format(result.newRegime.tax);

        const savings = result.oldRegime.tax - result.newRegime.tax;
        const recommended = savings > 0 ? 'Old' : 'New';
        const savingsAmount = Math.abs(savings);

        document.getElementById('taxSavings').querySelector('span').innerHTML =
            `You save ${app.currency.format(savingsAmount)} by choosing the <strong id="recommendedRegime">${recommended}</strong> Regime`;

        // Save to History
        app.historyManager.saveCalculation('Tax', 
            { income, section80C, section80D, hra, homeLoan }, 
            { 
                oldRegime: { tax: result.oldRegime.tax }, 
                newRegime: { tax: result.newRegime.tax } 
            }
        );
    } catch (e) {
        console.error("Tax Calculation Error:", e);
        alert('Failed to calculate tax. Please check your inputs.');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};

// ============ LOAN COMPARISON ============
window.compareLoans = function() {
    const amount = parseFloat(document.getElementById('compareAmount').value) || 0;
    const tenure = parseFloat(document.getElementById('compareTenure').value) || 0;

    const comparison = new LoanComparison(amount, tenure);
    const results = comparison.compare();

    const tbody = document.getElementById('comparisonBody');
    tbody.innerHTML = '';

    results.forEach((bank, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${bank.bank}</strong></td>
            <td>${bank.rate}%</td>
            <td>${bank.processingFee}%</td>
            <td>${app.currency.format(bank.emi)}</td>
            <td>${app.currency.format(bank.totalInterest)}</td>
            <td><span class="badge ${index === 0 ? 'best' : ''}">${index + 1}</span></td>
        `;
        tbody.appendChild(row);
    });
};

window.compareGlobalLoans = async function() {
    const amount = parseFloat(document.getElementById('glAmount').value) || 0;
    const tenure = parseFloat(document.getElementById('glTenure').value) || 0;
    const tbody = document.getElementById('glComparisonBody');

    if (!amount || !tenure) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Enter loan amount and tenure</td></tr>';
        return;
    }

    const country = app.selectedCountry || 'US';
    const comparator = new GlobalLoanComparison(amount, tenure, country);
    const results = await comparator.compare();

    const symbolMap = { IN: '₹', US: '$', GB: '£', EU: '€', AU: 'A$', CA: 'C$' };
    const symbol = symbolMap[country] || '$';

    let html = '';
    for (const bank of results) {
        html += `<tr>
            <td><strong>${bank.bank}</strong></td>
            <td>${bank.rate}%</td>
            <td>${bank.processingFee}%</td>
            <td>${symbol}${bank.emi.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td>${symbol}${bank.totalInterest.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td>${symbol}${(bank.emi * tenure * 12).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        </tr>`;
    }

    tbody.innerHTML = html || '<tr><td colspan="6" style="text-align:center;">No lenders found for this country</td></tr>';
};

// ============ GOAL PLANNER ============
window.calculateGoal = function() {
    const target = parseFloat(document.getElementById('goalAmount').value) || 0;
    const years = parseFloat(document.getElementById('goalYears').value) || 0;
    const rate = parseFloat(document.getElementById('goalReturn').value) || 0;
    const existing = parseFloat(document.getElementById('goalExisting').value) || 0;

    const planner = new GoalPlanner(target, years, rate, existing);
    const result = planner.plan();

    document.getElementById('goalSIP').textContent = app.currency.format(result.monthlySIP);
    document.getElementById('goalTotalInvestment').textContent = app.currency.format(result.totalInvestment);
    document.getElementById('goalMaturity').textContent = app.currency.format(result.maturityValue);

    app.chartManager.renderGoalChart(result.timeline);
    renderGoalTimeline(result.timeline);
};

// ============ PPF ============
window.calculatePPF = function() {
    const amount = parseFloat(document.getElementById('ppfAmount').value) || 0;
    const rate = parseFloat(document.getElementById('ppfRate').value) || 0;
    const tenure = parseFloat(document.getElementById('ppfTenure').value) || 0;

    const ppfCalc = new PPFCalculator(amount, rate, tenure);
    const result = ppfCalc.calculate();

    document.getElementById('ppfInvestment').textContent = app.currency.format(result.totalInvestment);
    document.getElementById('ppfInterest').textContent = app.currency.format(result.interestEarned);
    document.getElementById('ppfMaturity').textContent = app.currency.format(result.maturityValue);

    app.chartManager.renderPPFChart(result.timeline);
};

// ============ NPS ============
window.calculateNPS = function() {
    const amount = parseFloat(document.getElementById('npsAmount').value) || 0;
    const rate = parseFloat(document.getElementById('npsRate').value) || 0;
    const years = parseFloat(document.getElementById('npsYears').value) || 0;

    const npsCalc = new NPSCalculator(amount, rate, years);
    const result = npsCalc.calculate();

    document.getElementById('npsInvestment').textContent = app.currency.format(result.totalInvestment);
    document.getElementById('npsCorpus').textContent = app.currency.format(result.corpusAtRetirement);
    document.getElementById('npsPension').textContent = app.currency.format(result.monthlyPension);

    app.chartManager.renderNPSChart(result);
};

// ============ HELPERS ============
function renderAmortizationSchedule(schedule) {
    const container = document.getElementById('scheduleTable');
    if (!schedule || schedule.length === 0) {
        container.innerHTML = '';
        return;
    }
    let html = `<table><thead><tr><th>Month</th><th>EMI</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead><tbody>`;
    const displayRows = [...schedule.slice(0, 12), ...schedule.slice(-6)];
    displayRows.forEach((row, index) => {
        if (index === 12 && schedule.length > 18) {
            html += `<tr><td colspan="5" style="text-align:center;color:var(--text-light);">...</td></tr>`;
        }
        html += `<tr><td>${row.month}</td><td>${app.currency.format(row.emi)}</td><td>${app.currency.format(row.principal)}</td><td>${app.currency.format(row.interest)}</td><td>${app.currency.format(row.balance)}</td></tr>`;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;
}

function renderGoalTimeline(timeline) {
    const container = document.getElementById('goalTimeline');
    if (!timeline || timeline.length === 0) { container.innerHTML = ''; return; }
    let html = '<div class="timeline">';
    timeline.forEach(point => {
        const progress = point.percentage;
        const color = progress >= 100 ? '#2e7d32' : '#1a237e';
        html += `<div class="timeline-item"><div class="timeline-year">Year ${point.year}</div><div class="timeline-bar"><div class="timeline-progress" style="width:${Math.min(progress, 100)}%;background:${color}"></div></div><div class="timeline-amount">${app.currency.format(point.corpus)} (${progress}%)</div></div>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

window.exportSchedule = function() { app.exportManager.exportPDF('scheduleTable', 'Amortization_Schedule'); };
window.exportScheduleExcel = function() { app.exportManager.exportExcel('scheduleTable', 'Amortization_Schedule'); };
