# Development Notes — Tower Defense

This document tracks game features, current status, and next development steps.

## Overview
A simple 2D tower defense game built with Phaser 3.

## Features
- [x] Basic Phaser setup and canvas rendering
- [x] Grid background
- [x] Randomized path generation per level
- [x] Enemy spawning with waves
- [x] Tower placement by clicking
- [x] Towers shoot bullets that track enemies
- [x] Range indicator for towers (visible on placement)
- [x] UI showing Level, Money, Lives, Wave
- [x] Menu scene with START GAME
- [x] Back button returning to menu (cleans up game state)
- [x] Level completion screen with READY? button
- [x] Pauses game at level complete; resumes on READY
- [x] Level progression: bonus money, new path, reset towers
- [x] Game over screen (flashing red)

## In-Progress / To Do
- [ ] Improve enemy variety (types, behaviors)
- [ ] Implement tower upgrade system
- [ ] Add sound effects and music
- [ ] Persist high scores locally
- [ ] Polish visuals and animations
- [ ] Performance optimizations for large enemy counts

## Recent Changes
- 2026-02-08: Added READY? button with pulsating animation; pause/resume logic
- 2026-02-07: Implemented wave system, random path, tower shooting, UI

## How to run locally
```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Notes for contributors
- Main game logic lives in `js/main.js`.
- UI text is updated via `updateUI()` in `TowerDefenseScene`.
- When editing, unregister service worker or use a hard refresh in browser to see updates.

## Suggested Next Steps (short-term)
- Tweak balancing: enemy health/speed, tower damage/rate
- Make bullets sprites and add collision using Arcade physics
- Add a simple wave preview/indicator on menu

## Git-based changelog automation

Files added:
- `scripts/generate_changelog.sh` — generates `CHANGELOG.md` from `git log`.
- `.githooks/post-commit` — sample hook to regenerate the changelog after each commit.

How to enable (one-time):

```bash
cd /path/to/hello-game
git init
git add .
git commit -m "Initial commit"
# Tell git to use our hooks folder
git config core.hooksPath .githooks
# Make hook executable (on mac/linux)
chmod +x .githooks/post-commit scripts/generate_changelog.sh
```

You can also run the generator manually:

```bash
./scripts/generate_changelog.sh
```

This provides a minimal, automated changelog tied to commits. We can extend it to
format by tags, include authors, or integrate with CI later.

