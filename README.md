# Rope Record

An installable phone app (PWA) for MRT engineers on site: rope data and calibration for any rope, with the
working shown and mistakes stopped before the record is saved. **Site record – not a report.**

Open: https://johnsonpinto-dev.github.io/rope-record/

## Install on an Android phone

1. Open the address above in **Chrome** (with signal, once).
2. Tap **Install app** on the app's home screen, or Chrome menu **⋮** → **Add to home screen** → **Install**.
3. Open **Rope Record** from the home screen. From then on it works with no signal (airplane mode).

## What it does

- Job type first: **Site rope** or **Reference rope** (the reference rope adds sections A/B/C).
- Rope data, then the calculated figures with their working: A (Intron k × π × D² / 4 and ISO 2408 C × d², never the
  weight factor W), Intron Table 4 air value for the head and A, one-wire area, D ÷ δmax, n, 6d and 30d,
  the LF limit (ISO 4309 Annex C formula when A and δmax are known, otherwise ISO 4309 Table 3 / 4 for the RCN,
  marked "Acumen criterion"), and the liner proposed from the measured diameter.
- Calibration one step per screen, in procedure order; a step cannot be skipped.
- Mistakes are shown in red and must be fixed or given a reason (saved with the record).
- Save keeps the record on the phone and downloads its CSV (UTF-8 with BOM). **Share** sends the CSV through the
  Android share sheet (WhatsApp, email); where sharing is not available the CSV is downloaded.
- Records stay on the phone (browser storage). Nothing is sent anywhere.

## Files

`index.html`, `styles.css`, `app.js` (screens), `calc.js` (all calculations and checks), `version.js` (version and
date, shown in the app and naming the offline cache), `sw.js` (offline cache), `manifest.webmanifest`, `icons/`.

To publish a new version: change `version.js`, then push. Phones pick it up the next time the app opens with signal.

ISO 2408 / ISO 4309 figures are as keyed for Acumen's MRT software and are provisional until checked against the
printed pages.
