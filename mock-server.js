const http = require('http');

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/api/v1/tax/calculate' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const income = data.income || 0;
                const deductions = (data.section_80c || 0) + (data.section_80d || 0) + (data.hra || 0) + (data.home_loan || 0);
                
                // Old Regime Simulation
                let oldTaxable = Math.max(0, income - deductions - 50000);
                let oldTax = oldTaxable > 500000 ? oldTaxable * 0.2 : 0; // Extremely simplified
                
                // New Regime Simulation
                let newTaxable = income;
                let newTax = newTaxable > 700000 ? newTaxable * 0.1 : 0; // Extremely simplified
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    old_regime: { taxable_income: oldTaxable, tax: oldTax },
                    new_regime: { taxable_income: newTaxable, tax: newTax }
                }));
            } catch (e) {
                res.writeHead(400);
                res.end('Bad Request');
            }
        });
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

const port = 8080;
server.listen(port, () => {
    console.log(`Mock server running at http://localhost:${port}/`);
    console.log(`Ready to intercept Tax Calculator API calls!`);
});
