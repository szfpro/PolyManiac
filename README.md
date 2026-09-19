# Poly Synth Test
Polyphonic synth prototype built in React using Web Audio API.

Stepping stone towards making more complex audio things :)

## Demo

Live demo: [https://szfpro.github.io/PolyManiac/](https://szfpro.github.io/PolyManiac/)

## Build for GitHub Pages

The site is built into the `docs/` folder (served from the `main` branch on GitHub Pages).

```bash
npm install
npm run build
```

Commit the updated `docs/` output, then push to `main`.

## WAX

Loads [WaxWeb.js](https://szfpro.github.io/CodeEditorHTML/wax-web.js) for use inside [WAX](https://wp.audiofusion.com/docs/wax-dev-helper/). In the host, track MIDI is routed via `wax.midi`; audio uses the shared WAX `AudioContext` and plugin output. Knobs, preset, theme, and octave persist via DataTree (`appName`: `polymaniac`) following the [WEB.md](https://szfpro.github.io/CodeEditorHTML/wax/docs/WEB.md) boot flow. Keyboard play still works in a normal browser.

### MIDI CC (WAX / host automation)

Standard CCs: **1** mod (vibrato depth), **7** volume, **11** expression (gain sustain), **64** sustain pedal, **71** filter Q, **74** filter cutoff, **91** reverb, **93** chorus/flanger. Extensions **102–119** for other mapped knobs — see `src/wax/ccMap.js`. User knob moves send CC back to the host when `fromMIDI` is false.
