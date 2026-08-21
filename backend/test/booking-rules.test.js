const test = require('node:test');
const assert = require('node:assert/strict');
const {
  hasTimeOverlap,
  isWithinOperatingHours
} = require('../utils/booking-rules');

test('rejects overlapping resource bookings', () => {
  assert.equal(hasTimeOverlap('19:00:00', '20:00:00', '19:30:00', '21:00:00'), true);
  assert.equal(hasTimeOverlap('21:00:00', '22:00:00', '19:00:00', '21:00:00'), false);
});

test('allows bookings only inside configured operating hours', () => {
  assert.equal(isWithinOperatingHours('19:00:00', '20:00:00', '18:00:00', '23:00:00'), true);
  assert.equal(isWithinOperatingHours('17:00:00', '20:00:00', '18:00:00', '23:00:00'), false);
  assert.equal(isWithinOperatingHours('19:00:00', '23:30:00', '18:00:00', '23:00:00'), false);
  assert.equal(isWithinOperatingHours('20:00:00', '19:00:00', null, null), false);
});
