import type { MaterialItem } from "@/lib/types";
import { ICONS } from "@/lib/assets";

export const SAMPLE_MATERIALS: MaterialItem[] = [
  {
    id: "mat_intro",
    title: "Введение в систему",
    description: "Как пользоваться платформой и что такое B-Index.",
    type: "course",
    icon: ICONS.idea,
    progress: 100,
  },
  {
    id: "mat_nutrition",
    title: "Основы питания",
    description: "Макронутриенты, калораж, структура рациона.",
    type: "course",
    icon: ICONS.defaultMaterial,
    progress: 30,
  },
  {
    id: "mat_recovery",
    title: "Восстановление и сон",
    description: "Циркадные ритмы, фазы сна, методики восстановления.",
    type: "course",
    icon: ICONS.dayAndNight,
    locked: true,
  },
];

export const SAMPLE_WORKOUTS: MaterialItem[] = [
  {
    id: "wkt_full_body",
    title: "Full body — старт",
    description: "Базовый комплекс на всё тело, 3 раза в неделю.",
    type: "workout",
    icon: ICONS.defaultWorkout,
    progress: 0,
  },
  {
    id: "wkt_push_pull",
    title: "Push / Pull / Legs",
    description: "Сплит-схема для среднего уровня.",
    type: "workout",
    icon: ICONS.defaultWorkout,
    locked: true,
  },
  {
    id: "wkt_endurance",
    title: "Выносливость",
    description: "Кардио и интервалы.",
    type: "workout",
    icon: ICONS.rate,
    locked: true,
  },
];

export interface CalculatorSpec {
  id: "tdee" | "bmi" | "macros";
  title: string;
  description: string;
}

export const CALCULATORS: CalculatorSpec[] = [
  {
    id: "tdee",
    title: "TDEE (расход калорий)",
    description: "Mifflin-St Jeor с уровнем активности.",
  },
  {
    id: "bmi",
    title: "Индекс массы тела",
    description: "Рост и вес → BMI.",
  },
  {
    id: "macros",
    title: "Макронутриенты",
    description: "Распределение БЖУ от калоража.",
  },
];
