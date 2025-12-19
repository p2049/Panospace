export const BANNER_TYPES = [
    {
        id: 'stars',
        label: 'Stars',
        previewGradient: 'linear-gradient(to bottom, #000000, #111111)',
        description: 'Classic cosmic starfield'
    },
    {
        id: 'nebula',
        label: 'Nebula',
        previewGradient: 'linear-gradient(135deg, #2D1B4E, #000000)',
        description: 'Deep space nebula clouds'
    },
    {
        id: 'cosmic-earth',
        label: 'Earth',
        previewGradient: 'linear-gradient(110deg, #004a9f 0%, #000 60%)',
        needsColor: false,
        description: 'View of Earth from space'
    },
    {
        id: 'planet',
        label: 'Planet',
        previewGradient: 'linear-gradient(to right, #1B82FF, #5A3FFF)',
        needsColor: false,
        isCosmic: true,
        description: 'Apple-style glowing planet border'
    },
    {
        id: 'ice-planet',
        label: 'Ice Planet',
        previewGradient: 'linear-gradient(to bottom, #7FFFD4, #1B82FF)',
        needsColor: false,
        isCosmic: true,
        description: 'Frozen world with aurora borealis'
    },
    {
        id: 'northern-lights',
        label: 'Northern Lights',
        previewGradient: 'linear-gradient(to right, #00ff88, #5A3FFF)',
        needsColor: false,
        isCosmic: true,
        description: 'Intense magnetic storm'
    },

    {
        id: 'simple_gradient',
        label: 'Simple Gradient',
        previewGradient: 'linear-gradient(to right, #7FFFD4, #00CED1)',
        needsColor: true,
        description: 'Clean two-tone fade'
    },
    {
        id: 'gradient',
        label: 'Gradient',
        previewGradient: 'linear-gradient(45deg, #FF00CC, #333399)',
        description: 'Your unlocked gradients'
    },
    {
        id: 'cyberpunkLines',
        label: 'Grid',
        previewGradient: 'linear-gradient(90deg, #000 90%, #7FFFD4 100%)',
        needsColor: true,
        description: 'Y2K neon tech grid'
    },
    {
        id: 'neonGrid',
        label: 'Neon',
        previewGradient: 'linear-gradient(to top, #220033, #000)',
        needsColor: true,
        description: 'Retro synthwave horizon'
    },
    {
        id: 'underwaterY2K',
        label: 'Underwater',
        previewGradient: 'linear-gradient(to bottom, #00BCD4, #E0F7FA)',
        needsColor: true,
        description: 'Classic Mario atmospheric depth'
    },


    // --- CITYSCAPE PACK ---
    {
        id: 'city_vaporwave',
        label: 'Galaxy City',
        previewGradient: 'linear-gradient(to bottom, #5A3FFF, #FFB7D5)',
        needsColor: false,
        description: 'Cosmic metropolis & ring planet'
    },
    {
        id: 'city_space',
        label: 'Space City',
        previewGradient: 'linear-gradient(to bottom, #000000, #1B82FF)',
        needsColor: false,
        description: 'Futuristic NASA-punk horizon'
    },
    {
        id: 'city_lunar',
        label: 'Lunar City',
        previewGradient: 'linear-gradient(to bottom, #000, #FFF)',
        needsColor: false,
        description: 'NASA Moon Base & Earthrise'
    },
    {
        id: 'city_realistic',
        label: 'Night City',
        previewGradient: 'linear-gradient(to bottom, #000, #1b263b)',
        needsColor: false,
        description: 'Cozy modern skyline lights'
    },
    {
        id: 'city_retrowave',
        label: 'Ocean City',
        previewGradient: 'linear-gradient(to bottom, #2A0E61, #FF5C8A)',
        needsColor: false,
        description: 'Split-sun retro horizon'
    },
    {
        id: 'city_cyberpunk',
        label: 'Cyberpunk Rain',
        previewGradient: 'linear-gradient(to bottom, #000, #1B82FF)',
        needsColor: false,
        description: 'Holograms & wet streets'
    },
    {
        id: 'city_realistic_day',
        label: 'Realistic City',
        previewGradient: 'linear-gradient(to bottom, #000, #1b263b)',
        needsColor: false,
        description: 'Realistic night skyline'
    },
    {
        id: 'city_color',
        label: 'Color City',
        previewGradient: 'linear-gradient(to bottom, #1B82FF, #dbeafe)',
        needsColor: false,
        description: 'Multi-color modern skyline'
    },
    {
        id: 'city_desert',
        label: 'Desert City',
        previewGradient: 'linear-gradient(to bottom, #2A0E61, #FF914D)',
        needsColor: false,
        description: 'Neon city on dunes'
    },
    {
        id: 'city_glitch',
        label: 'System Glitch',
        previewGradient: 'linear-gradient(to right, #000, #7FFFD4, #FF5C8A, #1B82FF)',
        needsColor: false,
        description: 'Chaotic digital corruption'
    },


    // --- CITY-3000 PACK ---
    {
        id: 'city3000_street',
        label: 'Neon Alley 3000',
        previewGradient: 'linear-gradient(to bottom, #0A1A3A, #FF5C8A)',
        needsColor: false,
        description: 'Rainy street pixel art'
    },
    {
        id: 'city3000_cars',
        label: 'Flying Cars 3000',
        previewGradient: 'linear-gradient(to bottom, #000, #1B82FF)',
        needsColor: false,
        description: 'Traffic in the clouds'
    },
    {
        id: 'city3000_chinatown',
        label: 'Chinatown Rail 3000',
        previewGradient: 'linear-gradient(to bottom, #1a0505, #FF914D)',
        needsColor: false,
        description: 'Monorail & market lights'
    },
    {
        id: 'city3000_ultra',
        label: 'Panospace Ultra',
        previewGradient: 'linear-gradient(to bottom, #5A3FFF, #1B82FF, #FF5C8A)',
        needsColor: false,
        description: 'The Ultimate Mashup'
    },
    {
        id: 'city3000_genesis',
        label: 'Neo-Tokyo 2099',
        previewGradient: 'linear-gradient(to bottom, #050510 0%, #FF5C8A 50%, #5A3FFF 100%)',
        needsColor: false,
        description: 'Cyber-Noir Megastructure'
    },
    {
        id: 'city3000_festival',
        label: 'Neon Festival',
        previewGradient: 'linear-gradient(to bottom, #000 0%, #5A3FFF 50%, #7FFFD4 100%)',
        needsColor: false,
        description: 'Fireworks over the bay'
    },
    {
        id: 'panospace_beyond',
        label: 'PanoSpace Beyond',
        previewGradient: 'linear-gradient(to bottom, #2A0E61 0%, #5A3FFF 50%, #000 100%)',
        needsColor: false,
        description: 'Neo-Gothic Future Megacity'
    },

    // --- OCEAN PACK ---
    {
        id: 'ocean_sunset_classic',
        label: 'Sunset Classic',
        previewGradient: 'linear-gradient(to bottom, #2A0E61, #FF914D)',
        needsColor: false,
        description: 'Ocean dunes & orange sun'
    },
    {
        id: 'ocean_sunset_vapor',
        label: 'Vapor Sunset',
        previewGradient: 'linear-gradient(to bottom, #5A3FFF, #FFB7D5)',
        needsColor: false,
        description: 'Retrowave sun & palms'
    },
    {
        id: 'ocean_sunset_pastel',
        label: 'Night Ocean',
        previewGradient: 'linear-gradient(to bottom, #A7B6FF, #FFB7D5)',
        needsColor: false,
        description: 'Moonlit periwinkle waters'
    },
    {
        id: 'ocean_night_bio',
        label: 'Biolum Night',
        previewGradient: 'linear-gradient(to bottom, #000, #8CFFE9)',
        needsColor: false,
        description: 'Glowing neon water'
    },

    {
        id: 'ocean_tropical_emerald',
        label: 'Emerald Tropical',
        previewGradient: 'linear-gradient(to bottom, #002220, #7FFFD4)',
        needsColor: false,
        description: 'Green night & palms'
    },
    {
        id: 'ocean_volcano',
        label: 'Volcano Island',
        previewGradient: 'linear-gradient(to bottom, #000, #ff3333)',
        needsColor: false,
        description: 'Lava flows & smoke'
    },
    {
        id: 'ps2_2000',
        label: '2000',
        previewGradient: 'linear-gradient(to bottom, #000000, #1B82FF)',
        needsColor: false,
        description: 'PS2 inspired abstract console vibes'
    },
    {
        id: 'deep_underwater',
        label: 'Deep Underwater',
        previewGradient: 'linear-gradient(to bottom, #010408, #0D2B36)',
        needsColor: false,
        description: 'Atmospheric depth in the deep blue abyss'
    }
];
