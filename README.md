# Setu

A bridge practice table and system notebook. You bid deals with a bot partner who plays your own system (2/1 Game Force as the base), and a double-dummy solver shows what the deal was worth.

**Use it:** https://adityagovilkar-debug.github.io/setu/

**How to use it (plain-language guide, printable):** https://adityagovilkar-debug.github.io/setu/how-to-use.html — also the **Help** button inside the app. The source is `public/how-to-use.html`.

It runs entirely in the browser. Nothing is sent anywhere; the system card and practice history are stored on the device. After the first visit it opens without an internet connection.

## Working on it

```bash
npm install
```

```bash
npm run dev
```

```bash
npm test
```

```bash
npm run deploy
```

`deploy` builds the app and publishes it to the `gh-pages` branch, which GitHub Pages serves at the address above.

- `src/engine/system21.ts` — the 2/1 system as plain rule lines
- `src/engine/rules.ts` — reads and matches rule lines
- `src/engine/bidder.ts` — the bot: rules first, judgment where the card is silent
- `src/engine/solver.ts` — double-dummy solver ([DDS](https://github.com/dds-bridge/dds) through the `bridge-dds` package)
- `src/ui/` — the Table and System rooms
- `PLAN.md` — design, decisions and progress
- `mockup/` — the original clickable design mockup

The solver is DDS by Bo Haglund and Soren Hein (Apache 2.0), compiled to WebAssembly by `bridge-dds` (Apache 2.0).
