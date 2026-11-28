'use strict';

/**
 * Prüft, ob ein Cron-Ausdruck gültig ist (5 Felder wie "0 15 * * 1-5" oder 6 mit Sekunden).
 *
 * Warum eigene Datei:
 * Früher wurde `cron-parser` nur als Abhängigkeit von `node-schedule` geladen.
 * Auf ioBroker kann Node dann eine andere Version finden (ab v5 gibt es kein
 * `parseExpression` mehr). Gültige Crons wurden abgelehnt, Speichern ging nicht (#281).
 *
 * @param {unknown} str  z. B. '0 15 * * 1-5' oder '5 4 * * sun'
 * @return {boolean}
 */
function isCronScheduleValid(str) {
    // Nur echte Strings prüfen – sonst würde .trim() den Adapter crashen.
    if (typeof str !== 'string') {
        return false;
    }
    const expr = str.trim();
    if (!expr) {
        return false;
    }

    try {
        const cronParser = require('cron-parser');
        parseWithCronParser(cronParser, expr);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * v4 und v5 von cron-parser haben unterschiedliche Einstiege – beide abdecken.
 * @param {object} cronParser
 * @param {string} expr
 */
function parseWithCronParser(cronParser, expr) {
    // v4 (von node-schedule genutzt)
    if (typeof cronParser.parseExpression === 'function') {
        cronParser.parseExpression(expr);
        return;
    }
    // v5: TypeScript-Rewrite
    if (cronParser.CronExpressionParser && typeof cronParser.CronExpressionParser.parse === 'function') {
        cronParser.CronExpressionParser.parse(expr);
        return;
    }
    if (typeof cronParser.parse === 'function') {
        cronParser.parse(expr);
        return;
    }
    throw new Error('cron-parser API not found');
}

module.exports = {
    isCronScheduleValid,
};
