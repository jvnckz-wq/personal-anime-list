"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type ToastOptions = { onUndo?: () => void; onExpire?: () => void };
type ToastApi = { show: (message: string, options?: ToastOptions) => void; undo: () => boolean };

const ToastContext = createContext<ToastApi | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

/** One toast at a time. Undoable toasts stay 6 s; the undo is offered by button and the U key. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; undoable: boolean; visible: boolean }>({ message: "", undoable: false, visible: false });
  const options = useRef<ToastOptions>({});
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = useCallback((message: string, opts: ToastOptions = {}) => {
    clearTimeout(timer.current);
    options.current = opts;
    const undoable = !!opts.onUndo;
    setToast({ message, undoable, visible: true });
    timer.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
      options.current.onExpire?.();
      options.current = {};
    }, undoable ? 6000 : 2400);
  }, []);

  const undo = useCallback(() => {
    const fn = options.current.onUndo;
    if (!fn) return false;
    options.current = {};
    fn();
    return true;
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={{ show, undo }}>
      {children}
      <div id="toast" role="status" aria-live="polite" className={toast.visible ? "show" : ""}>
        <span id="toast-msg">{toast.message}</span>
        <button type="button" id="toast-undo" hidden={!toast.undoable} aria-keyshortcuts="u" onClick={undo}>
          <span>
            Undo <kbd>U</kbd>
          </span>
        </button>
      </div>
    </ToastContext.Provider>
  );
}
