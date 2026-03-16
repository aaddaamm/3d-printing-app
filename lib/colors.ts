const tty = process.stdout.isTTY;
export const c = (code: number) => (s: string | number) =>
  tty ? `\x1b[${code}m${s}\x1b[0m` : String(s);
export const bold   = c(1);
export const dim    = c(2);
export const red    = c(31);
export const green  = c(32);
export const yellow = c(33);
export const cyan   = c(36);
