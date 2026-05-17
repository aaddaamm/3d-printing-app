import { h } from "preact";
import { useState, useCallback, useRef } from "preact/hooks";
import htm from "htm";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

type ToastType = "info" | "success" | "error";
type ToastItem = { message: string; type: ToastType; id: number };

let _addToast: (toast: ToastItem) => void = () => {};

export function toast(message: string, type: ToastType = "info"): void {
  _addToast({ message, type, id: Date.now() + Math.random() });
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  _addToast = useCallback((t: ToastItem) => {
    setToasts((prev) => [...prev, t]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id));
      timers.current.delete(t.id);
    }, 3500);
    timers.current.set(t.id, timer);
  }, []);

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  if (!toasts.length) return null;

  return html`
    <div class="toast-container">
      ${toasts.map(
        (t) => html`
          <div class="toast toast-${t.type}" key=${t.id} onClick=${() => dismiss(t.id)}>
            ${t.message}
          </div>
        `,
      )}
    </div>
  `;
}
