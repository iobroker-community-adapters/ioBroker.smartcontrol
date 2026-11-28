'use strict';

const { expect } = require('chai');
const { parseNumComparator, isNumComparatorMatching } = require('../lib/num-comparator');

describe('parseNumComparator (#164)', () => {
    it('akzeptiert Minus, Komma, Punkt und Leerzeichen', () => {
        expect(parseNumComparator('< -200').isComparator).to.equal(true);
        expect(parseNumComparator('<-200').compNum).to.equal(-200);
        expect(parseNumComparator('>-200').compNum).to.equal(-200);
        expect(parseNumComparator('>26,5').compNum).to.equal(26.5);
        expect(parseNumComparator('<25.5').compNum).to.equal(25.5);
        expect(parseNumComparator('<= 25').compNum).to.equal(25);
        expect(parseNumComparator('<>30').operand).to.equal('<>');
    });

    it('lehnt Unsinn ab', () => {
        expect(parseNumComparator('abc').isComparator).to.equal(false);
        expect(parseNumComparator('true').isComparator).to.equal(false);
        expect(parseNumComparator(null).isComparator).to.equal(false);
    });
});

describe('isNumComparatorMatching (#164)', () => {
    it('vergleicht negative und Komma-Werte', () => {
        expect(isNumComparatorMatching(-250, '< -200').result).to.equal(true);
        expect(isNumComparatorMatching(-100, '<-200').result).to.equal(false);
        expect(isNumComparatorMatching(-50, '>-200').result).to.equal(true);
        expect(isNumComparatorMatching(30, '>26,5').result).to.equal(true);
        expect(isNumComparatorMatching(20, '<25.5').result).to.equal(true);
        expect(isNumComparatorMatching(30, '<>30').result).to.equal(false);
        expect(isNumComparatorMatching(29, '<>30').result).to.equal(true);
    });
});
