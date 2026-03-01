import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ open, onClose, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md motion-safe:animate-fade-in" />
      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative glass-strong rounded-2xl shadow-xl shadow-black/40 max-w-md w-full p-6 motion-safe:animate-fade-up focus:outline-none"
      >
        {/* Gradient top border accent */}
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        {children}
      </div>
    </div>
  );
}
