import { useEffect, useMemo, useState } from 'react';
import {
  BedDouble,
  Bath,
  CookingPot,
  Sofa,
  WashingMachine,
  House,
  Plus,
  Trash2,
  Pencil,
  Save,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  Sparkles,
  Layers3,
  Check,
  X,
  Search,
  RotateCcw,
  Info,
  AlertTriangle,
  CircleDollarSign,
  Eye,
  EyeOff,
} from 'lucide-react';

/**
 * MATELINK STATIC SERVICE / PROPERTY / ADD-ON PRICING BUILDER
 * -----------------------------------------------------------
 * File path:
 * src/modules/admin/pages/ServicePricingBuilderPage.jsx
 *
 * Frontend-only demo:
 * - Uses localStorage
 * - No Laravel/API dependency yet
 *
 * Data model:
 * 1. Service types have NO price.
 * 2. Each service owns six property-pricing groups.
 * 3. Add-ons are global.
 * 4. Each add-on can be enabled/disabled per service.
 * 5. Each service can have a different default add-on price.
 * 6. Each service can have its own dynamic add-on pricing rules.
 */

const STORAGE_KEY = 'matelink.admin.pricing-builder.v3';

const DIMENSIONS = [
  {
    key: 'bedrooms',
    label: 'Bedrooms',
    icon: BedDouble,
    numeric: true,
    hint: 'Create bedroom choices and a price for each one.',
  },
  {
    key: 'bathrooms',
    label: 'Bathrooms',
    icon: Bath,
    numeric: true,
    hint: 'Create bathroom choices and a price for each one.',
  },
  {
    key: 'kitchens',
    label: 'Kitchen',
    icon: CookingPot,
    numeric: true,
    hint: 'Create kitchen choices and a price for each one.',
  },
  {
    key: 'livingDining',
    label: 'Living & Dining Areas',
    icon: Sofa,
    numeric: true,
    hint: 'Create living/dining choices and a price for each one.',
  },
  {
    key: 'laundry',
    label: 'Laundry Room / Cupboard',
    icon: WashingMachine,
    numeric: true,
    hint: 'Create laundry/cupboard choices and a price for each one.',
  },
  {
    key: 'homeSize',
    label: 'Home Size',
    icon: House,
    numeric: false,
    hint: 'Apartment, townhouse, house or any other size/category.',
  },
];


const uid = prefix =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const money = value =>
  new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const cleanNumber = value => {
  if (value === '' || value === null || value === undefined) return '';
  const number = Number(value);
  return Number.isFinite(number) ? number : '';
};

function option(label, value, price, active = true) {
  return {
    id: uid('option'),
    label,
    value,
    price,
    active,
  };
}

function bedroomOptions(prices) {
  return prices.map((price, index) => {
    const count = index + 1;
    return option(
      `${count} ${count === 1 ? 'Bedroom' : 'Bedrooms'}`,
      count,
      price
    );
  });
}

function bathroomOptions(prices) {
  return prices.map((price, index) => {
    const count = index + 1;
    return option(
      `${count} ${count === 1 ? 'Bathroom' : 'Bathrooms'}`,
      count,
      price
    );
  });
}

function createDimensions(profile) {
  return {
    bedrooms: bedroomOptions(profile.bedrooms),
    bathrooms: bathroomOptions(profile.bathrooms),

    kitchens: [
      option('1 Kitchen', 1, profile.kitchens[0]),
      option('2 Kitchens', 2, profile.kitchens[1]),
      option('3 Kitchens', 3, profile.kitchens[2]),
    ],

    livingDining: [
      option('1 Living & 1 Dining', 1, profile.livingDining[0]),
      option('2 Living / Dining Areas', 2, profile.livingDining[1]),
      option('3 Living / Dining Areas', 3, profile.livingDining[2]),
      option('4 Living / Dining Areas', 4, profile.livingDining[3]),
    ],

    laundry: [
      option('0 Laundry Room / Cupboard', 0, profile.laundry[0]),
      option('1 Laundry Room / Cupboard', 1, profile.laundry[1]),
      option('2 Laundry Rooms / Cupboards', 2, profile.laundry[2]),
      option('3 Laundry Rooms / Cupboards', 3, profile.laundry[3]),
    ],

    homeSize: [
      option('Apartment', 'apartment', profile.homeSize[0]),
      option('Townhouse', 'townhouse', profile.homeSize[1]),
      option('Small House', 'small-house', profile.homeSize[2]),
      option('Medium House', 'medium-house', profile.homeSize[3]),
      option('Large House', 'large-house', profile.homeSize[4]),
      option('Duplex / Multi-level', 'duplex', profile.homeSize[5]),
    ],
  };
}

const PRICING_PROFILES = {
  general: {
    bedrooms: [45, 60, 75, 90, 105, 120, 135, 150, 165, 180],
    bathrooms: [25, 40, 55, 70, 85, 100],
    kitchens: [20, 35, 50],
    livingDining: [15, 25, 35, 45],
    laundry: [0, 10, 18, 25],
    homeSize: [0, 15, 25, 35, 45, 60],
  },

  deep: {
    bedrooms: [65, 87, 109, 131, 153, 175, 197, 219, 241, 263],
    bathrooms: [35, 52, 69, 86, 103, 120],
    kitchens: [30, 50, 70],
    livingDining: [22, 36, 50, 64],
    laundry: [0, 15, 25, 35],
    homeSize: [0, 20, 35, 50, 70, 90],
  },

  'move-in': {
    bedrooms: [70, 95, 120, 145, 170, 195, 220, 245, 270, 295],
    bathrooms: [38, 58, 78, 98, 118, 138],
    kitchens: [35, 58, 80],
    livingDining: [25, 42, 59, 76],
    laundry: [0, 18, 30, 42],
    homeSize: [0, 25, 40, 58, 78, 100],
  },

  'end-of-lease': {
    bedrooms: [85, 115, 145, 175, 205, 235, 265, 295, 325, 355],
    bathrooms: [45, 70, 95, 120, 145, 170],
    kitchens: [45, 72, 100],
    livingDining: [30, 50, 70, 90],
    laundry: [0, 22, 38, 54],
    homeSize: [0, 30, 50, 72, 95, 120],
  },
};

function createService(id, name, profileKey = 'general') {
  return {
    id,
    name,
    code: id.toUpperCase().replaceAll('-', '_'),
    active: true,
    dimensions: createDimensions(
      PRICING_PROFILES[profileKey] || PRICING_PROFILES.general
    ),
  };
}

function servicePrice(enabled, defaultPrice, rules = []) {
  return {
    enabled,
    defaultPrice,
    rules,
  };
}

const SERVICES = [
  createService('general', 'General Cleaning', 'general'),
  createService('deep', 'Deep Cleaning', 'deep'),
  createService('move-in', 'Move-In Cleaning', 'move-in'),
  createService('end-of-lease', 'End-of-Lease Cleaning', 'end-of-lease'),
];


function findServiceOption(serviceId, dimensionKey, value) {
  const serviceItem = SERVICES.find(item => item.id === serviceId);

  return (
    serviceItem?.dimensions?.[dimensionKey]?.find(
      optionItem => String(optionItem.value) === String(value)
    ) || null
  );
}

function exactCondition(serviceId, dimensionKey, value) {
  const optionItem = findServiceOption(serviceId, dimensionKey, value);

  return {
    id: uid('condition'),
    dimensionKey,
    operator: 'equals',
    optionId: optionItem?.id || '',
    minOptionId: '',
    maxOptionId: '',
  };
}

function rangeCondition(serviceId, dimensionKey, minValue, maxValue) {
  const minOption = findServiceOption(serviceId, dimensionKey, minValue);
  const maxOption = findServiceOption(serviceId, dimensionKey, maxValue);

  return {
    id: uid('condition'),
    dimensionKey,
    operator: 'between',
    optionId: '',
    minOptionId: minOption?.id || '',
    maxOptionId: maxOption?.id || '',
  };
}

function pricingRule(price, conditions = []) {
  return {
    id: uid('rule'),
    price,
    conditions,
  };
}

/**
 * Existing frontend add-ons are included first:
 * Carpet Steam Clean, External Window Clean, Garage Sweep,
 * Deck Clean, Patio Clean, Small Balcony, Large Balcony,
 * Inside Fridge, Blinds Clean, Key Pickup or Drop Off.
 *
 * Extra demo add-ons are then included for testing the admin UX.
 */
const ADDON_SEEDS = [
  {
    id: 'carpet',
    name: 'Carpet Steam Clean',
    description: 'Add steam cleaning attention for carpeted rooms.',
    quantity: true,
    unit: 'room',
    prices: {
      general: servicePrice(true, 35, [
        pricingRule(35, [
          rangeCondition('general', 'bedrooms', 1, 3),
        ]),
        pricingRule(42, [
          rangeCondition('general', 'bedrooms', 4, 7),
        ]),
        pricingRule(55, [
          exactCondition('general', 'bedrooms', 5),
          exactCondition('general', 'bathrooms', 1),
          exactCondition('general', 'kitchens', 1),
          exactCondition('general', 'livingDining', 1),
          exactCondition('general', 'laundry', 1),
          exactCondition('general', 'homeSize', 'medium-house'),
        ]),
      ]),
      deep: servicePrice(true, 32, [
        pricingRule(30, [
          exactCondition('deep', 'bedrooms', 2),
          exactCondition('deep', 'bathrooms', 1),
        ]),
        pricingRule(40, [
          exactCondition('deep', 'bedrooms', 4),
          exactCondition('deep', 'bathrooms', 2),
        ]),
      ]),
      'move-in': servicePrice(true, 38),
      'end-of-lease': servicePrice(true, 42),
    },
  },

  {
    id: 'windows',
    name: 'External Window Clean',
    description: 'Accessible external windows.',
    quantity: true,
    unit: 'window',
    prices: {
      general: servicePrice(true, 12),
      deep: servicePrice(true, 11),
      'move-in': servicePrice(true, 14),
      'end-of-lease': servicePrice(true, 15, [
        pricingRule(18, [
          rangeCondition('end-of-lease', 'bedrooms', 4, 10),
        ]),
      ]),
    },
  },

  {
    id: 'garage',
    name: 'Garage Sweep',
    description: 'A sweep of the garage floor.',
    quantity: false,
    unit: 'job',
    prices: {
      general: servicePrice(false, 30),
      deep: servicePrice(true, 30),
      'move-in': servicePrice(true, 35),
      'end-of-lease': servicePrice(true, 38),
    },
  },

  {
    id: 'deck',
    name: 'Deck Clean',
    description: 'Refresh an accessible outdoor deck.',
    quantity: false,
    unit: 'job',
    prices: {
      general: servicePrice(false, 45),
      deep: servicePrice(true, 45),
      'move-in': servicePrice(true, 52),
      'end-of-lease': servicePrice(true, 55),
    },
  },

  {
    id: 'patio',
    name: 'Patio Clean',
    description: 'Add an outdoor patio clean.',
    quantity: false,
    unit: 'job',
    prices: {
      general: servicePrice(true, 38),
      deep: servicePrice(true, 42),
      'move-in': servicePrice(true, 48),
      'end-of-lease': servicePrice(true, 52),
    },
  },

  {
    id: 'small-balcony',
    name: 'Small Balcony',
    description: 'Include a small balcony.',
    quantity: false,
    unit: 'balcony',
    prices: {
      general: servicePrice(true, 25),
      deep: servicePrice(true, 28),
      'move-in': servicePrice(true, 30),
      'end-of-lease': servicePrice(true, 35),
    },
  },

  {
    id: 'large-balcony',
    name: 'Large Balcony',
    description: 'Include a large balcony.',
    quantity: false,
    unit: 'balcony',
    prices: {
      general: servicePrice(true, 42),
      deep: servicePrice(true, 48),
      'move-in': servicePrice(true, 52),
      'end-of-lease': servicePrice(true, 58),
    },
  },

  {
    id: 'fridge',
    name: 'Inside Fridge',
    description: 'Clean the inside of an empty fridge.',
    quantity: false,
    unit: 'fridge',
    prices: {
      general: servicePrice(true, 20),
      deep: servicePrice(true, 18),
      'move-in': servicePrice(true, 22),
      'end-of-lease': servicePrice(true, 25),
    },
  },

  {
    id: 'blinds',
    name: 'Blinds Clean',
    description: 'Priced per blind.',
    quantity: true,
    unit: 'blind',
    prices: {
      general: servicePrice(true, 8),
      deep: servicePrice(true, 8),
      'move-in': servicePrice(true, 9),
      'end-of-lease': servicePrice(true, 10),
    },
  },

  {
    id: 'keys',
    name: 'Key Pickup or Drop Off',
    description: 'One local key pickup/drop-off trip.',
    quantity: false,
    unit: 'trip',
    prices: {
      general: servicePrice(false, 40),
      deep: servicePrice(false, 40),
      'move-in': servicePrice(true, 40),
      'end-of-lease': servicePrice(true, 40),
    },
  },

  // Extra demo data for testing.
  {
    id: 'oven',
    name: 'Inside Oven Cleaning',
    description: 'Detailed internal oven clean.',
    quantity: false,
    unit: 'oven',
    prices: {
      general: servicePrice(true, 15),
      deep: servicePrice(true, 10, [
        pricingRule(10, [
          rangeCondition('deep', 'bedrooms', 1, 3),
        ]),
        pricingRule(20, [
          rangeCondition('deep', 'bedrooms', 4, 7),
        ]),
        pricingRule(17, [
          exactCondition('deep', 'bedrooms', 4),
          exactCondition('deep', 'bathrooms', 2),
        ]),
        pricingRule(24, [
          exactCondition('deep', 'bedrooms', 5),
          exactCondition('deep', 'bathrooms', 1),
          exactCondition('deep', 'kitchens', 1),
          exactCondition('deep', 'livingDining', 1),
          exactCondition('deep', 'laundry', 1),
          exactCondition('deep', 'homeSize', 'medium-house'),
        ]),
      ]),
      'move-in': servicePrice(true, 18),
      'end-of-lease': servicePrice(true, 25),
    },
  },

  {
    id: 'dishwasher',
    name: 'Inside Dishwasher',
    description: 'Internal dishwasher wipe and clean.',
    quantity: false,
    unit: 'dishwasher',
    prices: {
      general: servicePrice(true, 12),
      deep: servicePrice(true, 10),
      'move-in': servicePrice(true, 15),
      'end-of-lease': servicePrice(true, 18),
    },
  },

  {
    id: 'microwave',
    name: 'Inside Microwave',
    description: 'Internal microwave cleaning.',
    quantity: false,
    unit: 'microwave',
    prices: {
      general: servicePrice(true, 10),
      deep: servicePrice(true, 8),
      'move-in': servicePrice(true, 10),
      'end-of-lease': servicePrice(true, 12),
    },
  },

  {
    id: 'cabinet-inside',
    name: 'Inside Kitchen Cabinets',
    description: 'Internal accessible empty kitchen cupboards.',
    quantity: false,
    unit: 'job',
    prices: {
      general: servicePrice(false, 35),
      deep: servicePrice(true, 35),
      'move-in': servicePrice(true, 40),
      'end-of-lease': servicePrice(true, 45),
    },
  },

  {
    id: 'wardrobes',
    name: 'Inside Wardrobes',
    description: 'Internal accessible empty wardrobes.',
    quantity: true,
    unit: 'wardrobe',
    prices: {
      general: servicePrice(false, 15),
      deep: servicePrice(true, 15),
      'move-in': servicePrice(true, 18),
      'end-of-lease': servicePrice(true, 20),
    },
  },

  {
    id: 'walls',
    name: 'Wall Spot Cleaning',
    description: 'Spot-clean accessible wall marks.',
    quantity: true,
    unit: 'room',
    prices: {
      general: servicePrice(true, 15),
      deep: servicePrice(true, 18),
      'move-in': servicePrice(true, 20),
      'end-of-lease': servicePrice(true, 22),
    },
  },

  {
    id: 'ceiling-fans',
    name: 'Ceiling Fan Cleaning',
    description: 'Dust and wipe accessible ceiling fans.',
    quantity: true,
    unit: 'fan',
    prices: {
      general: servicePrice(true, 8),
      deep: servicePrice(true, 9),
      'move-in': servicePrice(true, 10),
      'end-of-lease': servicePrice(true, 10),
    },
  },

  {
    id: 'rangehood',
    name: 'Rangehood Detail',
    description: 'Additional detail cleaning for rangehood surfaces.',
    quantity: false,
    unit: 'rangehood',
    prices: {
      general: servicePrice(true, 15),
      deep: servicePrice(true, 12),
      'move-in': servicePrice(true, 16),
      'end-of-lease': servicePrice(true, 18),
    },
  },

  {
    id: 'skirting-detail',
    name: 'Detailed Skirting Boards',
    description: 'Additional detailed skirting board cleaning.',
    quantity: false,
    unit: 'job',
    prices: {
      general: servicePrice(true, 25),
      deep: servicePrice(true, 20),
      'move-in': servicePrice(true, 28),
      'end-of-lease': servicePrice(true, 30),
    },
  },

  {
    id: 'pet-hair',
    name: 'Heavy Pet Hair',
    description: 'Extra time for significant pet hair.',
    quantity: false,
    unit: 'job',
    prices: {
      general: servicePrice(true, 25),
      deep: servicePrice(true, 30),
      'move-in': servicePrice(true, 30),
      'end-of-lease': servicePrice(true, 35),
    },
  },

  {
    id: 'staircase',
    name: 'Additional Staircase',
    description: 'Cleaning for an additional internal staircase.',
    quantity: true,
    unit: 'staircase',
    prices: {
      general: servicePrice(true, 12),
      deep: servicePrice(true, 15),
      'move-in': servicePrice(true, 18),
      'end-of-lease': servicePrice(true, 20),
    },
  },
];

function buildAddon(seed) {
  return {
    id: seed.id,
    name: seed.name,
    description: seed.description,
    quantity: Boolean(seed.quantity),
    unit: seed.unit || 'item',
    active: true,
    servicePricing: Object.fromEntries(
      SERVICES.map(serviceItem => [
        serviceItem.id,
        seed.prices?.[serviceItem.id] ||
          servicePrice(false, 0, []),
      ])
    ),
  };
}

const INITIAL_CONFIG = {
  services: SERVICES,
  addons: ADDON_SEEDS.map(buildAddon),
};

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeConfig(value) {
  if (!value || typeof value !== 'object') {
    return deepClone(INITIAL_CONFIG);
  }

  const services = Array.isArray(value.services)
    ? value.services.map(item => ({
        id: item.id,
        name: item.name,
        code:
          item.code ||
          String(item.id || '')
            .toUpperCase()
            .replaceAll('-', '_'),
        active: item.active !== false,
        dimensions: DIMENSIONS.reduce((result, dimension) => {
          result[dimension.key] = Array.isArray(
            item.dimensions?.[dimension.key]
          )
            ? item.dimensions[dimension.key]
            : [];
          return result;
        }, {}),
      }))
    : deepClone(INITIAL_CONFIG.services);

  const addons = Array.isArray(value.addons)
    ? value.addons.map(addon => {
        const servicePricing = {};

        services.forEach(serviceItem => {
          const saved = addon.servicePricing?.[serviceItem.id];

          servicePricing[serviceItem.id] = {
            enabled: Boolean(saved?.enabled),
            defaultPrice: Number(saved?.defaultPrice || 0),
            rules: Array.isArray(saved?.rules) ? saved.rules : [],
          };
        });

        return {
          ...addon,
          active: addon.active !== false,
          quantity: Boolean(addon.quantity),
          unit: addon.unit || 'item',
          servicePricing,
        };
      })
    : deepClone(INITIAL_CONFIG.addons);

  return {
    services,
    addons,
  };
}

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw
      ? normalizeConfig(JSON.parse(raw))
      : deepClone(INITIAL_CONFIG);
  } catch {
    return deepClone(INITIAL_CONFIG);
  }
}

function Modal({
  open,
  title,
  description,
  children,
  onClose,
  width = 'max-w-xl',
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-[#102d43]/40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div
        className={`relative z-10 max-h-[90dvh] w-full ${width} overflow-y-auto rounded-[24px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(16,45,67,.22)]`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <h2 className="text-xl font-semibold tracking-[-.03em] text-[#102d43]">
              {title}
            </h2>

            {description ? (
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-[#102d43]"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ConfirmModal({
  open,
  title,
  description,
  confirmText = 'Delete',
  tone = 'danger',
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={onCancel}
      width="max-w-md"
    >
      <div
        className={`rounded-2xl border p-4 ${
          tone === 'danger'
            ? 'border-red-100 bg-red-50'
            : 'border-amber-100 bg-amber-50'
        }`}
      >
        <div className="flex gap-3">
          <div
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
              tone === 'danger'
                ? 'bg-red-100 text-red-600'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            <AlertTriangle size={18} />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#102d43]">
              This action needs confirmation
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Make sure this is the item you intend to remove. This static
              demo cannot undo the action after you save.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white ${
            tone === 'danger'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-[#102d43] hover:bg-[#0c2437]'
          }`}
        >
          {tone === 'danger' ? <Trash2 size={14} /> : null}
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition ${
        checked ? 'bg-[#087e83]' : 'bg-slate-300'
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
          checked ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  );
}

function CheckBox({ checked, onChange, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border transition ${
        checked
          ? 'border-[#087e83] bg-[#087e83] text-white'
          : 'border-slate-300 bg-white text-transparent hover:border-[#087e83]/50'
      }`}
    >
      <Check size={14} strokeWidth={2.5} />
    </button>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = 'text',
  min,
  placeholder,
  helper,
  disabled = false,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-[#102d43]">
        {label}
      </span>

      <input
        type={type}
        min={min}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={event => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-[#102d43] outline-none transition placeholder:text-slate-400 focus:border-[#087e83]/50 focus:ring-4 focus:ring-[#087e83]/[.08] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      />

      {helper ? (
        <span className="mt-1.5 block text-[11px] text-slate-500">
          {helper}
        </span>
      ) : null}
    </label>
  );
}

function SelectInput({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-[#102d43]">
        {label}
      </span>

      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-[#102d43] outline-none transition focus:border-[#087e83]/50 focus:ring-4 focus:ring-[#087e83]/[.08]"
      >
        {options.map(optionItem => (
          <option value={optionItem.value} key={optionItem.value}>
            {optionItem.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Badge({ children, tone = 'default' }) {
  const tones = {
    default: 'border-slate-200 bg-slate-50 text-slate-600',
    teal: 'border-[#087e83]/15 bg-[#edf6f5] text-[#087e83]',
    navy: 'border-[#102d43]/10 bg-[#102d43] text-white',
    warm: 'border-[#d6a960]/20 bg-[#fff7e7] text-[#80601e]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em] ${
        tones[tone] || tones.default
      }`}
    >
      {children}
    </span>
  );
}

function SummaryBox({ label, value, helper }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-[#faf9f6] px-3.5 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[9px] font-bold uppercase tracking-[.1em] text-slate-500">
          {label}
        </p>

        <p className="text-lg font-semibold tracking-[-.035em] text-[#102d43]">
          {value}
        </p>
      </div>

      <p className="mt-1 text-[10px] leading-4 text-slate-500">{helper}</p>
    </div>
  );
}

function EmptyPanel({ icon: Icon, title, description, action }) {
  return (
    <div className="grid min-h-[220px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-[#faf9f6] p-8 text-center">
      <div>
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-[#edf6f5] text-[#087e83]">
          <Icon size={19} />
        </div>

        <h3 className="mt-4 font-semibold text-[#102d43]">{title}</h3>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
          {description}
        </p>

        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </div>
  );
}

function ServiceRail({
  services,
  selectedServiceId,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-[0_6px_20px_rgba(16,45,67,.035)]">
      <div className="flex items-center justify-between gap-3 px-1.5 py-1.5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#087e83]">
            Service types
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {services.length} configured
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="grid h-9 w-9 place-items-center rounded-xl bg-[#087e83] text-white transition hover:bg-[#066e72]"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="mt-1.5 space-y-1">
        {services.map(item => {
          const selected = item.id === selectedServiceId;

          return (
            <div
              className={`group flex items-center gap-2 rounded-xl border px-2.5 py-2 transition ${
                selected
                  ? 'border-[#087e83]/20 bg-[#edf6f5]'
                  : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
              }`}
              key={item.id}
            >
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => onSelect(item.id)}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      item.active ? 'bg-[#087e83]' : 'bg-slate-300'
                    }`}
                  />

                  <p className="truncate text-sm font-semibold text-[#102d43]">
                    {item.name}
                  </p>
                </div>

                <p className="mt-1 pl-4 text-[10px] text-slate-500">
                  {item.code}
                </p>
              </button>

              <button
                type="button"
                onClick={() => onEdit(item)}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 opacity-0 transition hover:bg-white hover:text-[#087e83] group-hover:opacity-100"
              >
                <Pencil size={14} />
              </button>

              <button
                type="button"
                onClick={() => onDelete(item)}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>

              <Toggle
                checked={item.active}
                onChange={value => onToggle(item.id, value)}
                label={`Toggle ${item.name}`}
              />
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function OptionEditorCard({
  serviceItem,
  dimension,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}) {
  const Icon = dimension.icon;
  const options = serviceItem.dimensions?.[dimension.key] || [];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3.5">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#edf6f5] text-[#087e83]">
            <Icon size={18} />
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-[#102d43]">
              {dimension.label}
            </h3>

            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              {dimension.hint}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAdd(dimension)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#087e83]/20 bg-[#edf6f5] px-3 py-2 text-xs font-semibold text-[#087e83] transition hover:bg-[#e3f1f0]"
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {options.map(optionItem => (
          <div
            key={optionItem.id}
            className="group flex items-center gap-3 px-4 py-3 transition hover:bg-[#fbfcfb]"
          >
            <button
              type="button"
              onClick={() => onEdit(dimension, optionItem)}
              className="min-w-0 flex-1 text-left"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium text-[#102d43]">
                  {optionItem.label}
                </p>

                {!optionItem.active ? <Badge>Hidden</Badge> : null}
              </div>

              <p className="mt-1 text-[10px] text-slate-500">
                Value: {String(optionItem.value)}
                {' · '}
                Price:
                {' '}
                <strong className="text-[#102d43]">
                  {money(optionItem.price)}
                </strong>
              </p>
            </button>

            <button
              type="button"
              onClick={() => onEdit(dimension, optionItem)}
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#087e83]"
            >
              <Pencil size={14} />
            </button>

            <button
              type="button"
              onClick={() => onDelete(dimension, optionItem)}
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={14} />
            </button>

            <Toggle
              checked={optionItem.active}
              onChange={active =>
                onToggle(dimension.key, optionItem.id, active)
              }
              label={`Toggle ${optionItem.label}`}
            />
          </div>
        ))}
      </div>

      {!options.length ? (
        <div className="p-5">
          <EmptyPanel
            icon={Icon}
            title={`No ${dimension.label.toLowerCase()} options`}
            description="Add the values customers should be able to choose for this service."
          />
        </div>
      ) : null}
    </section>
  );
}

function dimensionByKey(dimensionKey) {
  return DIMENSIONS.find(item => item.key === dimensionKey) || null;
}

function dimensionOptions(serviceItem, dimensionKey) {
  return serviceItem?.dimensions?.[dimensionKey] || [];
}

function optionById(serviceItem, dimensionKey, optionId) {
  return (
    dimensionOptions(serviceItem, dimensionKey).find(
      item => item.id === optionId
    ) || null
  );
}

function conditionSummary(condition, serviceItem) {
  const dimension = dimensionByKey(condition.dimensionKey);

  if (!dimension) return 'Unknown property';

  if (condition.operator === 'between') {
    const minOption = optionById(
      serviceItem,
      condition.dimensionKey,
      condition.minOptionId
    );

    const maxOption = optionById(
      serviceItem,
      condition.dimensionKey,
      condition.maxOptionId
    );

    return `${dimension.label}: ${minOption?.label || 'Start'} – ${
      maxOption?.label || 'End'
    }`;
  }

  const selectedOption = optionById(
    serviceItem,
    condition.dimensionKey,
    condition.optionId
  );

  return `${dimension.label}: ${selectedOption?.label || 'Select value'}`;
}

function RuleSummary({ rule: pricingRule, serviceItem }) {
  const conditions = Array.isArray(pricingRule.conditions)
    ? pricingRule.conditions
    : [];

  if (!conditions.length) return 'No property conditions';

  return conditions
    .map(condition => conditionSummary(condition, serviceItem))
    .join(' + ');
}

function RuleEditor({
  addon,
  serviceItem,
  pricing,
  onPatchPricing,
  onDeleteRule,
}) {
  function firstOptionFor(dimensionKey) {
    return dimensionOptions(serviceItem, dimensionKey)[0] || null;
  }

  function createCondition(dimensionKey) {
    const firstOption = firstOptionFor(dimensionKey);

    return {
      id: uid('condition'),
      dimensionKey,
      operator: 'equals',
      optionId: firstOption?.id || '',
      minOptionId: '',
      maxOptionId: '',
    };
  }

  function addRule() {
    const firstDimension = DIMENSIONS.find(
      dimension => dimensionOptions(serviceItem, dimension.key).length
    );

    onPatchPricing({
      rules: [
        ...(pricing.rules || []),
        pricingRule(Number(pricing.defaultPrice || 0), [
          createCondition(firstDimension?.key || 'bedrooms'),
        ]),
      ],
    });
  }

  function patchRule(ruleId, patch) {
    onPatchPricing({
      rules: (pricing.rules || []).map(currentRule =>
        currentRule.id === ruleId
          ? {
              ...currentRule,
              ...patch,
            }
          : currentRule
      ),
    });
  }

  function addCondition(ruleId) {
    const currentRule = (pricing.rules || []).find(
      item => item.id === ruleId
    );

    if (!currentRule) return;

    const usedDimensions = new Set(
      (currentRule.conditions || []).map(
        condition => condition.dimensionKey
      )
    );

    const nextDimension = DIMENSIONS.find(
      dimension =>
        !usedDimensions.has(dimension.key) &&
        dimensionOptions(serviceItem, dimension.key).length
    );

    if (!nextDimension) return;

    patchRule(ruleId, {
      conditions: [
        ...(currentRule.conditions || []),
        createCondition(nextDimension.key),
      ],
    });
  }

  function patchCondition(ruleId, conditionId, patch) {
    const currentRule = (pricing.rules || []).find(
      item => item.id === ruleId
    );

    if (!currentRule) return;

    patchRule(ruleId, {
      conditions: (currentRule.conditions || []).map(condition =>
        condition.id === conditionId
          ? {
              ...condition,
              ...patch,
            }
          : condition
      ),
    });
  }

  function changeConditionDimension(ruleId, condition, dimensionKey) {
    const firstOption = firstOptionFor(dimensionKey);

    patchCondition(ruleId, condition.id, {
      dimensionKey,
      operator: 'equals',
      optionId: firstOption?.id || '',
      minOptionId: '',
      maxOptionId: '',
    });
  }

  function changeConditionOperator(ruleId, condition, operator) {
    const options = dimensionOptions(
      serviceItem,
      condition.dimensionKey
    );

    patchCondition(ruleId, condition.id, {
      operator,
      optionId: operator === 'equals' ? options[0]?.id || '' : '',
      minOptionId: operator === 'between' ? options[0]?.id || '' : '',
      maxOptionId:
        operator === 'between'
          ? options[options.length - 1]?.id || ''
          : '',
    });
  }

  function removeCondition(ruleId, conditionId) {
    const currentRule = (pricing.rules || []).find(
      item => item.id === ruleId
    );

    if (!currentRule || (currentRule.conditions || []).length <= 1) {
      return;
    }

    patchRule(ruleId, {
      conditions: (currentRule.conditions || []).filter(
        condition => condition.id !== conditionId
      ),
    });
  }

  return (
    <div className="border-t border-slate-200 bg-[#faf9f6] px-4 py-5 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#087e83]">
            {serviceItem.name} property pricing rules
          </p>

          <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
            Build a rule from any combination of the property fields configured
            for this service: bedrooms, bathrooms, kitchen, living/dining,
            laundry and home size. All conditions inside a rule must match.
          </p>

          <p className="mt-1 text-[10px] leading-4 text-slate-400">
            If more than one rule matches, use the rule with the most property
            conditions. If two rules are equally specific, the first matching
            rule in the list should win when this is connected to the API.
          </p>
        </div>

        <button
          type="button"
          onClick={addRule}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-[#087e83] px-3 text-xs font-semibold text-white transition hover:bg-[#066e72]"
        >
          <Plus size={13} />
          Add rule
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {(pricing.rules || []).map((currentRule, index) => {
          const conditions = Array.isArray(currentRule.conditions)
            ? currentRule.conditions
            : [];

          const usedDimensionKeys = new Set(
            conditions.map(condition => condition.dimensionKey)
          );

          const canAddCondition = DIMENSIONS.some(
            dimension =>
              !usedDimensionKeys.has(dimension.key) &&
              dimensionOptions(serviceItem, dimension.key).length
          );

          return (
            <div
              key={currentRule.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="teal">Rule {index + 1}</Badge>

                    <Badge tone="warm">
                      {conditions.length}{' '}
                      {conditions.length === 1 ? 'condition' : 'conditions'}
                    </Badge>
                  </div>

                  <p className="mt-2 break-words text-xs font-medium leading-5 text-slate-600">
                    <RuleSummary
                      rule={currentRule}
                      serviceItem={serviceItem}
                    />
                  </p>
                </div>

                <div className="flex shrink-0 items-end gap-2">
                  <div className="w-36">
                    <TextInput
                      label="Rule price (AUD)"
                      type="number"
                      min="0"
                      value={currentRule.price ?? 0}
                      onChange={value =>
                        patchRule(currentRule.id, {
                          price: cleanNumber(value),
                        })
                      }
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onDeleteRule({
                        addon,
                        serviceItem,
                        rule: currentRule,
                      })
                    }
                    className="mb-[1px] grid h-11 w-11 place-items-center rounded-xl border border-red-100 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    aria-label={`Delete rule ${index + 1}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.1em] text-slate-500">
                      Match all property conditions
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Add only the property fields needed for this price rule.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={!canAddCondition}
                    onClick={() => addCondition(currentRule.id)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#087e83]/20 bg-[#edf6f5] px-2.5 text-[11px] font-semibold text-[#087e83] transition hover:bg-[#e3f1f0] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus size={12} />
                    Add property condition
                  </button>
                </div>

                <div className="mt-3 space-y-2.5">
                  {conditions.map((condition, conditionIndex) => {
                    const dimension = dimensionByKey(
                      condition.dimensionKey
                    );

                    const options = dimensionOptions(
                      serviceItem,
                      condition.dimensionKey
                    );

                    const selectableDimensions = DIMENSIONS.filter(
                      item =>
                        item.key === condition.dimensionKey ||
                        (!usedDimensionKeys.has(item.key) &&
                          dimensionOptions(serviceItem, item.key).length)
                    );

                    const supportsRange = Boolean(dimension?.numeric);

                    return (
                      <div
                        key={condition.id}
                        className="rounded-xl border border-slate-200 bg-[#fbfcfb] p-3"
                      >
                        <div className="grid gap-3 lg:grid-cols-[40px_190px_135px_minmax(220px,1fr)_40px] lg:items-end">
                          <div className="hidden h-10 w-10 place-items-center rounded-lg bg-white text-xs font-bold text-slate-400 ring-1 ring-slate-200 lg:grid">
                            {conditionIndex + 1}
                          </div>

                          <SelectInput
                            label="Property"
                            value={condition.dimensionKey}
                            onChange={dimensionKey =>
                              changeConditionDimension(
                                currentRule.id,
                                condition,
                                dimensionKey
                              )
                            }
                            options={selectableDimensions.map(item => ({
                              value: item.key,
                              label: item.label,
                            }))}
                          />

                          <SelectInput
                            label="Match"
                            value={condition.operator || 'equals'}
                            onChange={operator =>
                              changeConditionOperator(
                                currentRule.id,
                                condition,
                                operator
                              )
                            }
                            options={[
                              {
                                value: 'equals',
                                label: 'Is exactly',
                              },
                              ...(supportsRange
                                ? [
                                    {
                                      value: 'between',
                                      label: 'Is between',
                                    },
                                  ]
                                : []),
                            ]}
                          />

                          {condition.operator === 'between' &&
                          supportsRange ? (
                            <div className="grid gap-2 sm:grid-cols-2">
                              <SelectInput
                                label="From"
                                value={condition.minOptionId || ''}
                                onChange={minOptionId =>
                                  patchCondition(
                                    currentRule.id,
                                    condition.id,
                                    { minOptionId }
                                  )
                                }
                                options={options.map(optionItem => ({
                                  value: optionItem.id,
                                  label: optionItem.label,
                                }))}
                              />

                              <SelectInput
                                label="To"
                                value={condition.maxOptionId || ''}
                                onChange={maxOptionId =>
                                  patchCondition(
                                    currentRule.id,
                                    condition.id,
                                    { maxOptionId }
                                  )
                                }
                                options={options.map(optionItem => ({
                                  value: optionItem.id,
                                  label: optionItem.label,
                                }))}
                              />
                            </div>
                          ) : (
                            <SelectInput
                              label="Property value"
                              value={condition.optionId || ''}
                              onChange={optionId =>
                                patchCondition(
                                  currentRule.id,
                                  condition.id,
                                  { optionId }
                                )
                              }
                              options={options.map(optionItem => ({
                                value: optionItem.id,
                                label: `${optionItem.label}${
                                  optionItem.active ? '' : ' (hidden)'
                                }`,
                              }))}
                            />
                          )}

                          <button
                            type="button"
                            disabled={conditions.length <= 1}
                            onClick={() =>
                              removeCondition(
                                currentRule.id,
                                condition.id
                              )
                            }
                            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-red-100 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label="Remove property condition"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!(pricing.rules || []).length ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-4">
          <p className="text-xs font-semibold text-[#102d43]">
            No property override rules
          </p>

          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            {money(pricing.defaultPrice)} will be used for {addon.name} on{' '}
            {serviceItem.name} until a property combination rule is added.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function ServicesTab({
  config,
  selectedServiceId,
  setSelectedServiceId,
  openNewService,
  openEditService,
  requestDeleteService,
  patchService,
}) {
  const selectedService = config.services.find(
    item => item.id === selectedServiceId
  );

  const enabledAddons = selectedService
    ? config.addons.filter(
        addon =>
          addon.servicePricing?.[selectedService.id]?.enabled
      ).length
    : 0;

  const pricingRules = selectedService
    ? config.addons.reduce(
        (total, addon) =>
          total +
          (
            addon.servicePricing?.[selectedService.id]?.rules?.length ||
            0
          ),
        0
      )
    : 0;

  const pricingChoices = selectedService
    ? DIMENSIONS.reduce(
        (total, dimension) =>
          total +
          (
            selectedService.dimensions?.[dimension.key] || []
          ).length,
        0
      )
    : 0;

  return (
    <div className="mt-4 grid gap-4 xl:grid-cols-[250px_minmax(0,1fr)]">
      <ServiceRail
        services={config.services}
        selectedServiceId={selectedServiceId}
        onSelect={setSelectedServiceId}
        onAdd={openNewService}
        onEdit={openEditService}
        onDelete={requestDeleteService}
        onToggle={(id, active) => patchService(id, { active })}
      />

      {selectedService ? (
        <div className="min-w-0">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    tone={selectedService.active ? 'teal' : 'default'}
                  >
                    {selectedService.active ? 'Active' : 'Inactive'}
                  </Badge>

                  <Badge>{selectedService.code}</Badge>

                  <span className="text-[10px] font-medium text-slate-400">
                    Service type only · no base price
                  </span>
                </div>

                <h2 className="mt-3 text-xl font-semibold tracking-[-.035em] text-[#102d43]">
                  {selectedService.name}
                </h2>

                <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-500">
                  Configure property prices in the next tab, then choose
                  which global add-ons are available for this service.
                </p>
              </div>

              <button
                type="button"
                onClick={() => openEditService(selectedService)}
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-[#102d43] transition hover:bg-slate-50"
              >
                <Pencil size={13} />
                Edit service
              </button>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryBox
                label="Property groups"
                value="6"
                helper="Bedrooms, bathrooms & more"
              />

              <SummaryBox
                label="Pricing choices"
                value={String(pricingChoices)}
                helper="Available property selections"
              />

              <SummaryBox
                label="Enabled add-ons"
                value={String(enabledAddons)}
                helper={`${config.addons.length} add-ons in catalogue`}
              />

              <SummaryBox
                label="Dynamic rules"
                value={String(pricingRules)}
                helper="Add-on price overrides"
              />
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#087e83]/10 bg-[#f4f9f8] px-3.5 py-3">
              <Info
                size={15}
                className="mt-0.5 shrink-0 text-[#087e83]"
              />

              <p className="text-[11px] leading-5 text-slate-600">
                Customer price is built from the six property selections
                plus the enabled add-ons. The service name itself does
                not add any price.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <EmptyPanel
          icon={Layers3}
          title="Create your first service"
          description="Start with General Cleaning, Deep Cleaning or any service Matelink offers."
          action={
            <button
              type="button"
              onClick={openNewService}
              className="rounded-xl bg-[#087e83] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Add service type
            </button>
          }
        />
      )}
    </div>
  );
}
function DimensionsTab({
  config,
  selectedService,
  selectedServiceId,
  setSelectedServiceId,
  openNewService,
  openOption,
  requestDeleteOption,
  toggleOption,
}) {
  return (
    <div className="mt-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#087e83]">
            Property pricing factors
          </p>

          <h2 className="mt-1.5 text-lg font-semibold tracking-[-.03em] text-[#102d43]">
            Configure the six booking selectors
          </h2>

          <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
            Every service owns its own values and prices. For example,
            “10 Bedrooms = $180” in General Cleaning can be completely
            different from “10 Bedrooms = $263” in Deep Cleaning.
          </p>
        </div>

        {config.services.length ? (
          <div className="w-full sm:w-64">
            <SelectInput
              label="Editing service"
              value={selectedServiceId}
              onChange={setSelectedServiceId}
              options={config.services.map(item => ({
                value: item.id,
                label: item.name,
              }))}
            />
          </div>
        ) : null}
      </div>

      {selectedService ? (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge tone="navy">{selectedService.name}</Badge>
            <Badge tone="teal">No base price</Badge>

            <span className="text-xs text-slate-500">
              Set the actual prices inside each of the six groups below.
            </span>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {DIMENSIONS.map(dimension => (
              <OptionEditorCard
                key={dimension.key}
                serviceItem={selectedService}
                dimension={dimension}
                onAdd={openOption}
                onEdit={openOption}
                onDelete={requestDeleteOption}
                onToggle={toggleOption}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-5">
          <EmptyPanel
            icon={Layers3}
            title="No service selected"
            description="Create a service before configuring property pricing."
            action={
              <button
                type="button"
                onClick={openNewService}
                className="rounded-xl bg-[#087e83] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Add service
              </button>
            }
          />
        </div>
      )}
    </div>
  );
}


function AddonCatalogueTab({
  config,
  filteredAddons,
  addonSearch,
  setAddonSearch,
  openNewAddon,
  openEditAddon,
  requestDeleteAddon,
  updateAddon,
}) {
  return (
    <div className="mt-4">
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#087e83]">
              Add-on catalogue
            </p>

            <h2 className="mt-1.5 text-lg font-semibold tracking-[-.03em] text-[#102d43]">
              Create & manage add-ons
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              This menu only manages the add-on itself. Service selection,
              prices and bedroom/bathroom rules are configured separately in
              Service Add-on Setup.
            </p>
          </div>

          <button
            type="button"
            onClick={openNewAddon}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#087e83] px-3.5 text-xs font-semibold text-white transition hover:bg-[#066e72]"
          >
            <Plus size={14} />
            Add add-on
          </button>
        </div>

        <div className="border-b border-slate-200 p-4">
          <div className="relative max-w-md">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={addonSearch}
              onChange={event => setAddonSearch(event.target.value)}
              placeholder="Search add-ons"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-[#102d43] outline-none transition focus:border-[#087e83]/40 focus:ring-4 focus:ring-[#087e83]/[.06]"
            />
          </div>
        </div>

        <div className="hidden grid-cols-[minmax(260px,1.5fr)_150px_140px_120px_120px] gap-4 border-b border-slate-200 bg-[#faf9f6] px-4 py-2.5 text-[9px] font-bold uppercase tracking-[.09em] text-slate-500 lg:grid">
          <div>Add-on</div>
          <div>Charging</div>
          <div>Used in</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredAddons.map(addon => {
            const enabledServices = config.services.filter(
              serviceItem =>
                addon.servicePricing?.[serviceItem.id]?.enabled
            ).length;

            return (
              <div
                key={addon.id}
                className="grid gap-3 px-4 py-3.5 transition hover:bg-[#fbfcfb] lg:grid-cols-[minmax(260px,1.5fr)_150px_140px_120px_120px] lg:items-center lg:gap-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-[#102d43]">
                      {addon.name}
                    </p>

                    {!addon.active ? <Badge>Inactive</Badge> : null}
                  </div>

                  <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">
                    {addon.description || 'No description'}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[.08em] text-slate-400 lg:hidden">
                    Charging
                  </p>

                  <p className="mt-1 text-xs font-medium text-[#102d43] lg:mt-0">
                    {addon.quantity
                      ? `Per ${addon.unit}`
                      : 'One-off'}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[.08em] text-slate-400 lg:hidden">
                    Used in
                  </p>

                  <p className="mt-1 text-xs font-medium text-[#102d43] lg:mt-0">
                    {enabledServices} / {config.services.length} services
                  </p>
                </div>

                <div className="flex items-center gap-2 lg:block">
                  <p className="text-[9px] font-bold uppercase tracking-[.08em] text-slate-400 lg:hidden">
                    Status
                  </p>

                  <Toggle
                    checked={addon.active}
                    onChange={active =>
                      updateAddon({
                        ...addon,
                        active,
                      })
                    }
                    label={`Toggle ${addon.name}`}
                  />
                </div>

                <div className="flex items-center gap-2 lg:justify-end">
                  <button
                    type="button"
                    onClick={() => openEditAddon(addon)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-[#102d43] transition hover:bg-slate-50"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => requestDeleteAddon(addon)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 text-red-500 transition hover:bg-red-50"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {!filteredAddons.length ? (
          <div className="p-5">
            <EmptyPanel
              icon={Sparkles}
              title="No add-ons found"
              description="Create a new add-on or try another search."
              action={
                <button
                  type="button"
                  onClick={openNewAddon}
                  className="rounded-xl bg-[#087e83] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Add add-on
                </button>
              }
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}


function ServiceAddonSetupTab({
  config,
  updateAddon,
  requestDeleteRule,
}) {
  const [search, setSearch] = useState('');
  const [expandedServices, setExpandedServices] = useState(() =>
    config.services[0]?.id ? [config.services[0].id] : []
  );
  const [expandedRuleKey, setExpandedRuleKey] = useState('');

  const filteredAddons = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return config.addons;

    return config.addons.filter(
      addon =>
        addon.name.toLowerCase().includes(term) ||
        addon.description.toLowerCase().includes(term)
    );
  }, [config.addons, search]);

  function toggleService(serviceId) {
    setExpandedServices(previous =>
      previous.includes(serviceId)
        ? previous.filter(id => id !== serviceId)
        : [...previous, serviceId]
    );
  }

  function patchServicePricing(addon, serviceId, patch) {
    const existing =
      addon.servicePricing?.[serviceId] ||
      servicePrice(false, 0, []);

    updateAddon({
      ...addon,
      servicePricing: {
        ...addon.servicePricing,
        [serviceId]: {
          ...existing,
          ...patch,
        },
      },
    });
  }

  function enabledCount(serviceId) {
    return config.addons.filter(
      addon => addon.servicePricing?.[serviceId]?.enabled
    ).length;
  }

  function rulesCount(serviceId) {
    return config.addons.reduce(
      (total, addon) =>
        total +
        (addon.servicePricing?.[serviceId]?.rules?.length || 0),
      0
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#087e83]">
              Service add-on setup
            </p>

            <h2 className="mt-1.5 text-lg font-semibold tracking-[-.03em] text-[#102d43]">
              Assign add-ons, prices & rules by service
            </h2>

            <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
              Each service contains the full add-on catalogue. Tick an add-on
              to use it for that service, enter the normal price, then add
              optional property-combination override rules.
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search add-ons in all services"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#087e83]/40 focus:ring-4 focus:ring-[#087e83]/[.06]"
            />
          </div>
        </div>
      </div>

      {config.services.map(serviceItem => {
        const expanded = expandedServices.includes(serviceItem.id);
        const enabled = enabledCount(serviceItem.id);
        const serviceRules = rulesCount(serviceItem.id);

        return (
          <section
            key={serviceItem.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <button
              type="button"
              onClick={() => toggleService(serviceItem.id)}
              className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition hover:bg-[#fbfcfb] sm:px-5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#edf6f5] text-[#087e83]">
                  <Layers3 size={16} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-[#102d43]">
                      {serviceItem.name}
                    </h3>

                    {!serviceItem.active ? <Badge>Inactive service</Badge> : null}
                  </div>

                  <p className="mt-1 text-[10px] text-slate-500">
                    {enabled} / {config.addons.length} add-ons enabled
                    {' · '}
                    {serviceRules} pricing rules
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Badge tone={enabled ? 'teal' : 'default'}>
                  {enabled} enabled
                </Badge>

                {expanded ? (
                  <ChevronDown size={16} className="text-slate-400" />
                ) : (
                  <ChevronRight size={16} className="text-slate-400" />
                )}
              </div>
            </button>

            {expanded ? (
              <div className="border-t border-slate-200">
                <div className="hidden grid-cols-[minmax(250px,1fr)_90px_170px_130px_120px] gap-4 border-b border-slate-200 bg-[#faf9f6] px-4 py-2.5 text-[9px] font-bold uppercase tracking-[.09em] text-slate-500 lg:grid sm:px-5">
                  <div>Add-on</div>
                  <div>Use</div>
                  <div>Normal price (AUD)</div>
                  <div>Rules</div>
                  <div className="text-right">Manage</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {filteredAddons.map(addon => {
                    const pricing =
                      addon.servicePricing?.[serviceItem.id] ||
                      servicePrice(false, 0, []);

                    const ruleKey = `${serviceItem.id}:${addon.id}`;
                    const rulesOpen = expandedRuleKey === ruleKey;
                    const ruleCount = (pricing.rules || []).length;

                    return (
                      <div key={addon.id}>
                        <div
                          className={`grid gap-3 px-4 py-3.5 transition sm:px-5 lg:grid-cols-[minmax(250px,1fr)_90px_170px_130px_120px] lg:items-center lg:gap-4 ${
                            pricing.enabled
                              ? 'bg-white'
                              : 'bg-slate-50/45'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p
                                className={`truncate text-sm font-semibold ${
                                  addon.active
                                    ? 'text-[#102d43]'
                                    : 'text-slate-400'
                                }`}
                              >
                                {addon.name}
                              </p>

                              {!addon.active ? (
                                <Badge>Inactive globally</Badge>
                              ) : null}
                            </div>

                            <p className="mt-1 text-[10px] text-slate-500">
                              {addon.quantity
                                ? `Quantity × price / ${addon.unit}`
                                : 'One-off price'}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <p className="text-[9px] font-bold uppercase tracking-[.08em] text-slate-400 lg:hidden">
                              Use
                            </p>

                            <CheckBox
                              checked={Boolean(pricing.enabled)}
                              onChange={enabledValue =>
                                patchServicePricing(
                                  addon,
                                  serviceItem.id,
                                  {
                                    enabled: enabledValue,
                                  }
                                )
                              }
                              label={`Use ${addon.name} for ${serviceItem.name}`}
                            />
                          </div>

                          <div>
                            <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[.08em] text-slate-400 lg:hidden">
                              Normal price
                            </p>

                            <div className="relative">
                              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                                $
                              </span>

                              <input
                                type="number"
                                min="0"
                                value={pricing.defaultPrice ?? 0}
                                disabled={!pricing.enabled}
                                onChange={event =>
                                  patchServicePricing(
                                    addon,
                                    serviceItem.id,
                                    {
                                      defaultPrice: cleanNumber(
                                        event.target.value
                                      ),
                                    }
                                  )
                                }
                                className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-7 pr-3 text-sm text-[#102d43] outline-none transition focus:border-[#087e83]/45 focus:ring-4 focus:ring-[#087e83]/[.06] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                              />
                            </div>
                          </div>

                          <div>
                            <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[.08em] text-slate-400 lg:hidden">
                              Rules
                            </p>

                            <Badge tone={ruleCount ? 'warm' : 'default'}>
                              {ruleCount} {ruleCount === 1 ? 'rule' : 'rules'}
                            </Badge>
                          </div>

                          <div className="lg:text-right">
                            <button
                              type="button"
                              disabled={!pricing.enabled}
                              onClick={() =>
                                setExpandedRuleKey(
                                  rulesOpen ? '' : ruleKey
                                )
                              }
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-[#102d43] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <SlidersHorizontal size={12} />
                              Rules
                              {rulesOpen ? (
                                <ChevronDown size={12} />
                              ) : (
                                <ChevronRight size={12} />
                              )}
                            </button>
                          </div>
                        </div>

                        {rulesOpen && pricing.enabled ? (
                          <RuleEditor
                            addon={addon}
                            serviceItem={serviceItem}
                            pricing={pricing}
                            onPatchPricing={patch =>
                              patchServicePricing(
                                addon,
                                serviceItem.id,
                                patch
                              )
                            }
                            onDeleteRule={requestDeleteRule}
                          />
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {!filteredAddons.length ? (
                  <div className="p-5">
                    <EmptyPanel
                      icon={Search}
                      title="No matching add-ons"
                      description="Try another search term."
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

export default function ServicePricingBuilderPage() {
  const [config, setConfig] = useState(loadConfig);
  const [savedAt, setSavedAt] = useState(null);
  const [tab, setTab] = useState('services');

  const [selectedServiceId, setSelectedServiceId] = useState(
    () => loadConfig().services[0]?.id || ''
  );

  const [selectedAddonId, setSelectedAddonId] = useState(
    () => loadConfig().addons[0]?.id || ''
  );

  const [addonSearch, setAddonSearch] = useState('');

  const [serviceModal, setServiceModal] = useState(null);
  const [optionModal, setOptionModal] = useState(null);
  const [addonModal, setAddonModal] = useState(null);

  const [confirmAction, setConfirmAction] = useState(null);
  const [formError, setFormError] = useState('');

  const selectedService = config.services.find(
    item => item.id === selectedServiceId
  );

  const selectedAddon = config.addons.find(
    item => item.id === selectedAddonId
  );

  useEffect(() => {
    if (
      selectedServiceId &&
      !config.services.some(item => item.id === selectedServiceId)
    ) {
      setSelectedServiceId(config.services[0]?.id || '');
    }

    if (
      selectedAddonId &&
      !config.addons.some(item => item.id === selectedAddonId)
    ) {
      setSelectedAddonId(config.addons[0]?.id || '');
    }
  }, [config, selectedServiceId, selectedAddonId]);

  function saveConfig() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setSavedAt(new Date());
  }

  function requestResetDemo() {
    setConfirmAction({
      tone: 'warning',
      title: 'Reset pricing demo?',
      description:
        'This will replace all service/property/add-on changes in this static pricing builder with the full demo dataset.',
      confirmText: 'Reset demo',
      onConfirm: () => {
        const next = deepClone(INITIAL_CONFIG);

        setConfig(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setSelectedServiceId(next.services[0]?.id || '');
        setSelectedAddonId(next.addons[0]?.id || '');
        setSavedAt(new Date());
      },
    });
  }

  function patchService(serviceId, patch) {
    setConfig(previous => ({
      ...previous,
      services: previous.services.map(item =>
        item.id === serviceId
          ? {
              ...item,
              ...patch,
            }
          : item
      ),
    }));
  }

  function openNewService() {
    setFormError('');

    setServiceModal({
      mode: 'new',
      item: {
        id: '',
        name: '',
        code: '',
        active: true,
      },
    });
  }

  function openEditService(item) {
    setFormError('');

    setServiceModal({
      mode: 'edit',
      item: {
        id: item.id,
        name: item.name,
        code: item.code,
        active: item.active,
      },
    });
  }

  function persistService() {
    if (!serviceModal) return;

    const name = serviceModal.item.name.trim();

    if (!name) {
      setFormError('Enter a service name.');
      return;
    }

    if (serviceModal.mode === 'new') {
      const normalizedId =
        serviceModal.item.id.trim() ||
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

      if (config.services.some(item => item.id === normalizedId)) {
        setFormError('A service with this ID already exists.');
        return;
      }

      const nextService = {
        id: normalizedId,
        name,
        code:
          serviceModal.item.code.trim() ||
          normalizedId.toUpperCase().replaceAll('-', '_'),
        active: serviceModal.item.active,
        dimensions: createDimensions(PRICING_PROFILES.general),
      };

      setConfig(previous => ({
        services: [...previous.services, nextService],

        addons: previous.addons.map(addon => ({
          ...addon,

          servicePricing: {
            ...addon.servicePricing,

            [nextService.id]: servicePrice(false, 0, []),
          },
        })),
      }));

      setSelectedServiceId(nextService.id);
    } else {
      patchService(serviceModal.item.id, {
        name,
        code: serviceModal.item.code.trim(),
        active: serviceModal.item.active,
      });
    }

    setServiceModal(null);
    setFormError('');
  }

  function requestDeleteService(serviceItem) {
    setConfirmAction({
      tone: 'danger',
      title: `Delete ${serviceItem.name}?`,
      description:
        'The service, all six property pricing tables for it, and all add-on prices/rules linked to this service will be removed.',
      confirmText: 'Delete service',

      onConfirm: () => {
        setConfig(previous => ({
          services: previous.services.filter(
            item => item.id !== serviceItem.id
          ),

          addons: previous.addons.map(addon => {
            const nextPricing = {
              ...addon.servicePricing,
            };

            delete nextPricing[serviceItem.id];

            return {
              ...addon,
              servicePricing: nextPricing,
            };
          }),
        }));
      },
    });
  }

  function openOption(dimension, optionItem = null) {
    setFormError('');

    setOptionModal({
      mode: optionItem ? 'edit' : 'new',
      dimension,

      option: optionItem
        ? {
            ...optionItem,
          }
        : {
            id: uid('option'),
            label: '',
            value: dimension.numeric ? 1 : '',
            price: 0,
            active: true,
          },
    });
  }

  function persistOption() {
    if (!optionModal || !selectedService) return;

    const { dimension, option: currentOption, mode } =
      optionModal;

    const nextOption = {
      ...currentOption,
      label: currentOption.label.trim(),
      value: dimension.numeric
        ? Number(currentOption.value || 0)
        : String(currentOption.value),
      price: Number(currentOption.price || 0),
    };

    if (!nextOption.label) {
      setFormError('Enter a customer-facing label.');
      return;
    }

    const currentOptions =
      selectedService.dimensions?.[dimension.key] || [];

    const nextOptions =
      mode === 'new'
        ? [...currentOptions, nextOption]
        : currentOptions.map(item =>
            item.id === nextOption.id ? nextOption : item
          );

    patchService(selectedService.id, {
      dimensions: {
        ...selectedService.dimensions,
        [dimension.key]: nextOptions,
      },
    });

    setOptionModal(null);
    setFormError('');
  }

  function requestDeleteOption(dimension, optionItem) {
    if (!selectedService) return;

    setConfirmAction({
      tone: 'danger',
      title: `Delete “${optionItem.label}”?`,
      description: `This will remove the option from ${selectedService.name} → ${dimension.label}. Other services are not affected.`,
      confirmText: 'Delete option',

      onConfirm: () => {
        patchService(selectedService.id, {
          dimensions: {
            ...selectedService.dimensions,

            [dimension.key]: (
              selectedService.dimensions?.[
                dimension.key
              ] || []
            ).filter(item => item.id !== optionItem.id),
          },
        });
      },
    });
  }

  function toggleOption(dimensionKey, optionId, active) {
    if (!selectedService) return;

    patchService(selectedService.id, {
      dimensions: {
        ...selectedService.dimensions,

        [dimensionKey]: (
          selectedService.dimensions?.[dimensionKey] || []
        ).map(item =>
          item.id === optionId
            ? {
                ...item,
                active,
              }
            : item
        ),
      },
    });
  }

  function openNewAddon() {
    setFormError('');

    setAddonModal({
      mode: 'new',

      item: {
        id: uid('addon'),
        name: '',
        description: '',
        quantity: false,
        unit: 'item',
        active: true,
      },
    });
  }

  function openEditAddon(item) {
    setFormError('');

    setAddonModal({
      mode: 'edit',

      item: {
        id: item.id,
        name: item.name,
        description: item.description,
        quantity: Boolean(item.quantity),
        unit: item.unit || 'item',
        active: item.active,
      },
    });
  }

  function persistAddon() {
    if (!addonModal) return;

    if (!addonModal.item.name.trim()) {
      setFormError('Enter an add-on name.');
      return;
    }

    if (!addonModal.item.unit.trim()) {
      setFormError('Enter a unit such as item, room, blind or job.');
      return;
    }

    if (addonModal.mode === 'new') {
      const servicePricing = Object.fromEntries(
        config.services.map(serviceItem => [
          serviceItem.id,
          servicePrice(false, 0, []),
        ])
      );

      const nextAddon = {
        ...addonModal.item,
        name: addonModal.item.name.trim(),
        description: addonModal.item.description.trim(),
        unit: addonModal.item.unit.trim(),
        servicePricing,
      };

      setConfig(previous => ({
        ...previous,
        addons: [...previous.addons, nextAddon],
      }));

      setSelectedAddonId(nextAddon.id);
    } else {
      setConfig(previous => ({
        ...previous,

        addons: previous.addons.map(item =>
          item.id === addonModal.item.id
            ? {
                ...item,
                name: addonModal.item.name.trim(),
                description:
                  addonModal.item.description.trim(),
                quantity: addonModal.item.quantity,
                unit: addonModal.item.unit.trim(),
                active: addonModal.item.active,
              }
            : item
        ),
      }));
    }

    setAddonModal(null);
    setFormError('');
  }

  function updateAddon(nextAddon) {
    setConfig(previous => ({
      ...previous,

      addons: previous.addons.map(item =>
        item.id === nextAddon.id ? nextAddon : item
      ),
    }));
  }

  function requestDeleteAddon(addon) {
    setConfirmAction({
      tone: 'danger',
      title: `Delete ${addon.name}?`,
      description:
        'The add-on will be removed from the global catalogue, including its prices and rules for every service type.',
      confirmText: 'Delete add-on',

      onConfirm: () => {
        setConfig(previous => ({
          ...previous,

          addons: previous.addons.filter(
            item => item.id !== addon.id
          ),
        }));
      },
    });
  }

  function requestDeleteRule({
    addon,
    serviceItem,
    rule: pricingRule,
  }) {
    setConfirmAction({
      tone: 'danger',
      title: 'Delete this pricing rule?',
      description: `${addon.name} → ${serviceItem.name} → ${RuleSummary({
        rule: pricingRule,
        serviceItem,
      })}. The normal add-on price will be used if no other rule matches.`,
      confirmText: 'Delete rule',

      onConfirm: () => {
        const pricing =
          addon.servicePricing?.[serviceItem.id] ||
          servicePrice(false, 0, []);

        updateAddon({
          ...addon,

          servicePricing: {
            ...addon.servicePricing,

            [serviceItem.id]: {
              ...pricing,

              rules: (pricing.rules || []).filter(
                item => item.id !== pricingRule.id
              ),
            },
          },
        });
      },
    });
  }

  const filteredAddons = useMemo(() => {
    const term = addonSearch.trim().toLowerCase();

    if (!term) return config.addons;

    return config.addons.filter(
      item =>
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term)
    );
  }, [config.addons, addonSearch]);

  const tabs = [
    {
      id: 'services',
      label: '1. Service Types',
      icon: Layers3,
    },
    {
      id: 'dimensions',
      label: '2. Property Pricing',
      icon: SlidersHorizontal,
    },
    {
      id: 'addons',
      label: '3. Add-on Catalogue',
      icon: Sparkles,
    },
    {
      id: 'addon-setup',
      label: '4. Service Add-on Setup',
      icon: SlidersHorizontal,
    },
  ];

  return (
    <div className="pb-10">
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_5px_24px_rgba(16,45,67,.035)] sm:px-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#087e83]">
                Services & pricing
              </p>

              <span className="h-1 w-1 rounded-full bg-slate-300" />

              <span className="text-[10px] text-slate-400">
                Static frontend demo
              </span>
            </div>

            <h1 className="mt-1.5 text-2xl font-semibold tracking-[-.045em] text-[#102d43]">
              Configure cleaning services
            </h1>

            <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
              Manage service types, property prices and service-specific
              add-on rules from one compact workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-[#faf9f6] px-3 py-2 lg:flex">
              <span className="text-[10px] font-medium text-slate-500">
                {config.services.length} services
              </span>

              <span className="h-3 w-px bg-slate-200" />

              <span className="text-[10px] font-medium text-slate-500">
                {config.addons.length} add-ons
              </span>

              {savedAt ? (
                <>
                  <span className="h-3 w-px bg-slate-200" />

                  <span className="text-[10px] font-semibold text-[#087e83]">
                    Saved
                  </span>
                </>
              ) : null}
            </div>

            <button
              type="button"
              onClick={requestResetDemo}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <RotateCcw size={13} />
              Reset
            </button>

            <button
              type="button"
              onClick={saveConfig}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#087e83] px-3.5 text-xs font-semibold text-white transition hover:bg-[#066e72]"
            >
              <Save size={13} />
              Save changes
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <div className="inline-flex min-w-full gap-1 rounded-xl border border-slate-200 bg-white p-1 sm:min-w-0">
          {tabs.map(item => {
            const Icon = item.icon;
            const active = tab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`inline-flex min-w-max flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-[#102d43] text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-[#102d43]'
                }`}
              >
                <Icon size={14} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === 'services' ? (
        <ServicesTab
          config={config}
          selectedServiceId={selectedServiceId}
          setSelectedServiceId={setSelectedServiceId}
          openNewService={openNewService}
          openEditService={openEditService}
          requestDeleteService={requestDeleteService}
          patchService={patchService}
        />
      ) : null}

      {tab === 'dimensions' ? (
        <DimensionsTab
          config={config}
          selectedService={selectedService}
          selectedServiceId={selectedServiceId}
          setSelectedServiceId={setSelectedServiceId}
          openNewService={openNewService}
          openOption={openOption}
          requestDeleteOption={requestDeleteOption}
          toggleOption={toggleOption}
        />
      ) : null}

      {tab === 'addons' ? (
        <AddonCatalogueTab
          config={config}
          filteredAddons={filteredAddons}
          addonSearch={addonSearch}
          setAddonSearch={setAddonSearch}
          openNewAddon={openNewAddon}
          openEditAddon={openEditAddon}
          requestDeleteAddon={requestDeleteAddon}
          updateAddon={updateAddon}
        />
      ) : null}

      {tab === 'addon-setup' ? (
        <ServiceAddonSetupTab
          config={config}
          updateAddon={updateAddon}
          requestDeleteRule={requestDeleteRule}
        />
      ) : null}

      <Modal
        open={Boolean(serviceModal)}
        title={
          serviceModal?.mode === 'new'
            ? 'Add service type'
            : 'Edit service type'
        }
        description="Service types are categories only. Prices belong to property options and add-ons."
        onClose={() => {
          setServiceModal(null);
          setFormError('');
        }}
      >
        {serviceModal ? (
          <div className="space-y-4">
            <TextInput
              label="Service name"
              value={serviceModal.item.name}
              onChange={name =>
                setServiceModal(previous => ({
                  ...previous,
                  item: {
                    ...previous.item,
                    name,
                  },
                }))
              }
              placeholder="e.g. General Cleaning"
            />

            {serviceModal.mode === 'new' ? (
              <TextInput
                label="Service ID / slug"
                value={serviceModal.item.id}
                onChange={id =>
                  setServiceModal(previous => ({
                    ...previous,
                    item: {
                      ...previous.item,
                      id,
                    },
                  }))
                }
                placeholder="general-cleaning"
                helper="Leave blank to generate it automatically from the name."
              />
            ) : null}

            <TextInput
              label="Internal code"
              value={serviceModal.item.code}
              onChange={code =>
                setServiceModal(previous => ({
                  ...previous,
                  item: {
                    ...previous.item,
                    code,
                  },
                }))
              }
              placeholder="GENERAL_CLEANING"
            />

            <div className="rounded-xl border border-[#087e83]/10 bg-[#edf6f5] p-4">
              <div className="flex gap-3">
                <CircleDollarSign
                  size={18}
                  className="mt-0.5 shrink-0 text-[#087e83]"
                />

                <div>
                  <p className="text-sm font-semibold text-[#102d43]">
                    No service price
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    This service type has no base price field. Configure
                    Bedroom, Bathroom, Kitchen, Living/Dining, Laundry
                    and Home Size prices after saving.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <div>
                <p className="text-sm font-semibold text-[#102d43]">
                  Service active
                </p>

                <p className="mt-1 text-[11px] text-slate-500">
                  Inactive services stay configured but can be hidden
                  from customers.
                </p>
              </div>

              <Toggle
                checked={serviceModal.item.active}
                onChange={active =>
                  setServiceModal(previous => ({
                    ...previous,
                    item: {
                      ...previous.item,
                      active,
                    },
                  }))
                }
                label="Toggle service"
              />
            </div>

            {formError ? (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                {formError}
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => {
                  setServiceModal(null);
                  setFormError('');
                }}
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={persistService}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#087e83] px-4 text-sm font-semibold text-white"
              >
                <Save size={14} />
                Save service
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(optionModal)}
        title={`${optionModal?.mode === 'new' ? 'Add' : 'Edit'} ${
          optionModal?.dimension?.label || 'option'
        }`}
        description="This price belongs only to the currently selected cleaning service."
        onClose={() => {
          setOptionModal(null);
          setFormError('');
        }}
      >
        {optionModal ? (
          <div className="space-y-4">
            <TextInput
              label="Customer-facing label"
              value={optionModal.option.label}
              onChange={label =>
                setOptionModal(previous => ({
                  ...previous,
                  option: {
                    ...previous.option,
                    label,
                  },
                }))
              }
              placeholder={
                optionModal.dimension.numeric
                  ? 'e.g. 10 Bedrooms'
                  : 'e.g. Large House'
              }
            />

            <TextInput
              label={
                optionModal.dimension.numeric
                  ? 'Numeric value'
                  : 'Internal value'
              }
              type={
                optionModal.dimension.numeric ? 'number' : 'text'
              }
              min={
                optionModal.dimension.numeric ? '0' : undefined
              }
              value={optionModal.option.value}
              onChange={value =>
                setOptionModal(previous => ({
                  ...previous,
                  option: {
                    ...previous.option,
                    value,
                  },
                }))
              }
              helper={
                optionModal.dimension.numeric
                  ? 'Bedroom and bathroom values are also used by add-on rules.'
                  : 'Use a stable internal value such as apartment or large-house.'
              }
            />

            <TextInput
              label="Price for this selection (AUD)"
              type="number"
              min="0"
              value={optionModal.option.price}
              onChange={price =>
                setOptionModal(previous => ({
                  ...previous,
                  option: {
                    ...previous.option,
                    price: cleanNumber(price),
                  },
                }))
              }
            />

            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-[#102d43]">
                Option available
              </p>

              <Toggle
                checked={optionModal.option.active}
                onChange={active =>
                  setOptionModal(previous => ({
                    ...previous,
                    option: {
                      ...previous.option,
                      active,
                    },
                  }))
                }
                label="Toggle option"
              />
            </div>

            {formError ? (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                {formError}
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => {
                  setOptionModal(null);
                  setFormError('');
                }}
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={persistOption}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#087e83] px-4 text-sm font-semibold text-white"
              >
                <Save size={14} />
                Save option
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(addonModal)}
        title={
          addonModal?.mode === 'new'
            ? 'Create global add-on'
            : 'Edit global add-on'
        }
        description="The add-on is created once. After saving, every service appears so you can choose availability, price and rules separately."
        onClose={() => {
          setAddonModal(null);
          setFormError('');
        }}
      >
        {addonModal ? (
          <div className="space-y-4">
            <TextInput
              label="Add-on name"
              value={addonModal.item.name}
              onChange={name =>
                setAddonModal(previous => ({
                  ...previous,
                  item: {
                    ...previous.item,
                    name,
                  },
                }))
              }
              placeholder="e.g. Inside Oven Cleaning"
            />

            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-[#102d43]">
                Description
              </span>

              <textarea
                rows={4}
                value={addonModal.item.description}
                onChange={event =>
                  setAddonModal(previous => ({
                    ...previous,
                    item: {
                      ...previous.item,
                      description: event.target.value,
                    },
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-[#102d43] outline-none transition focus:border-[#087e83]/50 focus:ring-4 focus:ring-[#087e83]/[.08]"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="text-sm font-semibold text-[#102d43]">
                    Quantity based
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Example: per room, window or blind.
                  </p>
                </div>

                <Toggle
                  checked={addonModal.item.quantity}
                  onChange={quantity =>
                    setAddonModal(previous => ({
                      ...previous,
                      item: {
                        ...previous.item,
                        quantity,
                      },
                    }))
                  }
                  label="Toggle quantity"
                />
              </div>

              <TextInput
                label="Unit"
                value={addonModal.item.unit}
                onChange={unit =>
                  setAddonModal(previous => ({
                    ...previous,
                    item: {
                      ...previous.item,
                      unit,
                    },
                  }))
                }
                placeholder="room / window / job"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <div>
                <p className="text-sm font-semibold text-[#102d43]">
                  Add-on active
                </p>

                <p className="mt-1 text-[10px] text-slate-500">
                  Global status. Service selection is configured after
                  saving.
                </p>
              </div>

              <Toggle
                checked={addonModal.item.active}
                onChange={active =>
                  setAddonModal(previous => ({
                    ...previous,
                    item: {
                      ...previous.item,
                      active,
                    },
                  }))
                }
                label="Toggle add-on"
              />
            </div>

            {formError ? (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                {formError}
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => {
                  setAddonModal(null);
                  setFormError('');
                }}
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={persistAddon}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#087e83] px-4 text-sm font-semibold text-white"
              >
                <Save size={14} />
                Save add-on
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmModal
        open={Boolean(confirmAction)}
        title={confirmAction?.title || ''}
        description={confirmAction?.description || ''}
        confirmText={confirmAction?.confirmText || 'Confirm'}
        tone={confirmAction?.tone || 'danger'}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          const action = confirmAction?.onConfirm;
          setConfirmAction(null);
          action?.();
        }}
      />
    </div>
  );
}
