import { getWax, isRunningInWax } from 'src/wax/bridge';
import {
    CC_PARAM_SPECS,
    CC_NUMBER_TO_PARAM,
    CC_SUSTAIN_PEDAL,
    ccToValue,
    valueToCc,
} from 'src/wax/ccMap';

export function sendParamCc(paramKey, value, channel) {
    if (!isRunningInWax()) return;
    const spec = CC_PARAM_SPECS[paramKey];
    if (!spec) return;
    const wax = getWax();
    if (!wax?.midi) return;
    try {
        wax.midi.cc(spec.cc, valueToCc(value, spec), channel);
    } catch (_) {
        /* host unavailable */
    }
}

/**
 * @returns {string | null} param key if handled
 */
export function ccMessageToParamKey(controller) {
    if (controller === CC_SUSTAIN_PEDAL) return '__sustainPedal__';
    return CC_NUMBER_TO_PARAM[controller] || null;
}

export function ccMessageToValue(controller, ccValue) {
    const paramKey = CC_NUMBER_TO_PARAM[controller];
    if (!paramKey) return null;
    return ccToValue(ccValue, CC_PARAM_SPECS[paramKey]);
}

export { CC_SUSTAIN_PEDAL };
