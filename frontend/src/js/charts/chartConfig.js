export class ChartManager {
    constructor() {
        this.charts = {};
    }
    
    renderEMIChart(schedule) {
        const ctx = document.getElementById('emiChart').getContext('2d');
        
        if (this.charts.emi) {
            this.charts.emi.destroy();
        }
        
        const labels = schedule.filter((_, i) => i % 12 === 0 || i === schedule.length - 1).map(r => `Month ${r.month}`);
        const principalData = schedule.filter((_, i) => i % 12 === 0 || i === schedule.length - 1).map(r => r.principal);
        const interestData = schedule.filter((_, i) => i % 12 === 0 || i === schedule.length - 1).map(r => r.interest);
        
        this.charts.emi = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Principal', 'Total Interest'],
                datasets: [{
                    data: [
                        schedule[0].balance + schedule.reduce((sum, r) => sum + r.principal, 0),
                        schedule.reduce((sum, r) => sum + r.interest, 0)
                    ],
                    backgroundColor: ['#283593', '#ff6f00'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
    
    renderSIPChart(timeline) {
        const ctx = document.getElementById('sipChart').getContext('2d');
        
        if (this.charts.sip) {
            this.charts.sip.destroy();
        }
        
        this.charts.sip = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeline.map(t => `Year ${t.year}`),
                datasets: [
                    {
                        label: 'Investment',
                        data: timeline.map(t => t.investment),
                        borderColor: '#283593',
                        backgroundColor: 'rgba(40, 53, 147, 0.1)',
                        fill: true
                    },
                    {
                        label: 'Maturity Value',
                        data: timeline.map(t => t.value),
                        borderColor: '#ff6f00',
                        backgroundColor: 'rgba(255, 111, 0, 0.1)',
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => '₹' + (value / 100000).toFixed(1) + 'L'
                        }
                    }
                }
            }
        });
    }
    
    renderPPFChart(timeline) {
        const ctx = document.getElementById('ppfChart').getContext('2d');
        if (this.charts.ppf) this.charts.ppf.destroy();
        this.charts.ppf = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeline.map(t => `Year ${t.year}`),
                datasets: [{
                    label: 'PPF Corpus',
                    data: timeline.map(t => t.value),
                    borderColor: '#2e7d32',
                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
                scales: { y: { beginAtZero: true, ticks: { callback: v => '₹' + (v/100000).toFixed(1) + 'L' } } }
            }
        });
    }

    renderNPSChart(result) {
        const ctx = document.getElementById('npsChart').getContext('2d');
        if (this.charts.nps) this.charts.nps.destroy();
        this.charts.nps = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Lump Sum (60%)', 'Annuity Corpus (40%)'],
                datasets: [{
                    data: [result.lumpSum, result.annuityCorpus],
                    backgroundColor: ['#283593', '#ff6f00'],
                    borderWidth: 0
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        });
    }

    renderGoalChart(timeline) {
        const ctx = document.getElementById('goalChart').getContext('2d');
        
        if (this.charts.goal) {
            this.charts.goal.destroy();
        }
        
        this.charts.goal = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: timeline.map(t => `Year ${t.year}`),
                datasets: [{
                    label: 'Corpus Growth',
                    data: timeline.map(t => t.corpus),
                    backgroundColor: timeline.map(t => 
                        t.percentage >= 100 ? '#2e7d32' : '#283593'
                    )
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => '₹' + (value / 100000).toFixed(1) + 'L'
                        }
                    }
                }
            }
        });
    }
}
