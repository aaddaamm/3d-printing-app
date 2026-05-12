import { h } from 'https://cdn.jsdelivr.net/npm/preact@10.29.1/dist/preact.module.js';
import { useState, useCallback, useRef } from 'https://cdn.jsdelivr.net/npm/preact@10.29.1/hooks/dist/hooks.module.js';
import htm from 'https://cdn.jsdelivr.net/npm/htm@3.1.1/dist/htm.module.js';

const html = htm.bind(h);

let _addToast = () => {};

export function toast(message, type = 'info') {
  _addToast({ message, type, id: Date.now() + Math.random() });
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  _addToast = useCallback(t => {
    setToasts(prev => [...prev, t]);
    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(x => x.id !== t.id));
      timers.current.delete(t.id);
    }, 3500);
    timers.current.set(t.id, timer);
  }, []);

  const dismiss = useCallback(id => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts(prev => prev.filter(x => x.id !== id));
  }, []);

  if (!toasts.length) return null;

  return html`
    <div class="toast-container">
      ${toasts.map(t => html`
        <div class="toast toast-${t.type}" key=${t.id} onClick=${() => dismiss(t.id)}>
          ${t.message}
        </div>
      `)}
    </div>
  `;
}
