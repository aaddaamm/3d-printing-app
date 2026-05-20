const tty = process.stdout.isTTY;
const colorize = (code: number) => (s: string | number) =>
  tty ? `\x1b[${code}m${s}\x1b[0m` : String(s);
export const bold = colorize(1);
export const dim = colorize(2);
export const red = colorize(31);
export const green = colorize(32);
export const yellow = colorize(33);
export const cyan = colorize(36);
