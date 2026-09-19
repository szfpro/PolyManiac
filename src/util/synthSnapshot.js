import presetData from 'src/util/presetData';
import { THEMES } from 'src/styles/themes';
import { storageSet } from 'src/util/safeStorage';

export const DATA_TREE_SCHEMA = 1;

/** Persisted knob / preset fields (not meters or play state). */
export const SYNTH_SNAPSHOT_KEYS = [
    'currentPreset',
    'octaveMod',
    'theme',
    'polyphony',
    'portamentoSpeed',
    'masterVolume',
    'masterFilterType',
    'masterFilterFreq',
    'masterFilterQ',
    'masterFilterGain',
    'vcoType',
    'gainAttack',
    'gainDecay',
    'gainSustain',
    'gainRelease',
    'filterType',
    'filterFreq',
    'filterQ',
    'filterGain',
    'filterAttack',
    'filterDecay',
    'filterRelease',
    'filterEnvAmount',
    'distortionAmount',
    'distortionDist',
    'reverbType',
    'reverbAmount',
    'flangerAmount',
    'flangerDepth',
    'flangerRate',
    'flangerFeedback',
    'flangerDelay',
    'delayTime',
    'delayFeedback',
    'delayTone',
    'delayAmount',
    'pingPongDelayTime',
    'pingPongFeedback',
    'pingPongTone',
    'pingPongAmount',
    'vibratoDepth',
    'vibratoRate',
    'bitCrushDepth',
    'bitCrushAmount',
    'eqLowGain',
    'eqHighGain',
    'eqLowFreq',
    'eqHighFreq',
];

export function getDefaultSynthParams() {
    return {
        currentPreset: '- INIT -',
        octaveMod: 4,
        theme: 'Dark',
        ...presetData['- INIT -'],
    };
}

export function pickSynthSnapshot(state) {
    const params = {};
    SYNTH_SNAPSHOT_KEYS.forEach((key) => {
        if (state[key] !== undefined) {
            params[key] = state[key];
        }
    });
    return { schema: DATA_TREE_SCHEMA, params };
}

/**
 * @param {object} params
 * @param {Record<string, function>} setters keyed like SYNTH_SNAPSHOT_KEYS (setTheme for theme)
 * @param {{ current: boolean }} skipPresetLoadRef
 */
export function applySynthSnapshot(params, setters, skipPresetLoadRef) {
    if (!params || typeof params !== 'object') return;

    skipPresetLoadRef.current = true;

    const safe = { ...params };
    if (safe.currentPreset != null && !presetData[safe.currentPreset]) {
        safe.currentPreset = '- INIT -';
    }
    if (safe.theme != null && !THEMES[safe.theme]) {
        safe.theme = 'Dark';
    }

    SYNTH_SNAPSHOT_KEYS.forEach((key) => {
        if (safe[key] === undefined) return;
        const setter = setters[key];
        if (!setter) return;
        setter(safe[key]);
        if (key === 'theme') {
            storageSet('PolySynth-Theme', safe.theme);
        }
    });
}
