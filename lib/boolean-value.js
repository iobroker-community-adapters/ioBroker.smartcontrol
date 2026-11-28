'use strict';

/**
 * Liest true/false aus der Konfiguration (Auslöser, Zielgeräte, Bedingungen).
 *
 * Warum: Nutzer lassen DP-Wert oft leer, weil der Datenpunkt schon boolean ist.
 * Die alte Prüfung hat dann "expecting boolean, but you set ''" gemeldet (#170).
 * Leeres Feld: bei offValue → false, sonst → true.
 *
 * @param {unknown} val
 * @param {{emptyMeans?: boolean}} [options]
 * @return {{ok: boolean, value?: boolean, defaulted?: boolean}}
 */
function parseBooleanStateVal(val, options) {
    const emptyMeans = options && Object.prototype.hasOwnProperty.call(options, 'emptyMeans')
        ? options.emptyMeans
        : undefined;

    if (typeof val === 'boolean') {
        return { ok: true, value: val };
    }

    const s = (val == null) ? '' : String(val).trim().toLowerCase();
    if (s === '') {
        if (typeof emptyMeans === 'boolean') {
            return { ok: true, value: emptyMeans, defaulted: true };
        }
        return { ok: false };
    }
    if (s === 'true' || s === '1' || s === 'on') {
        return { ok: true, value: true };
    }
    if (s === 'false' || s === '0' || s === 'off') {
        return { ok: true, value: false };
    }
    return { ok: false };
}

module.exports = {
    parseBooleanStateVal,
};
