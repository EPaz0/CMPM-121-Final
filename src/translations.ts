export type TranslationKeys =
  | "title"
  | "shop"
  | "tutorialObjective"
  | "objective"
  | "objectiveText"
  | "day"
  | "nextDay"
  | "fish"
  | "buy"
  | "sell"
  | "noFishInCell"
  | "overcrowded"
  | "specialEvent"
  | "none"
  | "heatwave"
  | "storm"
  | "cell"
  | "sunlight"
  | "food"
  | "growth"
  | "value"
  | "wonText"
  | "loseText"
  | "gameWon"
  | "nextLevel"
  | "saveGame"
  | "loadGame"
  | "listSaveSlots"
  | "deleteSaveSlot"
  | "savePrompt"
  | "loadPrompt"
  | "deletePrompt"
  | "noSaveData"
  | "gameLoaded"
  | "slotDeleted"
  | "availableSlots"
  | "Red"
  | "Green"
  | "Yellow"
  | "GreenFishDescription"
  | "YellowFishDescription"
  | "RedFishDescription";

export type LanguageCode = "en" | "es" | "ar";

export const translations: Record<
  LanguageCode,
  Record<TranslationKeys, string>
> = {
  en: {
    // Titles & Main UI
    title: "Fish Farm",
    shop: "Shop",
    tutorialObjective: "Tutorial Objective",
    objective: "Level {{level}} Objective",
    objectiveText: "Make 💵 {{amount}}",
    day: "Day",
    nextDay: "Next Day",

    // Shop & Gameplay
    buy: "Buy",
    sell: "Sell",
    fish: "Fish",
    noFishInCell: "No fish in this cell.",
    overcrowded: "⚠️Overcrowded⚠️",

    // Special Event
    specialEvent: "Special Event: {{event}}",
    none: "None",
    heatwave: "Heatwave",
    storm: "Storm",

    // Cell Info
    cell: "Cell",
    sunlight: "☀️ Sunlight",
    food: "🍎 Food",
    growth: "Growth",
    value: "Value",

    // Win/Lose Messages
    wonText: "You won in {{days}} days!",
    loseText: "Game Over!",
    gameWon: "Congratulations! You completed the game!",
    nextLevel: "Next Level",

    // Save/Load Buttons
    saveGame: "Save Game",
    loadGame: "Load Game",
    listSaveSlots: "List Save Slots",
    deleteSaveSlot: "Delete Save Slot",

    // Save/Load/Delete Prompts
    savePrompt: "Enter save slot name to save to (e.g., Slot1):",
    loadPrompt: "Enter save slot name to load from (e.g., Slot1):",
    deletePrompt: "Enter save slot name to delete (e.g., Slot1):",

    // Save/Load/Delete Alerts
    noSaveData: 'No save data found for slot "{{slot}}".',
    gameLoaded: 'Game loaded from slot "{{slot}}".',
    slotDeleted: 'Save slot "{{slot}}" deleted.',
    availableSlots: "Available save slots:\n{{slots}}",

    // Fish Types
    Red: "Red",
    Green: "Green",
    Yellow: "Yellow",

    // Fish Descriptions
    GreenFishDescription:
      "Green fish like living in groups of their own kind and do not tolerate extreme sunlight.",
    YellowFishDescription:
      "Yellow fish like high sunlight and living with fish of other kinds.",
    RedFishDescription:
      "Red fish like low sunlight and do not tolerate their own kind.",
  },
  es: {
    // Titles & Main UI
    title: "Granja de Peces",
    shop: "Tienda",
    tutorialObjective: "Objetivo del Tutorial",
    objective: "Objetivo de Nivel {{level}}",
    objectiveText: "Consigue 💵 {{amount}}",
    day: "Día",
    nextDay: "Siguiente Día",

    // Shop & Gameplay
    buy: "Comprar",
    sell: "Vender",
    fish: "Pez",
    noFishInCell: "No hay peces en esta celda.",
    overcrowded: "⚠️Superpoblado⚠️",

    // Special Event
    specialEvent: "Evento especial: {{event}}",
    none: "Ninguno",
    heatwave: "Ola de calor",
    storm: "Tormenta",

    // Cell Info
    cell: "Celda",
    sunlight: "☀️ Sol",
    food: "🍎 Alimento",
    growth: "Crecimiento",
    value: "Valor",

    // Win/Lose Messages
    wonText: "¡Ganaste en {{days}} días!",
    loseText: "¡Fin del juego!",
    gameWon: "¡Felicidades! ¡Has completado el juego!",
    nextLevel: "Siguiente nivel",

    // Save/Load Buttons
    saveGame: "Guardar Partida",
    loadGame: "Cargar Partida",
    listSaveSlots: "Mostrar Ranuras Guardadas",
    deleteSaveSlot: "Eliminar Ranura Guardada",

    // Save/Load/Delete Prompts
    savePrompt:
      "Introduce el nombre de la ranura para guardar (por ejemplo: Slot1):",
    loadPrompt:
      "Introduce el nombre de la ranura para cargar (por ejemplo: Slot1):",
    deletePrompt:
      "Introduce el nombre de la ranura para eliminar (por ejemplo: Slot1):",

    // Save/Load/Delete Alerts
    noSaveData: 'No se encontraron datos guardados para la ranura "{{slot}}".',
    gameLoaded: 'Juego cargado desde la ranura "{{slot}}".',
    slotDeleted: 'La ranura guardada "{{slot}}" ha sido eliminada.',
    availableSlots: "Ranuras guardadas disponibles:\n{{slots}}",

    // Fish Types
    Red: "Rojo",
    Green: "Verde",
    Yellow: "Amarillo",

    // Fish Descriptions
    GreenFishDescription:
      "A los peces verdes les gusta vivir en grupos de su propia especie y no toleran la luz solar extrema.",
    YellowFishDescription:
      "A los peces amarillos les gusta la luz del sol y convivir con peces de otros tipos.",
    RedFishDescription:
      "A los peces rojos les gusta la luz solar baja y no toleran a los de su propia especie.",
  },
  ar: {
    // Titles & Main UI
    title: "مزرعة الأسماك",
    shop: "المتجر",
    tutorialObjective: "هدف البرنامج التعليمي",
    objective: "{{level}} الهدف من المستوى",
    objectiveText: "اكسب 💵 {{amount}}",
    day: "يوم",
    nextDay: "اليوم التالي",

    // Shop & Gameplay
    buy: "شراء",
    sell: "بيع",
    fish: "سمكة",
    noFishInCell: "لا يوجد أسماك في هذه الخلية.",
    overcrowded: "⚠️مكتظه⚠️",

    // Special Event
    specialEvent: "حدث خاص: {{event}}",
    none: "اي",
    heatwave: "موجة الحر",
    storm: "عاصفة",

    // Cell Info
    cell: "خلية",
    sunlight: "☀️ الشمس",
    food: "🍎 الطعام",
    growth: "النمو",
    value: "القيمة",

    // Win/Lose Messages
    wonText: "فزت في {{days}} يومًا!",
    loseText: "انتهت اللعبة!",
    gameWon: "مبروك! لقد أكملت اللعبة!",
    nextLevel: "المستوى التالي",

    // Save/Load Buttons
    saveGame: "حفظ اللعبة",
    loadGame: "تحميل اللعبة",
    listSaveSlots: "عرض ملفات الحفظ",
    deleteSaveSlot: "حذف ملف الحفظ",

    // Save/Load/Delete Prompts
    savePrompt: "أدخل اسم خانة الحفظ (مثال: Slot1):",
    loadPrompt: "أدخل اسم خانة التحميل (مثال: Slot1):",
    deletePrompt: "أدخل اسم خانة الحذف (مثال: Slot1):",

    // Save/Load/Delete Alerts
    noSaveData: 'لا توجد بيانات حفظ في الخانة "{{slot}}".',
    gameLoaded: 'تم تحميل اللعبة من الخانة "{{slot}}".',
    slotDeleted: 'تم حذف خانة الحفظ "{{slot}}".',
    availableSlots: "خانات الحفظ المتوفرة:\n{{slots}}",

    // Fish Types
    Red: "أحمر",
    Green: "أخضر",
    Yellow: "أصفر",

    // Fish Descriptions
    GreenFishDescription:
      "تحب الأسماك الخضراء العيش في مجموعات من نوعها ولا تتسامح مع أشعة الشمس الشديدة.",
    YellowFishDescription:
      "الأسماك الصفراء مثل أشعة الشمس العالية وتعيش مع الأسماك من أنواع أخرى.",
    RedFishDescription:
      "الأسماك الحمراء تحب ضوء الشمس المنخفض ولا تتسامح مع نوعها.",
  },
};
