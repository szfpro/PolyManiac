const PUSH_DEBOUNCE_MS = 250;

export function unwrapDataTreePayload(raw) {
    if (!raw || typeof raw !== 'object') return null;
    if (raw.params || raw.state) return raw;
    if (raw.data && typeof raw.data === 'object') return raw.data;
    return raw;
}

export function unwrapDataTreeParams(raw) {
    const data = unwrapDataTreePayload(raw);
    if (!data) return null;
    return data.params || data;
}

/**
 * WAX DataTree boot (setProvider + pull + onHydrated). Push only via pushSoon().
 * @see https://szfpro.github.io/CodeEditorHTML/wax/docs/WEB.md
 */
export function createDataTreeBridge(wax, { collect, apply }) {
    let canPush = false;
    let applying = false;
    let pushTimer = 0;
    let lastSyncedJson = '';

    function markSynced(raw) {
        try {
            const payload = unwrapDataTreePayload(raw) || collect();
            lastSyncedJson = JSON.stringify(payload);
        } catch (_) {
            lastSyncedJson = '';
        }
    }

    function pushSoon() {
        if (!canPush || applying || !wax?.data) return;
        clearTimeout(pushTimer);
        pushTimer = setTimeout(() => {
            try {
                const snapshot = collect();
                const json = JSON.stringify(snapshot);
                if (json === lastSyncedJson) return;
                wax.data.push(snapshot);
                lastSyncedJson = json;
            } catch (_) {
                /* host may be unavailable outside WAX */
            }
        }, PUSH_DEBOUNCE_MS);
    }

    function finishInit() {
        if (!lastSyncedJson) {
            markSynced(collect());
        }
        canPush = true;
    }

    function init() {
        if (!wax?.data) return;

        try {
            wax.data.setProvider(() => collect());
        } catch (_) {
            return;
        }

        try {
            wax.data.onHydrated((data) => {
                if (!data) return;
                applying = true;
                try {
                    apply(data);
                    markSynced(data);
                } finally {
                    applying = false;
                }
            });
        } catch (_) {
            return;
        }

        try {
            const cached = wax.data.cached();
            if (cached) {
                applying = true;
                try {
                    apply(cached);
                    markSynced(cached);
                } finally {
                    applying = false;
                }
            }
        } catch (_) {
            /* no cached snapshot */
        }

        let pullResult;
        try {
            pullResult = wax.data.pull();
        } catch (_) {
            finishInit();
            return;
        }

        Promise.resolve(pullResult)
            .then((saved) => {
                if (!saved) return;
                applying = true;
                try {
                    apply(saved);
                    markSynced(saved);
                } finally {
                    applying = false;
                }
            })
            .catch(() => {
                /* pull failed or no saved state */
            })
            .then(finishInit);
    }

    return {
        init,
        pushSoon,
        canPush: () => canPush,
        isApplying: () => applying,
    };
}
