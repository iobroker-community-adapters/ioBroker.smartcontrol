'use strict';

const { expect } = require('chai');
const { isCronScheduleValid } = require('../lib/cron-schedule');

describe('isCronScheduleValid (#281)', () => {
    it('akzeptiert 5-Felder-Cron mit Uhrzeit und Wochentagen', () => {
        expect(isCronScheduleValid('0 15 * * 1-5')).to.equal(true);
        expect(isCronScheduleValid('0 22 * * 1-5')).to.equal(true);
        expect(isCronScheduleValid('42 * * * *')).to.equal(true);
        expect(isCronScheduleValid('5 4 * * sun')).to.equal(true);
        expect(isCronScheduleValid('0 0 * * 1-5')).to.equal(true);
    });

    it('lehnt Unsinn ab', () => {
        expect(isCronScheduleValid('')).to.equal(false);
        expect(isCronScheduleValid('not a cron')).to.equal(false);
        expect(isCronScheduleValid(null)).to.equal(false);
        expect(isCronScheduleValid('25:00')).to.equal(false);
    });
});
