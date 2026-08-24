export const CURRENCIES = {
  INR: { symbol: "₹", rate: 1, label: "INR (₹)", flag: "🇮🇳" }
};

export const formatCurrency = (amountInINR) => {
  const num = typeof amountInINR === 'number' ? amountInINR : Number(amountInINR) || 0;
  return `₹${Math.round(num).toLocaleString("en-IN")}`;
};
