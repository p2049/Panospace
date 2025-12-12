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
        label: 'Cyberpunk Lines',
        previewGradient: 'linear-gradient(90deg, #000 90%, #7FFFD4 100%)',
        needsColor: true,
        description: 'Y2K neon circuitry'
    },
    {
        id: 'neonGrid',
        label: 'Neon Grid',
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
    {
        id: 'ocean_depths',
        label: 'Pano Ocean',
        previewGradient: 'linear-gradient(to bottom, #7FFFD4, #1B82FF, #000)',
        needsColor: false, // Fixed palette
        description: 'Signature PanoSpace deep sea'
    },
    {
        id: 'orbital',
        label: 'Orbital',
        previewGradient: 'linear-gradient(135deg, #0A1A3A 0%, #1B82FF 50%, #8CFFE9 100%)',
        needsColor: false,
        description: 'Planetary rim light & cosmic depth'
    },
    // --- CITYSCAPE PACK ---
    {
        id: 'city_vaporwave',
        label: 'Vaporwave City',
        previewGradient: 'linear-gradient(to bottom, #5A3FFF, #FFB7D5)',
        needsColor: false,
        description: 'Neon sunset & dreamy vibes'
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
        label: 'Retrowave Sun',
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
        id: 'city_minimal',
        label: 'Minimal City',
        previewGradient: 'linear-gradient(to bottom, #7FDBFF, #F2F7FA)',
        needsColor: false,
        description: 'Clean silhouette skyline'
    },
    {
        id: 'city_anime',
        label: 'Anime Town',
        previewGradient: 'linear-gradient(to bottom, #1B82FF, #dbeafe)',
        needsColor: false,
        description: 'Cozy mountain village vibe'
    },
    {
        id: 'city_desert',
        label: 'Synth Desert',
        previewGradient: 'linear-gradient(to bottom, #2A0E61, #FF914D)',
        needsColor: false,
        description: 'Neon city on dunes'
    },
    {
        id: 'city_glitch',
        label: 'Glitch Metro',
        previewGradient: 'linear-gradient(to bottom, #000, #7FFFD4)',
        needsColor: false,
        description: 'Chaotic data-moshed sky'
    },
    {
        id: 'city_aero',
        label: 'Aero Citadel',
        previewGradient: 'linear-gradient(to bottom, #1B82FF, #8CFFE9)',
        needsColor: false,
        description: 'Floating minty islands'
    },
    {
        id: 'city_smog',
        label: 'Neon Smog',
        previewGradient: 'linear-gradient(to bottom, #2A0E61, #111)',
        needsColor: false,
        description: 'Industrial heavy atmosphere'
    },
    {
        id: 'city_holo',
        label: 'Holo Grid',
        previewGradient: 'linear-gradient(to bottom, #000, #1B82FF)',
        needsColor: false,
        description: 'Wireframe virtual reality'
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
        label: 'Pastel Sunset',
        previewGradient: 'linear-gradient(to bottom, #A7B6FF, #FFB7D5)',
        needsColor: false,
        description: 'Dreamy soft twilight'
    },
    {
        id: 'ocean_night_bio',
        label: 'Biolum Night',
        previewGradient: 'linear-gradient(to bottom, #000, #8CFFE9)',
        needsColor: false,
        description: 'Glowing neon water'
    },
    {
        id: 'ocean_storm_electric',
        label: 'Electric Storm',
        previewGradient: 'linear-gradient(to bottom, #001a33, #1B82FF)',
        needsColor: false,
        description: 'Lightning & teal rain'
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
    }

];
