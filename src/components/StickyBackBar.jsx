"use client";

import { ArrowLeft } from "lucide-react";

export function StickyBackBar({ onBack, label = "Back" }) {
  if (!onBack) return null;

  return (
    <div className="sticky-back-bar">
      <button type="button" onClick={onBack} className="sticky-back-button">
        <ArrowLeft className="h-4 w-4" />
        {label}
      </button>
    </div>
  );
}
