import { getLang } from './i18n.js';

export const money = (amount, currency) =>
  new Intl.NumberFormat(getLang() === 'hu' ? 'hu-HU' : 'en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
