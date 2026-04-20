"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  panelClassName?: string;
}

export function Modal({ isOpen, onClose, title, children, panelClassName }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
    >
      <div className={clsx("w-full max-w-lg rounded-sm bg-white p-6 shadow-2xl", panelClassName)}>
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-black">{title}</h3>
          <button
            aria-label="Close modal"
            className="text-zinc-500 transition-colors hover:text-black"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
