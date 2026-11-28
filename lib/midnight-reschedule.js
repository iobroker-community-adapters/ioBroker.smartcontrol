'use strict';

/**
 * Der interne Midnight-Job und Nutzer-Cron `0 0 * * *` feuern in derselben Sekunde.
 * Sofortiges cancel()+scheduleJob() überspringt den heutigen 00:00-Lauf (#8).
 * Darum erst die 00:00-Auslöser durchlaufen lassen, dann neu planen.
 */
const MIDNIGHT_RESCHEDULE_DELAY_MS = 2000;

/**
 * @param {string} cron - 5-Felder (min hour …) oder 6-Felder (sec min hour …)
 * @returns {boolean} true, wenn die Regel um 00:00 Uhr auslöst
 */
function cronFiresAtMidnight(cron) {
    if (typeof cron !== 'string') {
        return false;
    }
    const parts = cron.trim().split(/\s+/);
    if (parts.length === 5) {
        return parts[0] === '0' && parts[1] === '0';
    }
    if (parts.length === 6) {
        return parts[1] === '0' && parts[2] === '0';
    }
    return false;
}

module.exports = {
    MIDNIGHT_RESCHEDULE_DELAY_MS,
    cronFiresAtMidnight,
};
