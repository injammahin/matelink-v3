import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { initialSettings } from '@/shared/data/content';
import { calculatePrice, isRate } from '@/modules/booking/lib/pricing';
import { futureDate, makeId, makeReference } from '@/shared/lib/dates';
import {
  applyPromoToEstimate,
  defaultPromotions,
  normalizePromotions,
} from '@/shared/lib/promotions';

const STORAGE_KEY = 'matelink.frontend.v1';
const AppContext = createContext(null);
const stages = ['pending', 'confirmed', 'cleaning', 'completed'];

export const statusLabels = {
  pending: 'Pending review',
  confirmed: 'Confirmed',
  cleaning: 'Cleaning',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function isRecleanEligible(booking) {
  return Boolean(
    booking &&
      booking.service === 'end-of-lease' &&
      booking.status === 'completed' &&
      booking.bondBackGuaranteeEligible === true
  );
}

function normalizeBooking(booking) {
  return {
    ...booking,
    bondBackGuaranteeEligible:
      typeof booking.bondBackGuaranteeEligible === 'boolean'
        ? booking.bondBackGuaranteeEligible
        : booking.service === 'end-of-lease',
    completedAt:
      booking.completedAt ||
      (booking.status === 'completed' ? booking.date || null : null),
    recleans: Array.isArray(booking.recleans) ? booking.recleans : [],
  };
}

function normalizeSettings(savedSettings) {
  const saved =
    savedSettings && typeof savedSettings === 'object'
      ? savedSettings
      : {};

  const savedServiceRates =
    saved.serviceRates && typeof saved.serviceRates === 'object'
      ? saved.serviceRates
      : {};

  const serviceIds = new Set([
    ...Object.keys(initialSettings.serviceRates || {}),
    ...Object.keys(savedServiceRates),
  ]);

  const serviceRates = {};

  serviceIds.forEach(id => {
    const defaults =
      initialSettings.serviceRates?.[id] || {
        base: null,
        bedroom: null,
        bathroom: null,
        active: true,
      };

    serviceRates[id] = {
      ...defaults,
      ...(savedServiceRates[id] || {}),
      active:
        typeof savedServiceRates[id]?.active === 'boolean'
          ? savedServiceRates[id].active
          : defaults.active ?? true,
    };
  });

  return {
    ...structuredClone(initialSettings),
    ...saved,

    serviceRates,

    propertyAdjustments: {
      ...structuredClone(initialSettings.propertyAdjustments || {}),
      ...(saved.propertyAdjustments || {}),
    },

    addons: Array.isArray(saved.addons)
      ? saved.addons
      : structuredClone(initialSettings.addons || []),

    postcodes: Array.isArray(saved.postcodes)
      ? saved.postcodes
      : structuredClone(initialSettings.postcodes || []),

    notifications: {
      ...structuredClone(initialSettings.notifications || {}),
      ...(saved.notifications || {}),
    },

    templates: {
      ...structuredClone(initialSettings.templates || {}),
      ...(saved.templates || {}),
    },
  };
}

function demoBooking(id, service, status, days) {
  const date = futureDate(days);

  return {
    id,
    token: `preview-${id.toLowerCase()}`,
    reference: id,
    service,
    property: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    postcode: '2000',
    date,
    time: 'Morning (8 am – 12 pm)',
    addons: {},
    customer: {
      name: 'Example Customer',
      email: 'customer@example.invalid',
      mobile: '0400 000 000',
      address: 'Example address, Sydney NSW 2000',
      notes: '',
    },
    status,
    paymentStatus: 'unpaid',
    paymentMethod: null,
    priceSnapshot: {
      ready: false,
      total: null,
      items: [],
      knownExtras: 0,
    },
    confirmedTotal: null,
    createdAt: new Date().toISOString(),
    completedAt: status === 'completed' ? date : null,
    bondBackGuaranteeEligible: service === 'end-of-lease',
    demo: true,
    recleans: [],
  };
}

function initialState() {
  return {
    settings: normalizeSettings(initialSettings),
    promotions: structuredClone(defaultPromotions),
    bookings: [
      demoBooking('MC-DEMO-1001', 'deep', 'pending', 3),
      demoBooking('MC-DEMO-1002', 'move-in', 'confirmed', 5),
      demoBooking('MC-DEMO-1003', 'end-of-lease', 'completed', -2),
    ],
    quotes: [],
    contacts: [],
    notifications: [],
  };
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (
      parsed?.settings?.serviceRates &&
      Array.isArray(parsed.bookings) &&
      Array.isArray(parsed.quotes) &&
      Array.isArray(parsed.contacts) &&
      Array.isArray(parsed.notifications)
    ) {
      return {
        ...parsed,
        settings: normalizeSettings(parsed.settings),
        promotions: normalizePromotions(parsed.promotions),
        bookings: parsed.bookings.map(normalizeBooking),
      };
    }
  } catch {
    // Fall back safely when browser storage is unavailable or corrupt.
  }

  return initialState();
}

function notificationFor(state, booking, event) {
  if (!state.settings.notifications[event]) {
    return state.notifications;
  }

  const template = state.settings.templates[event] || '';
  const text = template
    .replaceAll('{{name}}', booking.customer.name)
    .replaceAll('{{reference}}', booking.reference)
    .replaceAll(
      '{{booking_link}}',
      `${window.location.origin}/booking/${booking.token}`
    );

  return [
    {
      id: makeId('EMAIL'),
      bookingId: booking.id,
      event,
      to: booking.customer.email,
      text,
      createdAt: new Date().toISOString(),
      delivery: 'preview',
    },
    ...state.notifications,
  ];
}

export function AppProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      toast.error(
        'Browser storage is full or unavailable. Your changes will only last for this session.',
        { id: 'storage-warning' }
      );
    }
  }, [state]);

  function updateSettings(settings) {
    setState(previous => ({
      ...previous,
      settings: normalizeSettings(settings),
    }));
  }

  function updatePromotions(promotions) {
    setState(previous => ({
      ...previous,
      promotions: normalizePromotions(promotions),
    }));
  }

  function createBooking(draft) {
    const baseEstimate = calculatePrice(draft, state.settings);
    const priceSnapshot = applyPromoToEstimate(
      baseEstimate,
      state.promotions,
      draft.appliedPromoCode
    );

    const booking = {
      ...structuredClone(draft),
      id: makeId('BOOKING'),
      token: crypto.randomUUID(),
      reference: makeReference(),
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod: null,
      priceSnapshot,
      promoSnapshot: priceSnapshot.promoCode
        ? {
            code: priceSnapshot.promoCode,
            promoId: priceSnapshot.promoId,
            subtotal: priceSnapshot.subtotal,
            discount: priceSnapshot.discount,
            finalTotal: priceSnapshot.total,
          }
        : null,
      confirmedTotal: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
      bondBackGuaranteeEligible: draft.service === 'end-of-lease',
      recleans: [],
      demo: false,
    };

    setState(previous => ({
      ...previous,
      bookings: [booking, ...previous.bookings],
      notifications: notificationFor(previous, booking, 'submitted'),
    }));

    return booking;
  }

  function updateBooking(id, patch) {
    setState(previous => {
      const original = previous.bookings.find(booking => booking.id === id);
      if (!original) return previous;

      const safePatch = { ...patch };

      // Booking totals are immutable once confirmed. Editing global prices cannot re-price a job.
      if (
        original.status !== 'pending' &&
        (!original.demo || isRate(original.confirmedTotal))
      ) {
        delete safePatch.confirmedTotal;
      }

      if (safePatch.status && safePatch.status !== original.status) {
        const next = safePatch.status;

        if (
          original.status === 'cancelled' ||
          (next !== 'cancelled' &&
            stages.indexOf(next) !== stages.indexOf(original.status) + 1)
        ) {
          return previous;
        }

        if (next === 'confirmed') {
          safePatch.confirmedTotal = isRate(patch.confirmedTotal)
            ? patch.confirmedTotal
            : original.priceSnapshot.total;

          if (!isRate(safePatch.confirmedTotal)) {
            return previous;
          }
        }

        if (next === 'completed') {
          safePatch.completedAt = new Date().toISOString();
        }
      }

      if (
        safePatch.paymentStatus === 'paid' &&
        (original.status === 'pending' || original.status === 'cancelled')
      ) {
        return previous;
      }

      const updated = normalizeBooking({
        ...original,
        ...safePatch,
      });

      const event =
        safePatch.status && safePatch.status !== original.status
          ? safePatch.status
          : safePatch.paymentStatus === 'paid' &&
              original.paymentStatus !== 'paid'
            ? 'paid'
            : null;

      return {
        ...previous,
        bookings: previous.bookings.map(booking =>
          booking.id === id ? updated : booking
        ),
        notifications: event
          ? notificationFor(previous, updated, event)
          : previous.notifications,
      };
    });
  }

  function createQuote(values) {
    const quote = {
      ...values,
      id: makeId('QUOTE'),
      reference: makeReference('QT'),
      status: 'new',
      amount: null,
      createdAt: new Date().toISOString(),
    };

    setState(previous => ({
      ...previous,
      quotes: [quote, ...previous.quotes],
    }));

    return quote;
  }

  function updateQuote(id, patch) {
    setState(previous => ({
      ...previous,
      quotes: previous.quotes.map(quote =>
        quote.id === id ? { ...quote, ...patch } : quote
      ),
    }));
  }

  function convertQuote(id, service) {
    const quote = state.quotes.find(item => item.id === id);

    if (
      !quote ||
      quote.bookingId ||
      quote.status !== 'accepted' ||
      !isRate(quote.amount)
    ) {
      return null;
    }

    const booking = {
      id: makeId('BOOKING'),
      token: crypto.randomUUID(),
      reference: makeReference(),
      service: service || quote.service,
      property: quote.property || 'apartment',
      bedrooms: quote.bedrooms || 1,
      bathrooms: quote.bathrooms || 1,
      postcode: quote.postcode,
      date: quote.date || '',
      time: '',
      addons: {},
      customer: {
        ...quote.customer,
        notes: quote.requirements,
      },
      photos: quote.photos,
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod: null,
      priceSnapshot: {
        ready: true,
        total: quote.amount,
        items: [
          {
            label: 'Accepted custom quote',
            amount: quote.amount,
          },
        ],
        knownExtras: 0,
      },
      confirmedTotal: null,
      quoteId: quote.id,
      createdAt: new Date().toISOString(),
      completedAt: null,
      bondBackGuaranteeEligible:
        (service || quote.service) === 'end-of-lease',
      recleans: [],
      demo: false,
    };

    setState(previous => ({
      ...previous,
      bookings: [booking, ...previous.bookings],
      quotes: previous.quotes.map(item =>
        item.id === id
          ? {
              ...item,
              status: 'converted',
              bookingId: booking.id,
            }
          : item
      ),
      notifications: notificationFor(previous, booking, 'submitted'),
    }));

    return booking;
  }

  function requestReclean(id, values) {
    const original = state.bookings.find(
      booking => booking.id === id
    );

    if (!isRecleanEligible(original)) {
      return null;
    }

    const request = {
      ...values,
      id: makeId('RECLEAN'),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setState(previous => {
      const current = previous.bookings.find(
        booking => booking.id === id
      );

      if (!isRecleanEligible(current)) {
        return previous;
      }

      const updated = {
        ...current,
        recleans: [...current.recleans, request],
      };

      return {
        ...previous,
        bookings: previous.bookings.map(booking =>
          booking.id === id ? updated : booking
        ),
        notifications: notificationFor(previous, updated, 'reclean'),
      };
    });

    return request;
  }

  function updateReclean(bookingId, requestId, status) {
    setState(previous => {
      const booking = previous.bookings.find(
        item => item.id === bookingId
      );

      if (!booking) return previous;

      const updated = {
        ...booking,
        recleans: booking.recleans.map(request =>
          request.id === requestId
            ? {
                ...request,
                status,
                updatedAt: new Date().toISOString(),
              }
            : request
        ),
      };

      return {
        ...previous,
        bookings: previous.bookings.map(item =>
          item.id === bookingId ? updated : item
        ),
        notifications: notificationFor(previous, updated, 'reclean'),
      };
    });
  }

  function addContact(values) {
    setState(previous => ({
      ...previous,
      contacts: [
        {
          ...values,
          id: makeId('CONTACT'),
          status: 'new',
          createdAt: new Date().toISOString(),
        },
        ...previous.contacts,
      ],
    }));
  }

  function resetDemo() {
    setState(initialState());
    sessionStorage.removeItem('matelink.booking-draft');
  }

  return (
    <AppContext.Provider
      value={{
        ...state,
        updateSettings,
        updatePromotions,
        createBooking,
        updateBooking,
        createQuote,
        updateQuote,
        convertQuote,
        requestReclean,
        updateReclean,
        addContact,
        resetDemo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const value = useContext(AppContext);

  if (!value) {
    throw new Error('useApp must be used within AppProvider');
  }

  return value;
}
