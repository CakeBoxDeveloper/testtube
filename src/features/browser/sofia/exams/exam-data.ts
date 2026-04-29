export interface ExamQuestion {
  id: string;
  text: string;
  options: string[];
  correct: number; // index
  hint?: string;
}

export interface ExamSpec {
  id: string;
  title: string;
  description: string;
  durationMin: number;
  passScore: number; // 0..100
  awardId: string;
  awardTitle: string;
  awardDescription?: string;
  questions: ExamQuestion[];
}

export const EXAM_SPECS: Record<string, ExamSpec> = {
  exam_basics: {
    id: "exam_basics",
    title: "Базовая теория",
    description: "Введение в систему MSE.",
    durationMin: 5,
    passScore: 70,
    awardId: "ach_exam_basics",
    awardTitle: "Теоретик",
    awardDescription: "Сдан базовый экзамен.",
    questions: [
      {
        id: "q1",
        text: "Какой модуль отвечает за задачи?",
        options: ["София", "Проксима", "Кассандра", "Орион"],
        correct: 1,
      },
      {
        id: "q2",
        text: "Что такое B-Index в MSE?",
        options: [
          "Индекс массы тела",
          "Биологический показатель состояния организма",
          "Биткойн-курс",
          "Базовая ставка калорий",
        ],
        correct: 1,
      },
      {
        id: "q3",
        text: "Какие данные у пользователя общие для обоих модулей?",
        options: [
          "Только логин",
          "Логин, пароль, номер звена, возраст, пол",
          "Только список задач",
          "Только статы здоровья",
        ],
        correct: 1,
      },
      {
        id: "q4",
        text: "Кому помогает София?",
        options: [
          "Управлять задачами",
          "Здоровьем, спортом, обучением",
          "Финансами",
          "Чинить автомобиль",
        ],
        correct: 1,
      },
      {
        id: "q5",
        text: "Что НЕ загружает модуль София?",
        options: [
          "Список задач из Проксимы",
          "Список достижений",
          "Историю веса",
          "Возраст пользователя",
        ],
        correct: 0,
      },
    ],
  },
  exam_nutrition: {
    id: "exam_nutrition",
    title: "Питание",
    description: "Калории, БЖУ, режим питания.",
    durationMin: 10,
    passScore: 70,
    awardId: "ach_exam_nutrition",
    awardTitle: "Нутрициолог",
    awardDescription: "Сдан экзамен по питанию.",
    questions: [
      {
        id: "q1",
        text: "Сколько ккал содержит 1 г белка?",
        options: ["4", "9", "7", "5"],
        correct: 0,
      },
      {
        id: "q2",
        text: "Сколько ккал содержит 1 г жира?",
        options: ["4", "7", "9", "11"],
        correct: 2,
      },
      {
        id: "q3",
        text: "Какая формула BMR используется в калькуляторе TDEE приложения?",
        options: ["Harris-Benedict", "Mifflin-St Jeor", "Cunningham", "Katch-McArdle"],
        correct: 1,
      },
      {
        id: "q4",
        text: "Какой множитель активности у «средней» (3-5 тренировок в неделю)?",
        options: ["1.2", "1.375", "1.55", "1.725"],
        correct: 2,
      },
      {
        id: "q5",
        text: "Сбалансированное распределение БЖУ по умолчанию:",
        options: [
          "Б 30% / Ж 30% / У 40%",
          "Б 50% / Ж 20% / У 30%",
          "Б 20% / Ж 50% / У 30%",
          "Б 40% / Ж 40% / У 20%",
        ],
        correct: 0,
      },
      {
        id: "q6",
        text: "Дефицит для устойчивого похудения — сколько % от TDEE?",
        options: ["50%", "30%", "10–20%", "5%"],
        correct: 2,
      },
    ],
  },
};
