"use client";

import { useMemo, useState } from "react";
import { CALCULATORS, type CalculatorSpec } from "./sample-data";
import { useAuthStore } from "@/stores/useAuthStore";
import { useHydrated } from "@/hooks/useHydrated";
import clsx from "clsx";

type CalcId = CalculatorSpec["id"];

const ACTIVITY = [
  { key: "sedentary", label: "Сидячий", mult: 1.2 },
  { key: "light", label: "Лёгкая", mult: 1.375 },
  { key: "moderate", label: "Средняя", mult: 1.55 },
  { key: "active", label: "Высокая", mult: 1.725 },
  { key: "extreme", label: "Экстрим", mult: 1.9 },
] as const;

export function CalculatorsView() {
  const [active, setActive] = useState<CalcId | null>(null);
  return (
    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-0">
      {!active && (
        <div className="flex flex-col gap-2">
          {CALCULATORS.map((calc) => (
            <button
              key={calc.id}
              type="button"
              onClick={() => setActive(calc.id)}
              className="w-full p-3 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-left hover:bg-white/5 active:bg-white/10"
            >
              <div className="text-sm font-medium text-[var(--text-primary)]">
                {calc.title}
              </div>
              <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                {calc.description}
              </div>
            </button>
          ))}
        </div>
      )}
      {active === "tdee" && <TDEEForm onBack={() => setActive(null)} />}
      {active === "bmi" && <BMIForm onBack={() => setActive(null)} />}
      {active === "macros" && <MacrosForm onBack={() => setActive(null)} />}
    </div>
  );
}

function BackHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <button
        type="button"
        onClick={onBack}
        className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-sm"
      >
        ←
      </button>
      <span className="text-sm font-medium text-[var(--text-primary)]">
        {title}
      </span>
    </div>
  );
}

function NumberField({
  label,
  value,
  setValue,
  suffix,
  min,
  max,
}: {
  label: string;
  value: number;
  setValue: (v: number) => void;
  suffix?: string;
  min?: number;
  max?: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-[var(--text-tertiary)]">{label}</span>
      <div className="flex items-center gap-2 px-3 h-10 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)]">
        <input
          type="number"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          onChange={(e) => setValue(Number(e.target.value) || 0)}
          className="flex-1 bg-transparent outline-none text-sm tabular-nums"
        />
        {suffix && (
          <span className="text-[11px] text-[var(--text-tertiary)]">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

function TDEEForm({ onBack }: { onBack: () => void }) {
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const baseAge = hydrated && user ? user.age : 25;
  const baseGender = hydrated && user ? user.gender : "male";

  const [age, setAge] = useState(baseAge);
  const [gender, setGender] = useState<"male" | "female">(baseGender);
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(175);
  const [activity, setActivity] = useState<typeof ACTIVITY[number]["key"]>("moderate");

  const result = useMemo(() => {
    const bmr =
      gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;
    const mult = ACTIVITY.find((a) => a.key === activity)?.mult ?? 1.55;
    return { bmr: Math.round(bmr), tdee: Math.round(bmr * mult) };
  }, [age, gender, weight, height, activity]);

  return (
    <div className="flex flex-col gap-3">
      <BackHeader title="TDEE" onBack={onBack} />
      <div className="grid grid-cols-2 gap-2">
        <NumberField label="Возраст" value={age} setValue={setAge} suffix="лет" min={6} max={120} />
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-[var(--text-tertiary)]">Пол</span>
          <div className="flex gap-1 h-10 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)] p-1">
            {(["male", "female"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={clsx(
                  "flex-1 rounded text-xs",
                  gender === g
                    ? "bg-white/10 text-[var(--text-primary)]"
                    : "text-[var(--text-tertiary)]"
                )}
              >
                {g === "male" ? "М" : "Ж"}
              </button>
            ))}
          </div>
        </div>
        <NumberField label="Вес" value={weight} setValue={setWeight} suffix="кг" min={20} />
        <NumberField label="Рост" value={height} setValue={setHeight} suffix="см" min={100} />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[11px] text-[var(--text-tertiary)]">
          Активность
        </span>
        <div className="grid grid-cols-5 gap-1">
          {ACTIVITY.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => setActivity(a.key)}
              className={clsx(
                "h-9 rounded-md text-[10px] border border-[var(--glass-border)]",
                activity === a.key
                  ? "bg-white/10 text-[var(--text-primary)]"
                  : "bg-[var(--glass-bg)] text-[var(--text-tertiary)]"
              )}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 p-3 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] flex items-center justify-around">
        <div className="text-center">
          <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wide">
            BMR
          </div>
          <div className="text-lg font-semibold tabular-nums text-[var(--text-primary)]">
            {result.bmr}
          </div>
          <div className="text-[10px] text-[var(--text-tertiary)]">ккал</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wide">
            TDEE
          </div>
          <div className="text-lg font-semibold tabular-nums text-[var(--text-primary)]">
            {result.tdee}
          </div>
          <div className="text-[10px] text-[var(--text-tertiary)]">ккал</div>
        </div>
      </div>
    </div>
  );
}

function BMIForm({ onBack }: { onBack: () => void }) {
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(175);
  const result = useMemo(() => {
    const m = height / 100;
    if (m <= 0) return { bmi: 0, label: "—" };
    const bmi = weight / (m * m);
    let label = "—";
    if (bmi < 18.5) label = "недовес";
    else if (bmi < 25) label = "норма";
    else if (bmi < 30) label = "избыток";
    else label = "ожирение";
    return { bmi: Math.round(bmi * 10) / 10, label };
  }, [weight, height]);

  return (
    <div className="flex flex-col gap-3">
      <BackHeader title="BMI" onBack={onBack} />
      <div className="grid grid-cols-2 gap-2">
        <NumberField label="Вес" value={weight} setValue={setWeight} suffix="кг" min={20} />
        <NumberField label="Рост" value={height} setValue={setHeight} suffix="см" min={100} />
      </div>
      <div className="mt-2 p-3 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] flex items-center justify-around">
        <div className="text-center">
          <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wide">
            BMI
          </div>
          <div className="text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
            {result.bmi}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)]">
            {result.label}
          </div>
        </div>
      </div>
    </div>
  );
}

function MacrosForm({ onBack }: { onBack: () => void }) {
  const [calories, setCalories] = useState(2400);
  const [profile, setProfile] = useState<"balanced" | "lowcarb" | "highprot">(
    "balanced"
  );
  const ratios = {
    balanced: { p: 0.3, f: 0.3, c: 0.4 },
    lowcarb: { p: 0.35, f: 0.45, c: 0.2 },
    highprot: { p: 0.4, f: 0.3, c: 0.3 },
  } as const;
  const r = ratios[profile];
  const macros = useMemo(
    () => ({
      protein: Math.round((calories * r.p) / 4),
      fat: Math.round((calories * r.f) / 9),
      carbs: Math.round((calories * r.c) / 4),
    }),
    [calories, r.p, r.f, r.c]
  );

  return (
    <div className="flex flex-col gap-3">
      <BackHeader title="Макронутриенты" onBack={onBack} />
      <NumberField
        label="Калории"
        value={calories}
        setValue={setCalories}
        suffix="ккал"
        min={500}
      />
      <div className="grid grid-cols-3 gap-1">
        {(["balanced", "lowcarb", "highprot"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setProfile(p)}
            className={clsx(
              "h-9 rounded-md text-[10px] border border-[var(--glass-border)]",
              profile === p
                ? "bg-white/10 text-[var(--text-primary)]"
                : "bg-[var(--glass-bg)] text-[var(--text-tertiary)]"
            )}
          >
            {p === "balanced"
              ? "Баланс"
              : p === "lowcarb"
                ? "Low-carb"
                : "High-prot"}
          </button>
        ))}
      </div>
      <div className="mt-2 p-3 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] grid grid-cols-3 gap-2 text-center">
        <Cell label="Белки" value={macros.protein} suffix="г" />
        <Cell label="Жиры" value={macros.fat} suffix="г" />
        <Cell label="Углеводы" value={macros.carbs} suffix="г" />
      </div>
    </div>
  );
}

function Cell({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix: string;
}) {
  return (
    <div>
      <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wide">
        {label}
      </div>
      <div className="text-lg font-semibold tabular-nums text-[var(--text-primary)]">
        {value}
      </div>
      <div className="text-[10px] text-[var(--text-tertiary)]">{suffix}</div>
    </div>
  );
}
