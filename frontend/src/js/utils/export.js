export class ExportManager {
    exportPDF(elementId, filename) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        let printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${filename}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background: #1a237e; color: white; padding: 10px; text-align: left; }
                        td { padding: 8px; border-bottom: 1px solid #ddd; }
                        h2 { color: #1a237e; }
                    </style>
                </head>
                <body>
                    <h2>${filename.replace(/_/g, ' ')}</h2>
                    ${element.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
        }, 250);
    }
    
    exportExcel(elementId, filename) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const html = `
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${filename}</title>
                </head>
                <body>
                    <table>${element.querySelector('table').innerHTML}</table>
                </body>
            </html>
        `;
        
        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}
