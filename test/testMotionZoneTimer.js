'use strict';

const assert = require('assert');
const { getOtherMotionTriggerNames, zoneMotionOffTimerAction } = require('../lib/motion-zone-timer');

const table = [
    { active: true, name: 'Praesenzmelder-Bad' },
    { active: true, name: 'Bewegungsmelder-Bad' },
    { active: false, name: 'BWM-aus' },
    { active: true, name: 'BWM-Flur' },
];

assert.deepStrictEqual(
    getOtherMotionTriggerNames(table, ['Praesenzmelder-Bad', 'Bewegungsmelder-Bad', 'Lichtschalter'], 'Praesenzmelder-Bad'),
    ['Bewegungsmelder-Bad'],
    'nur der andere aktive BWM der Zone'
);

assert.deepStrictEqual(
    getOtherMotionTriggerNames(table, ['Praesenzmelder-Bad', 'BWM-aus'], 'Praesenzmelder-Bad'),
    [],
    'deaktivierter BWM zaehlt nicht'
);

assert.deepStrictEqual(
    getOtherMotionTriggerNames(table, ['Praesenzmelder-Bad'], 'Praesenzmelder-Bad'),
    [],
    'allein in der Zone: keine anderen'
);

assert.deepStrictEqual(getOtherMotionTriggerNames(table, undefined, 'Praesenzmelder-Bad'), []);
assert.deepStrictEqual(getOtherMotionTriggerNames(undefined, ['Praesenzmelder-Bad'], 'Praesenzmelder-Bad'), []);

assert.strictEqual(zoneMotionOffTimerAction(true), 'skip');
assert.strictEqual(zoneMotionOffTimerAction(false), 'restart');

console.log('testMotionZoneTimer: ok');
