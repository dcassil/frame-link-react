# frame-link-react examples

This folder contains the illustrative snippet files (`parent.tsx`, `iframe.tsx`,
`sample-registry.ts`, `docs-snippets.ts`) plus a **runnable** parent/iframe demo
under `demo/` that boots in a browser and proves bidirectional typed messaging.

## Runnable demo

The demo is a two-page Vite app served from this `examples/` directory:

- `index.html` — the **parent** page. Embeds the iframe page, shows the
  connection status (connecting → connected), and has a button that sends a
  typed `user:get` request to the iframe and renders the response.
- `iframe.html` — the **iframe** page. Answers `user:get` and pushes a typed
  `notification:show` event back up to the parent, which the parent renders.

Both sides are typed end-to-end against the shared `SampleMessages` registry in
[`sample-registry.ts`](./sample-registry.ts) — no `any`.

### Run it

From the package root (`frame-link-react/`):

```bash
npm install     # first time only — installs vite + @vitejs/plugin-react
npm run demo    # starts the Vite dev server; open the printed http://localhost:… URL
```

Then in the browser:

1. The parent status flips from **connecting** to **connected** once the iframe
   loads and the handshake completes.
2. Click **Get User** on the parent → the iframe answers and the typed response
   renders (`Got user: User 123 <user123@example.com>`).
3. Click **Send notification to parent** inside the iframe → a banner appears on
   the parent showing the `notification:show` event payload.

To produce a static production build of both pages (used for CI/typecheck and
portfolio screenshots):

```bash
npm run demo:build   # outputs to ../dist-demo
```

## `targetOrigin: "*"` is DEMO-ONLY

Both providers in the demo use `options={{ targetOrigin: "*" }}`. This is
acceptable **only** because the parent and the iframe are served from the same
local origin (the Vite dev server / preview). It is clearly labelled as
demo-only in the code comments in `demo/parent-app.tsx` and `demo/iframe-app.tsx`.

**Never use `"*"` in production.** Pin `targetOrigin` to the exact origin of the
other frame so `postMessage` only ever delivers to the window you trust.

## Typecheck the examples

```bash
npx tsc --noEmit -p examples/tsconfig.json
```
