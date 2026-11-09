# MeshCore demo

Install dependencies with `pnpm install`, then start the demo:

```sh
pnpm dev
```

The demo connects to `/dev/tty.usbserial-0001` and replies to direct messages
with fixed, simulated weather measurements. Update the device path or contact
in `index.ts` for your hardware.

Send one of these codes to the station:

| Code | Measurement |
| --- | --- |
| `1` | Indoor temperature (C) |
| `2` | Outdoor temperature (C) |
| `3` | Wind direction (compass and degrees) and temperature (C) |
| `4` | Current rainfall rate (mm/h), last 24 hours and last 7 days (mm) |
| `5` | Barometric pressure (hPa) |
| `6` | Dew point (C) |
| `HELP` | Command menu (also returned for unknown codes) |

Replies start with `WX:`. Readings are demo fixtures, not live sensor
data or stored historical observations. Incoming station replies and legacy
`ACK:` messages are ignored to avoid reply loops.

Run the command tests without connecting a radio with `pnpm test`.
