export const emojiToCode = {
    // Standard Mappings (from usernameRenderer)
    "🪐": "@",
    "🌙": ".",
    "⭐": "*",
    "☄️": "/",
    "✨": "\"",
    "🌟": "_",
    "📷": "[]",
    "🚀": "%",
    "🔥": "#",
    "🌍": "()",
    "🎨": "{}",
    "🌊": "^",
    "⚡": "\\", // Backslash
    "☀️": "<()",
    "🌸": "-()", // Updated Flower code
    "🍄": "?",
    "🙂": ":)",
    "❤️": "<3",
    "🎵": "(:)",
    "🛸": "(0)", // Alien Ship
    "👽": "(8)", // Alien Head
    "🌌": "(@)", // Galaxy

    // Additional from prompt (verified or added for completeness)
    "🌱": "<|"
};

// Array for picker iteration (ordered by relevance/type)
export const ALL_PICKER_EMOJIS = [
    "🪐", "🌙", "⭐", "☄️", "✨", "🌟",
    "📷", "🚀", "🔥", "🌍", "🎨", "🌊",
    "⚡", "☀️", "🌸", "🌱", "🍄",
    "🙂", "❤️", "🎵", "🛸", "👽", "🌌"
];
