'use strict';

const { expect } = require('chai');
const { parseBooleanStateVal } = require('../lib/boolean-value');

describe('parseBooleanStateVal (#170)', () => {
    it('nimmt true/false, 1/0, on/off', () => {
        expect(parseBooleanStateVal('true').value).to.equal(true);
        expect(parseBooleanStateVal('FALSE').value).to.equal(false);
        expect(parseBooleanStateVal('1').value).to.equal(true);
        expect(parseBooleanStateVal('0').value).to.equal(false);
        expect(parseBooleanStateVal('on').value).to.equal(true);
        expect(parseBooleanStateVal('off').value).to.equal(false);
        expect(parseBooleanStateVal(true).value).to.equal(true);
    });

    it('leeres Feld bleibt ungültig (Vergleichswert ist Pflicht)', () => {
        expect(parseBooleanStateVal('').ok).to.equal(false);
        expect(parseBooleanStateVal('   ').ok).to.equal(false);
        expect(parseBooleanStateVal(null).ok).to.equal(false);
    });

    it('lehnt Unsinn ab', () => {
        expect(parseBooleanStateVal('maybe').ok).to.equal(false);
    });
});
