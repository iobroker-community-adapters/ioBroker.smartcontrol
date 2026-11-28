'use strict';

const assert = require('assert');
const { MIDNIGHT_RESCHEDULE_DELAY_MS, cronFiresAtMidnight } = require('../lib/midnight-reschedule');

assert.ok(MIDNIGHT_RESCHEDULE_DELAY_MS >= 1000, 'Delay muss die 00:00-Jobs durchlassen');
assert.strictEqual(cronFiresAtMidnight('0 0 * * *'), true);
assert.strictEqual(cronFiresAtMidnight('0 0 * * 1-5'), true);
assert.strictEqual(cronFiresAtMidnight('1 0 * * 1-5'), false);
assert.strictEqual(cronFiresAtMidnight('0 1 * * *'), false);
assert.strictEqual(cronFiresAtMidnight('0 0 0 * * *'), true);
assert.strictEqual(cronFiresAtMidnight('sunset'), false);
assert.strictEqual(cronFiresAtMidnight(''), false);

console.log('testMidnightReschedule: ok');
