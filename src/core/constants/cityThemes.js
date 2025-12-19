// --- PANOSPACE BRAND PALETTE ---
export const BRAND_COLORS = {
    iceWhite: '#F2F7FA',
    auroraBlue: '#7FDBFF',
    ionBlue: '#1B82FF',
    nebulaPink: '#FFB7D5',
    solarPink: '#FF5C8A',
    cosmicPeriwinkle: '#A7B6FF',
    deepOrbitPurple: '#5A3FFF',
    stellarOrange: '#FF914D',
    classicMint: '#7FFFD4',
    auroraMint: '#8CFFE9',
    darkNebula: '#0A1A3A',
    voidPurple: '#2A0E61',
    black: '#000000'
};

// --- THEME CONFIGURATIONS ---
export const CITY_THEMES = {
    // 1. Galaxy City (Formerly Vaporwave)
    'city_vaporwave': {
        name: 'Galaxy City',
        sky: [BRAND_COLORS.voidPurple, BRAND_COLORS.deepOrbitPurple],
        buildings: { color: '#1a0b2e', windowColor: [BRAND_COLORS.auroraBlue, BRAND_COLORS.solarPink], density: 0.6, glow: true },
        atmosphere: { stars: true, grid: true, clouds: true },
        celestial: { type: 'ring-planet', color: BRAND_COLORS.iceWhite, x: 0.85, y: 0.2 }
    },
    // 1.5 NEW SPACE CITY (NASA Punk)
    'city_space': {
        name: 'Space City',
        sky: [BRAND_COLORS.black, BRAND_COLORS.darkNebula, BRAND_COLORS.ionBlue],
        buildings: {
            color: '#05070a',
            windowColor: [BRAND_COLORS.iceWhite, BRAND_COLORS.auroraBlue, BRAND_COLORS.classicMint, BRAND_COLORS.solarPink, BRAND_COLORS.ionBlue, BRAND_COLORS.stellarOrange],
            density: 0.95,
            glow: true
        },
        atmosphere: {
            stars: true,
            traffic: true,
            ultra_fx: true,
            rocket: true
        },
        celestial: { type: 'ring-planet', color: BRAND_COLORS.iceWhite, x: 0.5, y: 0.35 }
    },
    // 1.6 LUNAR CITY
    'city_lunar': {
        name: 'Lunar City',
        sky: [BRAND_COLORS.black, '#050505'], // Pure space
        buildings: {
            color: '#1a202c', // Dark Grey
            windowColor: [BRAND_COLORS.ionBlue, BRAND_COLORS.iceWhite],
            density: 0.4,
            glow: true
        },
        atmosphere: { stars: true },
        celestial: { type: 'earth_rise', x: 0.2, y: 0.3 },
        foreground: { type: 'lunar_surface', color: '#050505' }
    },

    'city_retrowave': {
        name: 'Retrowave',
        sky: [BRAND_COLORS.voidPurple, BRAND_COLORS.black],
        buildings: { color: '#000', windowColor: [BRAND_COLORS.auroraMint, BRAND_COLORS.solarPink], density: 0.3, glow: true },
        atmosphere: { stars: true, grid: true },
        celestial: { type: 'none' }
    },
    'city_cyberpunk': {
        name: 'Cyberpunk',
        sky: [BRAND_COLORS.black, '#0a0a0a'],
        buildings: { color: '#050505', windowColor: [BRAND_COLORS.ionBlue, BRAND_COLORS.classicMint, BRAND_COLORS.solarPink], density: 1.0, glow: true },
        atmosphere: { rain: true, stars: true, fog: BRAND_COLORS.darkNebula },
        celestial: { type: 'none' }
    },
    'city_color': {
        name: 'Color City',
        sky: [BRAND_COLORS.ionBlue, BRAND_COLORS.auroraBlue, '#dbeafe'],
        buildings: {
            color: '#1e293b',
            windowColor: [BRAND_COLORS.iceWhite, BRAND_COLORS.classicMint, BRAND_COLORS.solarPink, BRAND_COLORS.ionBlue, BRAND_COLORS.stellarOrange, BRAND_COLORS.nebulaPink],
            density: 0.8,
            glow: true
        },
        mountains: { color: '#0f172a', height: 0.6 },
        atmosphere: { stars: true, clouds: true },
        celestial: { type: 'moon', color: '#fff', x: 0.8, y: 0.2 }
    },
    'city_realistic_day': {
        name: 'Midnight City', // Based on ID 'city_realistic_day' but comments say 'Dark Night Buildings' and 'Night Sky'. The key name is confusing but config looks like night. 
        // User commented: city_realistic_day ... sky: black ... buildings: Dark Night. 
        // I will name it "Metropolis Night" to be safe.
        sky: [BRAND_COLORS.black, '#0a0a1a', '#1a1a2e'],
        buildings: {
            color: '#050508',
            windowColor: [BRAND_COLORS.iceWhite, BRAND_COLORS.iceWhite, '#ffffff', '#ffffff', '#fffde7', '#fffde7', '#fff176', '#fff176', '#ffd740', '#ffb74d', '#ff9800', '#f57c00'],
            density: 0.8,
            glow: true
        },
        atmosphere: { stars: true, clouds: false },
        celestial: { type: 'distant_jet', color: BRAND_COLORS.solarPink }
    },
    'city_midnight': {
        name: 'Anime Midnight',
        sky: ['#020617', '#172554', '#1e1b4b'],
        buildings: { color: '#0f172a', windowColor: ['#fef9c3', '#fde047', '#fbbf24'], density: 0.9, glow: true },
        mountains: { color: '#020617', height: 0.5 },
        atmosphere: { stars: true, clouds: true, traffic: true },
        celestial: { type: 'moon', color: '#f1f5f9', x: 0.85, y: 0.15 }
    },
    'city_desert': {
        name: 'Desert City',
        sky: [BRAND_COLORS.voidPurple, BRAND_COLORS.stellarOrange],
        buildings: { color: BRAND_COLORS.black, windowColor: [BRAND_COLORS.stellarOrange], density: 0.4, glow: true },
        atmosphere: { stars: true },
        foreground: { type: 'dunes', color: BRAND_COLORS.darkNebula },
        celestial: { type: 'sun', color: [BRAND_COLORS.stellarOrange, BRAND_COLORS.solarPink], y: 0.8 }
    },
    'city_glitch': {
        name: 'Glitch City',
        sky: [BRAND_COLORS.black, BRAND_COLORS.darkNebula],
        buildings: { color: '#000', windowColor: [BRAND_COLORS.classicMint, BRAND_COLORS.solarPink, BRAND_COLORS.ionBlue, BRAND_COLORS.iceWhite], density: 1.0, glow: true },
        atmosphere: { glitch: true, stars: true },
        celestial: { type: 'none' }
    },

    'city3000_street': {
        name: 'Neon Street',
        sky: [BRAND_COLORS.black, BRAND_COLORS.darkNebula, '#1A0B2E'],
        buildings: { color: '#080808', windowColor: [BRAND_COLORS.ionBlue, BRAND_COLORS.solarPink, BRAND_COLORS.classicMint], density: 1.2, glow: true },
        atmosphere: { rain: true, stars: true, traffic: true },
        celestial: { type: 'none' }
    },
    'city3000_cars': {
        name: 'Sky Traffic',
        sky: [BRAND_COLORS.black, BRAND_COLORS.darkNebula],
        buildings: { color: '#050505', windowColor: [BRAND_COLORS.ionBlue, BRAND_COLORS.classicMint], density: 1.1, glow: true },
        atmosphere: { stars: true, traffic: true },
        celestial: { type: 'none' }
    },
    'city3000_chinatown': {
        name: 'Cyber Chinatown',
        sky: [BRAND_COLORS.black, '#1a0505'],
        buildings: { color: '#0f0505', windowColor: [BRAND_COLORS.stellarOrange, BRAND_COLORS.solarPink, '#ff3333'], density: 1.0, glow: true },
        atmosphere: { stars: true, rain: true, monorail: true },
        celestial: { type: 'none' }
    },
    'city3000_ultra': {
        name: 'Panospace Ultra',
        sky: [BRAND_COLORS.black, BRAND_COLORS.voidPurple, BRAND_COLORS.deepOrbitPurple, BRAND_COLORS.ionBlue],
        buildings: {
            color: '#020204',
            windowColor: [BRAND_COLORS.solarPink, BRAND_COLORS.auroraMint, BRAND_COLORS.ionBlue, BRAND_COLORS.iceWhite],
            density: 1.3,
            glow: true
        },
        atmosphere: {
            stars: true,
            ultra_fx: true,
            traffic: true,
            rain: true,
            fog: BRAND_COLORS.deepOrbitPurple
        },
        celestial: {
            type: 'prime_planet',
            color: BRAND_COLORS.iceWhite,
            x: 0.5, y: 0.4
        },
        foreground: {
            type: 'prime_mountains'
        }
    },
    'city3000_genesis': {
        name: 'Neo-Tokyo Genesis',
        sky: [BRAND_COLORS.black, BRAND_COLORS.deepOrbitPurple, BRAND_COLORS.solarPink],
        buildings: {
            color: '#020101',
            windowColor: [BRAND_COLORS.stellarOrange, BRAND_COLORS.solarPink, BRAND_COLORS.ionBlue, BRAND_COLORS.classicMint],
            density: 0.95,
            glow: true
        },
        atmosphere: {
            stars: true,
            neotokyo_fx: true
        },
        celestial: {
            type: 'neo_sun',
            color: BRAND_COLORS.solarPink
        }
    },
    'panospace_beyond': {
        name: 'Panospace Beyond',
        sky: [
            BRAND_COLORS.black,
            BRAND_COLORS.voidPurple,
            BRAND_COLORS.deepOrbitPurple
        ],
        buildings: {
            color: BRAND_COLORS.black,
            windowColor: [
                BRAND_COLORS.ionBlue,
                BRAND_COLORS.solarPink,
                BRAND_COLORS.auroraMint
            ],
            density: 1.15,
            glow: true
        },
        atmosphere: {
            stars: true,
            fog: BRAND_COLORS.deepOrbitPurple,
            beyond_fx: true
        },
        celestial: {
            type: "moon",
            color: BRAND_COLORS.iceWhite,
            x: 0.75,
            y: 0.22
        }
    },
    'city3000_festival': {
        name: 'Neon Festival',
        sky: [BRAND_COLORS.black, BRAND_COLORS.deepOrbitPurple, '#000'],
        buildings: {
            color: '#050308',
            windowColor: [BRAND_COLORS.classicMint, BRAND_COLORS.solarPink, BRAND_COLORS.ionBlue, BRAND_COLORS.auroraMint],
            density: 0.7,
            centerGap: 0.4,
            glow: true
        },
        atmosphere: {
            stars: true
        },
        celestial: {
            type: 'moon',
            color: BRAND_COLORS.iceWhite,
            x: 0.8, y: 0.2
        },
        foreground: {
            type: 'festival_terrain'
        }
    }
};

// --- TIME-AWARE CITY LOGIC ---
/**
 * Generates a dynamic city configuration based on the current time and season.
 * @param {Date} date - Optional date to simulate time
 * @returns {Object} City theme configuration
 */
export const getTimeAwareCityTheme = (date = new Date()) => {
    const hour = date.getHours();
    const month = date.getMonth(); // 0-11

    // 1. Determine Time State
    let state = 'day';
    if (hour >= 0 && hour < 5) state = 'late_night';
    else if (hour >= 5 && hour < 8) state = 'dawn';
    else if (hour >= 8 && hour < 16) state = 'day';
    else if (hour >= 16 && hour < 19) state = 'golden_hour';
    else if (hour >= 19 && hour < 22) state = 'night';
    else state = 'midnight';

    // 2. Base Configuration Generation
    const config = {
        name: 'Omni City (Time Aware)',
        density: 1.0,
        glow: true
    };

    switch (state) {
        case 'late_night':
            config.sky = [BRAND_COLORS.black, '#02050a', BRAND_COLORS.voidPurple];
            config.buildings = {
                color: '#010103',
                windowColor: [BRAND_COLORS.ionBlue, BRAND_COLORS.deepOrbitPurple, '#4A90E2'],
                density: 0.9,
                glow: true
            };
            config.celestial = { type: 'moon', color: BRAND_COLORS.iceWhite, x: 0.2, y: 0.15 };
            config.atmosphere = { stars: true, fog: BRAND_COLORS.voidPurple, digital_hud: true };
            break;

        case 'dawn':
            config.sky = ['#1a1a2e', BRAND_COLORS.deepOrbitPurple, BRAND_COLORS.nebulaPink];
            config.buildings = {
                color: '#0f0f1a',
                windowColor: [BRAND_COLORS.iceWhite, BRAND_COLORS.nebulaPink],
                density: 1.1,
                glow: false
            };
            config.celestial = { type: 'sun', color: BRAND_COLORS.nebulaPink, x: 0.1, y: 0.7 };
            config.atmosphere = { clouds: true, stars: false };
            break;

        case 'day':
            config.sky = [BRAND_COLORS.ionBlue, BRAND_COLORS.auroraBlue, BRAND_COLORS.iceWhite];
            config.buildings = {
                color: '#1e293b',
                windowColor: ['#ffffff', '#f8fafc'],
                density: 1.2,
                glow: false
            };
            config.celestial = { type: 'sun', color: '#fffdf0', x: 0.5, y: 0.2 };
            config.atmosphere = { clouds: true, stars: false };
            break;

        case 'golden_hour':
            config.sky = [BRAND_COLORS.voidPurple, BRAND_COLORS.solarPink, BRAND_COLORS.stellarOrange];
            config.buildings = {
                color: '#1a0d00',
                windowColor: [BRAND_COLORS.stellarOrange, BRAND_COLORS.solarPink],
                density: 1.0,
                glow: true
            };
            config.celestial = { type: 'sun', color: [BRAND_COLORS.stellarOrange, BRAND_COLORS.solarPink], x: 0.8, y: 0.6 };
            config.atmosphere = { clouds: true, stars: false };
            break;

        case 'night':
            config.sky = [BRAND_COLORS.black, BRAND_COLORS.voidPurple, '#1a1a2e'];
            config.buildings = {
                color: '#050508',
                windowColor: [BRAND_COLORS.ionBlue, BRAND_COLORS.solarPink, BRAND_COLORS.classicMint],
                density: 1.3,
                glow: true
            };
            config.celestial = { type: 'distant_jet', color: BRAND_COLORS.solarPink };
            config.atmosphere = { stars: true, traffic: true, digital_hud: true };
            break;

        case 'midnight':
            config.sky = [BRAND_COLORS.black, '#020205'];
            config.buildings = {
                color: '#000',
                windowColor: [BRAND_COLORS.ionBlue, BRAND_COLORS.solarPink],
                density: 0.8,
                glow: true
            };
            config.celestial = { type: 'moon', color: BRAND_COLORS.iceWhite, x: 0.85, y: 0.2 };
            config.atmosphere = { stars: true, grid: true, digital_hud: true }; // PS2 vibes at midnight
            break;

        default:
            config.sky = [BRAND_COLORS.black, BRAND_COLORS.darkNebula];
            config.buildings = { color: '#050505', windowColor: [BRAND_COLORS.iceWhite], density: 1.0, glow: true };
            break;
    }

    // 3. Seasonal Subtle Shift (Winter Snow)
    if (month === 11 || month === 0 || month === 1) { // Dec, Jan, Feb
        if (!config.atmosphere) config.atmosphere = {};
        config.atmosphere.snow = true;
    }

    return config;
};
