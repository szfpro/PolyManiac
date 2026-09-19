/**
 * MIDI 1.0 CC map for PolyManiac (Logic / host automation).
 * Standard CCs use conventional meanings; 102–119 are general-purpose extensions.
 */

/** @typedef {'linear' | 'log' | 'bipolar'} CcCurve */

/**
 * @typedef {object} CcParamSpec
 * @property {number} cc
 * @property {number} min
 * @property {number} max
 * @property {CcCurve} [curve]
 * @property {string} [label]
 */

/** @type {Record<string, CcParamSpec>} */
export const CC_PARAM_SPECS = {
    // Standard assignments
    vibratoDepth: { cc: 1, min: 0, max: 200, label: 'Modulation Wheel (Vibrato Depth)' },
    gainSustain: { cc: 11, min: 0, max: 0.7, label: 'Expression (Gain Sustain)' },
    masterVolume: { cc: 7, min: 0, max: 1, label: 'Channel Volume' },
    filterQ: { cc: 71, min: 0, max: 20, label: 'Filter Resonance (Voice Q)' },
    filterFreq: { cc: 74, min: 20, max: 11000, curve: 'log', label: 'Brightness (Voice Cutoff)' },
    reverbAmount: { cc: 91, min: 0, max: 1, label: 'Reverb Send' },
    flangerAmount: { cc: 93, min: 0, max: 1, label: 'Chorus Send (Flanger Dry/Wet)' },

    // General-purpose (102–119) — documented extensions
    masterFilterFreq: { cc: 102, min: 20, max: 11000, curve: 'log', label: 'Master Filter Cutoff' },
    masterFilterQ: { cc: 103, min: 0, max: 20, label: 'Master Filter Q' },
    distortionAmount: { cc: 104, min: 0, max: 1, label: 'Distortion Dry/Wet' },
    distortionDist: { cc: 105, min: 0, max: 30, label: 'Distortion Amount' },
    delayAmount: { cc: 106, min: 0, max: 1, label: 'Delay Dry/Wet' },
    delayTime: { cc: 107, min: 0, max: 1, label: 'Delay Time' },
    delayFeedback: { cc: 108, min: 0, max: 1, label: 'Delay Feedback' },
    gainAttack: { cc: 109, min: 0, max: 3, label: 'Gain Attack' },
    gainDecay: { cc: 110, min: 0, max: 3, label: 'Gain Decay' },
    gainRelease: { cc: 111, min: 0, max: 3, label: 'Gain Release' },
    vibratoRate: { cc: 112, min: 0, max: 50, label: 'Vibrato Rate' },
    portamentoSpeed: { cc: 113, min: 0, max: 0.5, label: 'Portamento' },
    bitCrushAmount: { cc: 114, min: 0, max: 1, label: 'Bit Crush Dry/Wet' },
    eqLowGain: { cc: 115, min: -12, max: 12, curve: 'bipolar', label: 'EQ Low Gain' },
    eqHighGain: { cc: 116, min: -12, max: 12, curve: 'bipolar', label: 'EQ High Gain' },
    eqLowFreq: { cc: 117, min: 20, max: 320, curve: 'log', label: 'EQ Low Freq' },
    eqHighFreq: { cc: 118, min: 320, max: 11000, curve: 'log', label: 'EQ High Freq' },
    filterEnvAmount: { cc: 119, min: -11000, max: 11000, curve: 'bipolar', label: 'Filter Env Amount' },
};

export const CC_SUSTAIN_PEDAL = 64;

/** @type {Record<number, string>} */
export const CC_NUMBER_TO_PARAM = Object.fromEntries(
    Object.entries(CC_PARAM_SPECS).map(([param, spec]) => [spec.cc, param]),
);

export function ccToValue(cc, spec) {
    const t = cc / 127;
    if (spec.curve === 'log') {
        const { min, max } = spec;
        const logMin = Math.log(min);
        const logMax = Math.log(max);
        return Math.exp(logMin + t * (logMax - logMin));
    }
    if (spec.curve === 'bipolar') {
        const mid = (spec.min + spec.max) / 2;
        const half = (spec.max - spec.min) / 2;
        return mid + (t - 0.5) * 2 * half;
    }
    return spec.min + t * (spec.max - spec.min);
}

export function valueToCc(value, spec) {
    const clamped = Math.min(spec.max, Math.max(spec.min, value));
    if (spec.curve === 'log') {
        const { min, max } = spec;
        const logMin = Math.log(min);
        const logMax = Math.log(max);
        const t = (Math.log(clamped) - logMin) / (logMax - logMin);
        return Math.round(t * 127);
    }
    if (spec.curve === 'bipolar') {
        const mid = (spec.min + spec.max) / 2;
        const half = (spec.max - spec.min) / 2;
        const t = (clamped - mid) / (2 * half) + 0.5;
        return Math.round(Math.min(1, Math.max(0, t)) * 127);
    }
    const t = (clamped - spec.min) / (spec.max - spec.min);
    return Math.round(Math.min(1, Math.max(0, t)) * 127);
}
