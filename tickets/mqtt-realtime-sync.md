# MQTT Real-Time Print Capture

## Background

Bambu printers expose an MQTT broker on port 8883 (local network). This is the
same protocol Bambu Studio uses in LAN mode. Instead of polling the cloud API,
you can subscribe to print events as they happen.

## Effort: Medium-High
## Benefit: Medium

High setup complexity (TLS cert, access code per printer), but unlocks
real-time capture that doesn't depend on the cloud API.

## Use cases

- Capture prints immediately after they finish — no manual sync needed
- Works fully offline / without a Bambu account
- Could replace or supplement the cloud sync for active printers
- Real-time status in the UI (job flips from "running" to "finish" live)
- Useful if Bambu ever restricts or rate-limits the cloud API

## Proposed approach

1. Add a `mqtt-listener.ts` that connects to the printer(s) via MQTT over TLS
2. Subscribe to `device/{serialNumber}/report` topic
3. Parse `mc_print` messages (status, layer, weight estimates mid-print)
4. On print completion, upsert the task and run session normalization
5. Covers won't be available this way — cloud sync still needed for those

## Config needed

- `BAMBU_PRINTER_IP` — local IP of each printer
- `BAMBU_PRINTER_SERIAL` — serial number (used as MQTT client ID + topic)
- `BAMBU_PRINTER_ACCESS_CODE` — from printer's touchscreen (Settings → Network)

## Open questions

- Multiple printers: need one MQTT connection per printer
- The MQTT message schema is undocumented and community-reverse-engineered
  (see bambu-research community on GitHub for current message shapes)
- Cover images are only available via the cloud API — MQTT gives no S3 URLs
- Would this run as part of the API server, or a separate daemon?

## References

- Community docs: https://github.com/bambulab/bambulab (unofficial reverse engineering)
- bambu-farm and homeassistant-bambulab projects have working MQTT implementations
