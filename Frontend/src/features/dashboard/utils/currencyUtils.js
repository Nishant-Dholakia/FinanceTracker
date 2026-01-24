export const getCurrencySymbol = (currencyCode) => {
  if (!currencyCode) return '$'; // Default fallback
  
  switch (currencyCode.toUpperCase()) {
    case 'INR': return '₹';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'USD': default: return '$';
  }
};