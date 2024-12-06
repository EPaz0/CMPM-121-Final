export type TranslationKeys =
  | "title"
  | "shop"
  | "objective"
  | "objectiveText"
  | "day"
  | "nextDay"
  | "fish"
  | "buy"
  | "soldOut"
  | "cell"
  | "sunlight"
  | "food"
  | "wonText"
  | "loseText"
  | "Red"
  | "Green"
  | "Yellow";

export type LanguageCode = "en" | "es" | "ar";

export const translations: Record<LanguageCode, Record<TranslationKeys, string>> = {
  en: {
    // Titles & Main UI
    title: "Fish Farm",
    shop: "Shop",
    objective: "Objective",
    objectiveText: "Make 💵 {{amount}}",
    day: "Day",
    nextDay: "Next Day",

    // Shop UI
    buy: "Buy",
    fish: "Fish",
    soldOut: "Sold Out",

    // Cell Info
    cell: "Cell",
    sunlight: "☀️ Sunlight",
    food: "🍎 Food",

    // Messages
    wonText: "You won in {{days}} days!",
    loseText: "Game Over!",

    // Fish Colors
    Red: "Red",
    Green: "Green",
    Yellow: "Yellow",
  },
  es: {
    // Titles & Main UI
    title: "Granja de Peces",
    shop: "Tienda",
    objective: "Objetivo",
    objectiveText: "Consigue 💵 {{amount}}",
    day: "Día",
    nextDay: "Siguiente Día",

    // Shop UI
    buy: "Comprar",
    fish: "Pez",
    soldOut: "Agotado",

    // Cell Info
    cell: "Celda",
    sunlight: "☀️ Sol",
    food: "🍎 Alimento",

    // Messages
    wonText: "¡Ganaste en {{days}} días!",
    loseText: "¡Fin del juego!",

    // Fish Colors
    Red: "Rojo",
    Green: "Verde",
    Yellow: "Amarillo",
  },
  ar: {
    // Titles & Main UI
    title: "مزرعة الأسماك",
    shop: "المتجر",
    objective: "الهدف",
    objectiveText: "اكسب 💵 {{amount}}",
    day: "يوم",
    nextDay: "اليوم التالي",

    // Shop UI
    buy: "شراء",
    fish: "سمكة",
    soldOut: "نفذ",

    // Cell Info
    cell: "خلية",
    sunlight: "☀️ الشمس",
    food: "🍎 الطعام",

    // Messages
    wonText: "فزت في {{days}} يومًا!",
    loseText: "انتهت اللعبة!",

    // Fish Colors
    Red: "أحمر",
    Green: "أخضر",
    Yellow: "أصفر",
  },
};