export const formatCurrency = (value: number) => {
  // simple rupee formatting
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  } catch {
    return `₹${value}`;
  }
};

export const formatDateShort = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString();
};

// simple id generator (drop-in; replace with uuid if you want)
export const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
