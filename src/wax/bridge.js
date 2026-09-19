const WAX_APP_NAME = 'polymaniac';

/** @type {object | false | null} */
let waxInstance = null;

/** @type {AudioContext | null} */
let audioContext = null;

export function getWax() {
    if (waxInstance !== null) {
        return waxInstance || null;
    }

    if (typeof window !== 'undefined' && window.WaxWeb) {
        waxInstance = window.WaxWeb.create({ appName: WAX_APP_NAME });
    } else {
        waxInstance = false;
    }

    return waxInstance || null;
}

export function isRunningInWax() {
    const wax = getWax();
    return Boolean(wax?.isWax?.());
}

export function isDataTreeAvailable() {
    const wax = getWax();
    return Boolean(wax?.data);
}

export function getAudioContext() {
    if (!audioContext) {
        const wax = getWax();
        audioContext = wax?.audio?.context?.() ?? new AudioContext();
    }
    return audioContext;
}

/** @param {AudioNode} outputNode */
export function connectMasterOutput(outputNode, ctx) {
    const wax = getWax();
    if (wax?.isWax?.()) {
        wax.audio.connect(outputNode, ctx);
    } else {
        outputNode.connect(ctx.destination);
    }
}

export function initWaxTransport({ onStop, onPlay, onBpm } = {}) {
    const wax = getWax();
    if (!wax?.transport || !isRunningInWax()) {
        return () => {};
    }

    const unsubs = [];
    if (onStop) unsubs.push(wax.transport.onStop(onStop));
    if (onPlay) unsubs.push(wax.transport.onPlay(onPlay));
    if (onBpm) unsubs.push(wax.transport.onBpm(onBpm));

    return () => {
        unsubs.forEach((unsub) => {
            if (typeof unsub === 'function') unsub();
        });
    };
}

export function initWaxMidi(onMessage) {
    const wax = getWax();
    // Outside WAX, Web MIDI needs a separate browser grant — keyboard is enough for dev.
    if (!wax?.midi || !isRunningInWax()) {
        return Promise.resolve(null);
    }

    return wax.midi
        .ready()
        .then(() => wax.midi.onMessage(onMessage))
        .catch(() => null);
}
