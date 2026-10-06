import { isRate } from '@/modules/booking/lib/pricing';

function money(value) {
  return Math.round(Number(value) * 100) / 100;
}

export const defaultPromotions = {
  promoCodes: [
    {
      id: 'promo-welcome20',
      code: 'WELCOME20',
      name: 'Welcome $20 Off',
      description: 'Website welcome offer for new customers.',
      discountType: 'fixed',
      discountValue: 20,
      minimumSpend: 50,
      visibility: 'public',
      active: true,
    },
    {
      id: 'promo-private10',
      code: 'PRIVATE10',
      name: 'Private Campaign 10%',
      description: 'Example private code for email, SMS, social or referral campaigns.',
      discountType: 'percentage',
      discountValue: 10,
      minimumSpend: 100,
      visibility: 'private',
      active: true,
    },
    {
      id: 'promo-referral25',
      code: 'REFERRAL25',
      name: 'Referral $25 Off',
      description: 'Example private referral offer.',
      discountType: 'fixed',
      discountValue: 25,
      minimumSpend: 150,
      visibility: 'private',
      active: false,
    },
  ],
  announcement: {
    enabled: true,
    message: 'New to MateLink? Save $20 on your first clean',
    promoCodeId: 'promo-welcome20',
    showBookNow: true,
    buttonText: 'BOOK NOW',
    buttonLink: '/book',
  },
};

export function normalizePromoCode(value = '') {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

export function normalizePromotions(value) {
  const incomingCodes = Array.isArray(value?.promoCodes)
    ? value.promoCodes
    : defaultPromotions.promoCodes;

  const promoCodes = incomingCodes.map((promo, index) => ({
    id: promo.id || `promo-${index + 1}`,
    code: normalizePromoCode(promo.code),
    name: promo.name || normalizePromoCode(promo.code) || `Promo ${index + 1}`,
    description: promo.description || '',
    discountType: promo.discountType === 'percentage' ? 'percentage' : 'fixed',
    discountValue: Number.isFinite(Number(promo.discountValue))
      ? Math.max(0, Number(promo.discountValue))
      : 0,
    minimumSpend: Number.isFinite(Number(promo.minimumSpend))
      ? Math.max(0, Number(promo.minimumSpend))
      : 0,
    visibility: promo.visibility === 'private' ? 'private' : 'public',
    active: promo.active !== false,
  }));

  const announcement = {
    ...defaultPromotions.announcement,
    ...(value?.announcement || {}),
  };

  return {
    promoCodes,
    announcement,
  };
}

export function findPromoByCode(promotions, rawCode) {
  const code = normalizePromoCode(rawCode);

  if (!code) return null;

  return (
    promotions?.promoCodes?.find(
      promo => normalizePromoCode(promo.code) === code
    ) || null
  );
}

export function findPromoById(promotions, id) {
  return promotions?.promoCodes?.find(promo => promo.id === id) || null;
}

export function getPublicAnnouncementPromo(promotions) {
  const announcement = promotions?.announcement;

  if (!announcement?.enabled) return null;

  const promo = findPromoById(promotions, announcement.promoCodeId);

  if (!promo || !promo.active || promo.visibility !== 'public') {
    return null;
  }

  return promo;
}

export function validatePromoCode(promotions, rawCode, subtotal) {
  const code = normalizePromoCode(rawCode);

  if (!code) {
    return {
      valid: false,
      reason: 'Enter a promo code.',
      promo: null,
      discount: 0,
      finalTotal: subtotal,
    };
  }

  const promo = findPromoByCode(promotions, code);

  if (!promo) {
    return {
      valid: false,
      reason: 'This promo code is invalid.',
      promo: null,
      discount: 0,
      finalTotal: subtotal,
    };
  }

  if (!promo.active) {
    return {
      valid: false,
      reason: 'This promo code is no longer active.',
      promo,
      discount: 0,
      finalTotal: subtotal,
    };
  }

  if (!isRate(subtotal)) {
    return {
      valid: false,
      reason: 'Complete your cleaning selections before applying a promo code.',
      promo,
      discount: 0,
      finalTotal: subtotal,
    };
  }

  if (subtotal < Number(promo.minimumSpend || 0)) {
    return {
      valid: false,
      reason: `This promo code requires a minimum booking value of $${Number(
        promo.minimumSpend || 0
      ).toFixed(2)}.`,
      promo,
      discount: 0,
      finalTotal: subtotal,
    };
  }

  let discount = 0;

  if (promo.discountType === 'percentage') {
    discount = subtotal * (Number(promo.discountValue || 0) / 100);
  } else {
    discount = Number(promo.discountValue || 0);
  }

  discount = money(Math.min(Math.max(discount, 0), subtotal));

  return {
    valid: true,
    reason: '',
    promo,
    discount,
    finalTotal: money(subtotal - discount),
  };
}

export function applyPromoToEstimate(estimate, promotions, rawCode) {
  const result = validatePromoCode(promotions, rawCode, estimate?.total);

  if (!result.valid) {
    return {
      ...estimate,
      subtotal: estimate?.total ?? null,
      discount: 0,
      promoCode: null,
      promoId: null,
    };
  }

  return {
    ...estimate,
    subtotal: estimate.total,
    discount: result.discount,
    total: result.finalTotal,
    promoCode: result.promo.code,
    promoId: result.promo.id,
  };
}
