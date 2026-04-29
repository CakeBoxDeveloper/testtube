"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useStatsStore } from "@/stores/useStatsStore";

interface WeightEntryModalProps {
  open: boolean;
  onClose: () => void;
}

function nowLocalDateValue() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60_000);
  return local.toISOString().slice(0, 10);
}

export function WeightEntryModal({ open, onClose }: WeightEntryModalProps) {
  const addWeight = useStatsStore((s) => s.addWeight);
  const [weight, setWeight] = useState<string>("75.0");
  const [date, setDate] = useState<string>(nowLocalDateValue());

  const submit = () => {
    const w = Number(weight.replace(",", "."));
    if (!Number.isFinite(w) || w <= 0) return;
    const t = date ? new Date(date).getTime() : Date.now();
    addWeight(Math.round(w * 10) / 10, t);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} className="!max-w-[360px]">
      <div className="flex flex-col gap-3">
        <div className="text-[11px] uppercase tracking-wide text-[var(--text-tertiary)]">
          Замер веса
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-[var(--text-tertiary)]">Дата</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 h-10 rounded-md border border-[var(--glass-border)] bg-black/20 outline-none text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-[var(--text-tertiary)]">Вес, кг</span>
          <input
            type="number"
            inputMode="decimal"
            step={0.1}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="px-3 h-10 rounded-md border border-[var(--glass-border)] bg-black/20 outline-none text-sm tabular-nums"
          />
        </label>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 rounded-md border border-[var(--glass-border)] text-sm text-[var(--text-secondary)]"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={submit}
            className="flex-1 h-10 rounded-md bg-white/10 hover:bg-white/15 text-sm text-[var(--text-primary)]"
          >
            Сохранить
          </button>
        </div>
      </div>
    </Modal>
  );
}
