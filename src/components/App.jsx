import React, { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import PolySynth from 'src/components/PolySynth';
import { GlobalStyles } from 'src/styles/globalStyles';
import { THEMES } from 'src/styles/themes';
import { storageGet, storageRemove } from 'src/util/safeStorage';

const getTheme = () => {
    const storedTheme = storageGet('PolySynth-Theme');
    if (!THEMES[storedTheme]) {
        storageRemove('PolySynth-Theme');
        return 'Dark';
    }
    return storedTheme;
};

const App = () => {
    const [theme, setTheme] = useState(getTheme());

    return (
        <ThemeProvider theme={THEMES[theme]}>
            <GlobalStyles />
            <PolySynth
                theme={THEMES[theme]}
                currentTheme={theme}
                setTheme={setTheme}
            />
        </ThemeProvider>
    );
};

export default App;
