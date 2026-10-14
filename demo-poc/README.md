# MeshCore demo

Install dependencies with `pnpm install`, then start the demo:

```sh
pnpm dev
```

The demo connects to `/dev/tty.usbserial-0001`, sends a greeting to the public
radio contact `D0D35F75`, and prints received messages to the terminal. Update
the device path or contact in `index.ts` for your hardware.
