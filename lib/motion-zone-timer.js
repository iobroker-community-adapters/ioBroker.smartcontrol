'use strict';

/**
 * Aus-Timer nach Bewegung gelten pro Zone, nicht pro Melder.
 *
 * Warum: Zwei BWM im selben Raum dürfen nicht zwei parallele Timer starten.
 * Sonst schaltet der zuerst abgelaufene Timer das Licht aus, obwohl der
 * andere Melder erst später auf "keine Bewegung" gegangen ist (Issue #147).
 */

/**
 * Andere aktive Bewegungsmelder derselben Zone (ohne den aktuellen Melder).
 *
 * @param {Array<{active?: boolean, name?: string}>} tableTriggerMotion - Tabelle Bewegungsmelder
 * @param {string[]|undefined|null} zoneTriggerNames - Auslöser-Namen der Zone
 * @param {string} currentTriggerName - Melder, der gerade auslöst
 * @returns {string[]}
 */
function getOtherMotionTriggerNames(tableTriggerMotion, zoneTriggerNames, currentTriggerName) {
    const motionNames = [];
    if (Array.isArray(tableTriggerMotion)) {
        for (const row of tableTriggerMotion) {
            // Nur aktive Melder: deaktivierte Zeilen zählen nicht zur Zone
            if (row && row.active && row.name) {
                motionNames.push(row.name);
            }
        }
    }
    const others = [];
    if (!Array.isArray(zoneTriggerNames)) {
        return others;
    }
    for (const name of zoneTriggerNames) {
        if (motionNames.includes(name) && name !== currentTriggerName) {
            others.push(name);
        }
    }
    return others;
}

/**
 * skip  = anderer Melder der Zone ist noch true → keinen Aus-Timer starten
 * restart = Zone ist frei von Bewegung → bestehenden Timer ersetzen (nicht parallel)
 *
 * @param {boolean} otherMotionStillTrue
 * @returns {'skip'|'restart'}
 */
function zoneMotionOffTimerAction(otherMotionStillTrue) {
    return otherMotionStillTrue ? 'skip' : 'restart';
}

module.exports = {
    getOtherMotionTriggerNames,
    zoneMotionOffTimerAction,
};
