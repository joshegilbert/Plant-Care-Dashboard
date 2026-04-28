# PlantPulse

A browser-based plant monitoring dashboard that pairs with a Bluetooth Low Energy (BLE) sensor and surfaces soil moisture, temperature, and humidity in real time—so you can see at a glance whether your plant needs water.

![Stack](https://img.shields.io/badge/stack-Vue%203%20%7C%20Web%20Bluetooth-4caf50?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

<img width="4032" height="3024" alt="IMG_3644" src="https://github.com/user-attachments/assets/419c4ec9-8eb1-43b2-b580-3c216237d83e" />

## Why this project

**PlantPulse** pairs a small Vue dashboard with ESP32 firmware: the board reads soil moisture (analog), temperature, and humidity (DHT11), exposes them over BLE, and the browser reads the same GATT characteristic—no native app required. The UI reacts to a soil-moisture threshold and updates styling (and optional imagery) to reflect whether the plant needs water.

## Features

- **Web Bluetooth pairing** — Connect to a device advertising a custom BLE service and read a GATT characteristic on an interval.
- **Live sensor data** — Parses incoming payloads as soil moisture, temperature (converted to °F), and air moisture.
- **Watering guidance** — Compares soil moisture to a threshold and toggles “Need Water” state and card styling.
- **Vue 3 UI** — Reactive bindings for metrics and plant imagery without a build step (Vue loaded from CDN).

## Tech stack

| Layer        | Choice                          |
| ------------ | ------------------------------- |
| UI framework | Vue 3 (global build via CDN)    |
| Styling      | Plain CSS                       |
| Hardware I/O | Web Bluetooth API (`navigator.bluetooth`) |
| Firmware     | Arduino / ESP32 (Heltec board, see `bluetooth.ino`) |
| Runtime      | Static HTML + Vue from CDN (no bundler) |

## Prerequisites

- **Browser:** Chromium-based browser with Web Bluetooth (e.g. Chrome, Edge). Safari’s support differs; check current compatibility for your target.
- **Context:** Web Bluetooth requires a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts)—typically **HTTPS** or **http://localhost** when developing locally.
- **Hardware:** A BLE peripheral that exposes the service/characteristic UUIDs configured in `app.js`. The included `bluetooth.ino` firmware broadcasts `soil_analog,temp_c,humidity` as a comma-separated string (same shape the web app parses).

## Getting started

Clone the repo and serve the folder over HTTP (opening `index.html` directly from disk may block Bluetooth).

```bash
# Example: Python 3
python3 -m http.server 8080

# Then open http://localhost:8080
```

Use the **Connect** button to choose your device from the system picker. Once connected, the app polls the characteristic every two seconds while connected.

## Firmware

`bluetooth.ino` targets an ESP32 with **Heltec** stack support, a **DHT11** on pin 27, and soil moisture on analog-style pin 13. It advertises the same service/characteristic UUIDs as the web app, updates the characteristic with `Moisture,tempC,humidity`, and notifies on a 2s loop. Flash with the Arduino IDE or PlatformIO after selecting the correct board package.

## Project structure

```
├── index.html      # Shell + Vue mount point
├── app.js          # Vue app, BLE connect/read, moisture thresholds
├── style.css       # Layout and moisture-state styling
├── bluetooth.ino   # ESP32 BLE server + sensors (Heltec / DHT11)
└── README.md
```

Add your plant images next to the HTML or adjust paths in `app.js` (e.g. default and “dry” states).

## Configuration

BLE UUIDs and polling behavior live in `app.js`:

- `serviceId` / `characteristicId` — Must match your firmware’s GATT definitions.
- Moisture threshold — `updateWaterStatus` uses `< 990` as the “needs water” branch; tune this to your sensor’s scale and calibration.

## Limitations and notes

- **Platform support** — Web Bluetooth is not universally available; document which browsers you tested.
- **One characteristic** — Current flow assumes a single readable characteristic with a text payload; extend as needed for notifications or multiple characteristics.
- **Image paths** — `app.js` references image filenames; add those files beside `index.html` or update paths for your deployment.


<img width="1499" height="636" alt="Screenshot 2026-04-27 at 10 15 00 PM" src="https://github.com/user-attachments/assets/1797098d-bb36-41bc-af2b-232e24c2de21" />


## License

MIT — use freely in your portfolio and projects.

---

*Built as a portfolio piece: connected hardware, progressive web APIs, and a clear, minimal UI.*
