export class CurrencyFormatter {
    format(amount) {
        if (isNaN(amount)) return '₹0';
        
        const rounded = Math.round(amount);
        const formatted = rounded.toLocaleString('en-IN');
        return `₹${formatted}`;
    }
    
    formatShort(amount) {
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(1)} Cr`;
        } else if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(1)} L`;
        } else if (amount >= 1000) {
            return `₹${(amount / 1000).toFixed(1)} K`;
        }
        return this.format(amount);
    }
}
