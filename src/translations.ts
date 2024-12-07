export type TranslationKeys =
  | "title"
  | "shop"
  | "objective"
  | "objectiveText"
  | "day"
  | "nextDay"
  | "fish"
  | "buy"
  | "sell"
  | "noFishInCell"
  | "cell"
  | "sunlight"
  | "food"
  | "growth"
  | "value"
  | "wonText"
  | "loseText"
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

    // Shop & Gameplay
    buy: "Buy",
    sell: "Sell",
    fish: "Fish",
    noFishInCell: "No fish in this cell.",

    // Cell Info
    cell: "Cell",
    sunlight: "☀️ Sunlight",
    food: "🍎 Food",
    growth: "Growth",
    value: "Value",

    // Win/Lose Messages
    wonText: "You won in {{days}} days!",
    loseText: "Game Over!",

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
  },
  es: {
    // Titles & Main UI
    title: "Granja de Peces",
    shop: "Tienda",
    objective: "Objetivo",
    objectiveText: "Consigue 💵 {{amount}}",
    day: "Día",
    nextDay: "Siguiente Día",

    // Shop & Gameplay
    buy: "Comprar",
    sell: "Vender",
    fish: "Pez",
    noFishInCell: "No hay peces en esta celda.",

    // Cell Info
    cell: "Celda",
    sunlight: "☀️ Sol",
    food: "🍎 Alimento",
    growth: "Crecimiento",
    value: "Valor",

    // Win/Lose Messages
    wonText: "¡Ganaste en {{days}} días!",
    loseText: "¡Fin del juego!",

    // Save/Load Buttons
    saveGame: "Guardar Partida",
    loadGame: "Cargar Partida",
    listSaveSlots: "Mostrar Ranuras Guardadas",
    deleteSaveSlot: "Eliminar Ranura Guardada",

    // Save/Load/Delete Prompts
    savePrompt: "Introduce el nombre de la ranura para guardar (por ejemplo: Slot1):",
    loadPrompt: "Introduce el nombre de la ranura para cargar (por ejemplo: Slot1):",
    deletePrompt: "Introduce el nombre de la ranura para eliminar (por ejemplo: Slot1):",

    // Save/Load/Delete Alerts
    noSaveData: 'No se encontraron datos guardados para la ranura "{{slot}}".',
    gameLoaded: 'Juego cargado desde la ranura "{{slot}}".',
    slotDeleted: 'La ranura guardada "{{slot}}" ha sido eliminada.',
    availableSlots: "Ranuras guardadas disponibles:\n{{slots}}",

    // Fish Types
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

    // Shop & Gameplay
    buy: "شراء",
    sell: "بيع",
    fish: "سمكة",
    noFishInCell: "لا يوجد أسماك في هذه الخلية.",

    // Cell Info
    cell: "خلية",
    sunlight: "☀️ الشمس",
    food: "🍎 الطعام",
    growth: "النمو",
    value: "القيمة",

    // Win/Lose Messages
    wonText: "فزت في {{days}} يومًا!",
    loseText: "انتهت اللعبة!",

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
  },
};