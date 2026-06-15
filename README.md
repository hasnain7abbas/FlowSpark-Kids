# FlowSpark Kids

**Tiny experiments. Big science moments.**

FlowSpark Kids is a small science playground where children can see water, air,
heat, and pollution move in front of them. It is built for the moment when a
student asks, "What happens if I put this here?"

The first working milestone includes a responsive learning workspace, seven
guided experiment cards, twelve interactive tools, a real-time canvas
simulation, observation notes, Teacher Mode, and an original droplet mascot.

## What children can explore

- Guide water around rocks and walls.
- See pollution spread through moving water.
- Use smoke to reveal air movement.
- Compare rising warm air with sinking cool flow.
- Slow water with trees and clean dirty flow with filters.
- Add rain, drains, fans, and obstacles to test a prediction.

## Experiments included

1. Make a River
2. Stop the Flood
3. Dirty Water Spreads
4. Clean the Pond
5. See the Wind
6. Hot Air Rises
7. Around the Rock

## Running locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Checks

```bash
npm run lint
npm run test
npm run build
```

## Tech stack

- React
- TypeScript
- Vite
- Canvas 2D
- Lucide icons

The simulation is intentionally educational rather than a professional fluid
solver. It uses particles, directional forces, obstacles, and local effects to
make cause and effect easy to see.

## Project status

The app shell and interactive simulation foundation are working. Screenshot and
video capture, richer experiment success rules, object movement, automated
tests, and GitHub Pages deployment are planned for the next milestones.

## License

FlowSpark Kids is available under the [MIT License](LICENSE).
