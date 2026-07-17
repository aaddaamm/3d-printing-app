import { downloadCovers } from "../lib/covers.js";
import { logInfo } from "../lib/logger.js";

const result = await downloadCovers();

logInfo(
  `Cover repair complete: ${result.downloaded} downloaded, ${result.skipped} already cached, ${result.expired} expired, ${result.failed} failed.`,
);

if (result.failed > 0) process.exitCode = 1;
