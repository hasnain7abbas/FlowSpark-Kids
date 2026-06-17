# FlowSpark Kids

**Tiny experiments. Big science moments.**

FlowSpark Kids is an interactive science playground for primary-school students.
Children place water, rain, rocks, hills, trees, walls, fans, smoke, heat, ice,
filters, and drains onto a canvas, then watch how the scene changes.

It is built for a simple classroom question:

> What happens if I put this here?

![FlowSpark Kids home screen](assets/screenshots/home.png)

## Deployment

Open the app here:

**[https://hasnain7abbas.github.io/FlowSpark-Kids/](https://hasnain7abbas.github.io/FlowSpark-Kids/)**

The site is deployed from the `main` branch with GitHub Pages.

## What Students Do

Students choose an experiment card, pick a tool, and click or drag on the water
table. The notebook panel updates as they interact, using short observation
sentences instead of technical equations.

Examples:

- Add rain and protect the village with trees, hills, walls, and a drain.
- Place a rock or hill and watch water bend around it.
- Add pollution and see how dirty color spreads through water.
- Place a filter and watch dirty particles fade as they pass through.
- Add smoke and use a fan to make invisible air movement visible.
- Compare warm rising flow with cooler sinking flow.

## Experiments

| Experiment | What It Teaches |
| --- | --- |
| Make a River | Water follows paths and changes direction around obstacles. |
| Stop the Flood | Trees, hills, walls, and drains can slow or redirect rainwater. |
| Dirty Water Spreads | Pollution can travel away from where it starts. |
| Clean the Pond | Filters can remove some particles from moving water. |
| See the Wind | Smoke can reveal invisible air movement. |
| Hot Air Rises | Warm flow rises while cooler flow sinks. |
| Around the Rock | Obstacles split and redirect flow. |

## Screenshots

![River experiment](assets/screenshots/experiment-river.png)

![Flood experiment](assets/screenshots/experiment-flood.png)

![Teacher Mode](assets/screenshots/teacher-mode.png)

## Demo Video

<video src="assets/demo/flowspark-demo.mp4" controls width="100%"></video>

Direct files:

- [MP4 demo](assets/demo/flowspark-demo.mp4)
- [GIF demo](assets/demo/flowspark-demo.gif)

## Teacher Mode

Teacher Mode adds:

- A slightly more structured explanation.
- Vocabulary words for discussion.
- Prompts teachers can use before and after a student changes the scene.

It avoids equations on purpose. The app is meant to support observation,
prediction, and cause-and-effect reasoning.

## Tech Stack

- React
- TypeScript
- Vite
- Canvas 2D simulation
- Playwright media capture
- GitHub Pages

The simulation is educational rather than a professional CFD solver. It uses
particles, local forces, obstacles, drains, filters, and lightweight success
rules to make the effect of each tool visible.

## Run Locally

```bash
npm install
npm run dev
```

## Check And Build

```bash
npm run lint
npm run test
npm run build
```

## Regenerate Media

```bash
npm run generate:assets
npm run capture:screenshots
npm run capture:video
```

The capture scripts start a local Vite server, perform real app interactions,
and write media into `assets/screenshots` and `assets/demo`.

## Project Structure

```text
src/
  App.tsx
  data.ts
  experiments/
    successRules.ts
  simulation/
    FluidCanvas.tsx
  types.ts
scripts/
  capture-screenshots.mjs
  capture-video.mjs
  generate-assets.mjs
assets/
  screenshots/
  demo/
public/
  icon.svg
  apple-touch-icon.png
  og-image.png
```

## Roadmap

- Let students move or delete placed objects.
- Add worksheet export for classroom observations.
- Add a low-power rendering mode for older school computers.
- Add a small language system for future Urdu and English classroom variants.

## License

FlowSpark Kids is released under the [MIT License](LICENSE).
