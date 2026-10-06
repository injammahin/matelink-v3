import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePrice,
  availableAddons,
  postcodeAvailability,
  amountLabel,
} from '../src/modules/booking/lib/pricing.js';
import { initialSettings } from '../src/shared/data/content.js';
import { validateContact } from '../src/shared/lib/validation.js';

const home = {
  service: 'move-in',
  bedrooms: 2,
  bathrooms: 1,
  addons: {},
};

test('demo room rates produce the current live estimate', () => {
  const result = calculatePrice(home, initialSettings);
  assert.equal(result.ready, true);
  assert.equal(result.total, 100);
  assert.equal(amountLabel(result.total), '$100.00');
});

test('general cleaning has demo rates and starts at zero', () => {
  const result = calculatePrice(
    { service: 'general', bedrooms: 0, bathrooms: 0, addons: {} },
    initialSettings,
  );
  assert.equal(result.ready, true);
  assert.equal(result.total, 0);
});

test('every selected add-on is quantity based', () => {
  const result = calculatePrice(
    { ...home, addons: { carpet: 2, garage: 3 } },
    initialSettings,
  );
  // 2 beds=60, 1 bath=40, carpet 2x35=70, garage 3x30=90
  assert.equal(result.total, 260);
});

test('deep cleaning can access active add-ons', () => {
  const addons = availableAddons(initialSettings, 'deep');
  assert.ok(addons.length > 0);
  assert.ok(addons.some((addon) => addon.id === 'carpet'));
});

test('postcode coverage is never assumed when the list is missing', () => {
  assert.equal(postcodeAvailability('2000', initialSettings), 'review');
  assert.equal(postcodeAvailability('200', initialSettings), 'invalid');
  const settings = { ...initialSettings, postcodes: ['2000'] };
  assert.equal(postcodeAvailability('2000', settings), 'available');
  assert.equal(postcodeAvailability('9999', settings), 'unavailable');
});

test('contact validation requires usable customer details', () => {
  assert.deepEqual(
    validateContact({
      name: 'Example Customer',
      email: 'customer@example.com',
      mobile: '0400 000 000',
    }),
    {},
  );
  const errors = validateContact({ name: '', email: 'invalid', mobile: '12' });
  assert.ok(errors.name && errors.email && errors.mobile);
});
