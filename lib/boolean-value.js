'use strict';

/**
 * Liest true/false aus der Konfigurations-Spalte (Vergleichswert).
 *
 * Warum: Nur exakt 'true'/'false' wurde akzeptiert. TRUE/1/on usw. und
 * eine klarere Fehlermeldung, wenn die Spalte leer ist (#170).
 * Ein leeres Feld bleibt ungültig – der Vergleichswert muss gesetzt sein.
 *
 * @param {unknown} val
 * @return {{ok: boolean, value?: boolean}}
 */
function parseBooleanStateVal(val) {
    if (typeof val === 'boolean') {
        return { ok: true, value: val };
    }

    const s = (val == null) ? '' : String(val).trim().toLowerCase();
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
