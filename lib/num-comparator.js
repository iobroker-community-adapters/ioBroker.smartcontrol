'use strict';

/**
 * Vergleichsausdrücke für Zahlen in Auslösern und Bedingungen.
 *
 * Warum: Das alte Regex `>=|<=|>|<` + nur Ziffern hat Minus und Komma nicht erkannt.
 * Damit gingen z. B. `<-200` und `>26,5` beim Speichern durch (#164).
 *
 * Reihenfolge der Operatoren: `<>` vor `<`, sonst würde `<>30` als `<` gelesen.
 */
const COMPARATOR_RE = /^(>=|<=|<>|!=|>|<)\s*(-?\d+(?:[.,]\d+)?)\s*$/;

/**
 * @param {unknown} compStr  z. B. '< -200', '>-200', '>26,5', '<= 25'
 * @return {{isComparator: boolean, operand?: string, compNum?: number}}
 */
function parseNumComparator(compStr) {
    if (typeof compStr !== 'string') {
        return { isComparator: false };
    }
    const match = compStr.trim().match(COMPARATOR_RE);
    if (!match) {
        return { isComparator: false };
    }
    // Deutsches Komma 26,5 → 26.5, sonst parseFloat stoppt vor dem Komma
    const compNum = parseFloat(match[2].replace(',', '.'));
    if (Number.isNaN(compNum)) {
        return { isComparator: false };
    }
    return { isComparator: true, operand: match[1], compNum };
}

/**
 * @param {unknown} numToCheck  aktueller Datenpunkt-Wert
 * @param {unknown} compStr     Ausdruck aus der Konfiguration
 * @return {{isComparator: boolean, result: boolean}}
 */
function isNumComparatorMatching(numToCheck, compStr) {
    const parsed = parseNumComparator(compStr);
    if (!parsed.isComparator) {
        return { isComparator: false, result: false };
    }
    if (!(typeof numToCheck === 'string' || typeof numToCheck === 'number')) {
        return { isComparator: true, result: false };
    }
    const n = Number(String(numToCheck).trim().replace(',', '.'));
    if (Number.isNaN(n)) {
        return { isComparator: true, result: false };
    }
    const operand = parsed.operand;
    const compNum = parsed.compNum;
    let result = false;
    if (operand === '>=') {
        result = n >= compNum;
    } else if (operand === '<=') {
        result = n <= compNum;
    } else if (operand === '>') {
        result = n > compNum;
    } else if (operand === '<') {
        result = n < compNum;
    } else if (operand === '!=' || operand === '<>') {
        result = n !== compNum;
    }
    return { isComparator: true, result };
}

module.exports = {
    parseNumComparator,
    isNumComparatorMatching,
};
