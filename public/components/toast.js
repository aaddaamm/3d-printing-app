import { h } from 'https://esm.sh/preact@10';
import { useState, useCallback, useRef } from 'https://esm.sh/preact@10/hooks';
import htm from 'https://esm.sh/htm@3';

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
