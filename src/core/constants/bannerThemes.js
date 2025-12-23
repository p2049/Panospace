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
        id: 'iso_wave',
        label: 'Live Wave',
        previewGradient: 'linear-gradient(to bottom, #000000, #5A3FFF)',
        needsColor: true,
        description: 'A topography of silence.',
        customVariants: [
            { id: 'classic_mint', name: 'Classic Mint', color: '#7FFFD4' },
            { id: 'solar_pink', name: 'Solar Pink', color: '#FF5C8A' },
            { id: 'ion_blue', name: 'Ion Blue', color: '#1B82FF' },
            { id: 'deep_orbit', name: 'Deep Orbit', color: '#5A3FFF' },
            { id: 'stellar_orange', name: 'Stellar Orange', color: '#FF914D' },
            { id: 'ice_white', name: 'Ice White', color: '#FFFFFF' }
        ]
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
        id: 'cosmic_dreamworld',
        label: 'Stardust Playground',
        previewGradient: 'linear-gradient(to top, #FFB7D5, #7FDBFF, #2A0E61)',
        needsColor: false,
        isCosmic: true,
        description: 'Childlike wonderland of spacetime'
    },
    {
        id: 'technicolor_hardware',
        label: 'Technicolor',
        previewGradient: 'linear-gradient(135deg, #1B82FF, #FF5C8A, #7FFFD4)',
        needsColor: true,
        description: 'Y2K Translucent Hardware (Coded Materiality)',
        customVariants: [
            { id: 'brand_rainbow', name: 'Brand Rainbow', color: 'linear-gradient(135deg, #1B82FF, #FF5C8A, #7FFFD4)' },
            { id: 'classic_mint', name: 'Classic Mint', color: '#7FFFD4' },
            { id: 'solar_pink', name: 'Solar Pink', color: '#FF5C8A' },
            { id: 'ion_blue', name: 'Ion Blue', color: '#1B82FF' },
            { id: 'deep_orbit', name: 'Deep Orbit', color: '#5A3FFF' },
            { id: 'stellar_orange', name: 'Stellar Orange', color: '#FF914D' }
        ]
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
    {
        id: 'marmoris',
        label: 'Marmoris',
        previewGradient: 'linear-gradient(to bottom, #4a7c94, #1e4d5c)',
        needsColor: false,
        description: 'The shimmering, marble-like surface of the ocean'
    },
    {
        id: 'wave_grid',
        label: 'Wave Grid',
        previewGradient: 'linear-gradient(135deg, #5A3FFF, #1B82FF, #8CFFE9)',
        needsColor: false,
        description: 'Mesmerizing undulating grid of light'
    },

    // --- WINDOW BANNERS ---
    {
        id: 'window_train',
        label: 'Train',
        previewGradient: 'linear-gradient(to right, #1a1a1a 5%, #7FDBFF 50%, #1a1a1a 95%)',
        needsColor: true,
        description: 'View from a moving train',
        customVariants: [
            { id: 'train_space', name: 'Space City', color: 'linear-gradient(to bottom, #000000, #1B82FF)' },
            { id: 'train_lunar', name: 'Lunar City', color: 'linear-gradient(to bottom, #000, #FFF)' },
            { id: 'train_cyber', name: 'Cyberpunk', color: 'linear-gradient(to bottom, #2A0E61, #8CFFE9)' },
            { id: 'train_mars', name: 'Mars Colony', color: 'linear-gradient(to bottom, #2b0a0a, #FF914D)' },
            { id: 'train_neon', name: 'Neon City', color: 'linear-gradient(135deg, #FF5C8A, #1B82FF)' },
            { id: 'train_realistic', name: 'Realistic', color: 'linear-gradient(to bottom, #000, #1b263b)' },
            { id: 'train_color', name: 'Color City', color: 'linear-gradient(to bottom, #1B82FF, #dbeafe)' },
            { id: 'train_neotokyo', name: 'NeoTokyo', color: 'linear-gradient(to bottom, #2b0a0a, #ff0055)' }, // Red/Cyber
            { id: 'train_ultra', name: 'Panospace Ultra', color: 'linear-gradient(135deg, #7FDBFF, #FF5C8A, #5A3FFF, #1B82FF, #FF914D)' },
            { id: 'train_omni', name: 'Omni City (Live)', color: 'linear-gradient(to right, #7FDBFF, #FF914D, #2A0E61)' }
        ]
    },
    {
        id: 'window_shuttle',
        label: 'Shuttle Pod',
        previewGradient: 'linear-gradient(to bottom, #000 0%, #1B82FF 100%)',
        needsColor: true,
        description: 'Vertical ascent into space',
        customVariants: [
            { id: 'shuttle_orbit', name: 'Orbit', color: 'linear-gradient(to bottom, #000, #7FDBFF)' },
            { id: 'shuttle_deep', name: 'Deep Space', color: 'linear-gradient(to bottom, #000, #2A0E61)' },
            { id: 'shuttle_warp', name: 'Hyperdrive', color: 'linear-gradient(to bottom, #FFF, #1B82FF)' }
        ]
    },
    {
        id: 'window_plane',
        label: 'Plane',
        previewGradient: 'linear-gradient(to bottom, #050510, #1B82FF 50%, #000)',
        needsColor: true,
        description: 'Cozy night flight over a distant city',
        customVariants: [
            { id: 'plane_night', name: 'Night Flight', color: 'linear-gradient(to bottom, #050510, #1B82FF)' },
            { id: 'plane_sunset', name: 'Sunset Descent', color: 'linear-gradient(to bottom, #2A0E61, #FF914D)' },
            { id: 'plane_storm', name: 'Electric Storm', color: 'linear-gradient(to bottom, #000, #5A3FFF)' }
        ]
    },
    {
        id: 'window_metro',
        label: 'Metro',
        previewGradient: 'linear-gradient(to right, #111, #444, #111)',
        needsColor: true,
        description: 'Rhythmic transit through underground tunnels',
        customVariants: [
            { id: 'metro_tunnel', name: 'Deep Tunnel', color: 'linear-gradient(to right, #1a1a1a, #333)' },
            { id: 'metro_station', name: 'Neon Station', color: 'linear-gradient(to right, #1B82FF, #FF5C8A)' },
            { id: 'metro_glitch', name: 'System Error', color: 'linear-gradient(to right, #000, #7FFFD4)' }
        ]
    },

    // --- CITYSCAPE PACK ---
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
    {
        id: 'city_time_aware',
        label: 'Omni City (Time Aware)',
        previewGradient: 'linear-gradient(to right, #1B82FF, #FF5C8A, #FF914D)',
        needsColor: false,
        description: 'Atmospheric cityscape that changes with your local time'
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
        id: 'abstract_genesis_core',
        label: 'Genesis Core (Abstract)',
        previewGradient: 'radial-gradient(circle, #5A3FFF, #FF5C8A, #000)',
        needsColor: false,
        isCosmic: true,
        description: 'The primordial digital seed of humanity'
    },
    {
        id: 'abstract_neural_silk',
        label: 'Neural Silk (Abstract)',
        previewGradient: 'linear-gradient(45deg, #FF5C8A, #1B82FF, #8CFFE9)',
        needsColor: false,
        isCosmic: true,
        description: 'Breathtaking generative threads of light and data'
    },
    {
        id: 'abstract_singularity',
        label: 'The Singularity',
        previewGradient: 'linear-gradient(to top, #000, #5A3FFF, #FFF)',
        needsColor: false,
        isCosmic: true,
        description: 'Where data becomes matter'
    },
    {
        id: 'abstract_black_mirror',
        label: 'Black Mirror',
        previewGradient: 'radial-gradient(circle, #000 60%, #1B82FF)',
        needsColor: false,
        isCosmic: true,
        description: 'Liquid darkness and light'
    },
    {
        id: 'abstract_pinball',
        label: 'Hyperspace Cadet',
        previewGradient: 'radial-gradient(circle, #5A3FFF, #1B82FF, #000)',
        needsColor: false,
        isCosmic: true,
        description: 'Abstract velocity gate & mission data'
    },

    {
        id: 'deep_underwater',
        label: 'Deep Underwater',
        previewGradient: 'linear-gradient(to bottom, #010408, #0D2B36)',
        needsColor: false,
        description: 'Atmospheric depth in the deep blue abyss'
    },

    {
        id: 'cosmic_black_hole',
        label: 'Void Black Hole',
        previewGradient: 'radial-gradient(circle, #000 60%, #1a0505)',
        needsColor: false,
        isCosmic: true,
        description: 'The end of all things'
    },
    {
        id: 'northern-lights',
        label: 'Northern Lights',
        previewGradient: 'linear-gradient(to bottom, #000, #00ff88)',
        needsColor: false,
        needsVariant: true,
        hasAuroraVariants: true,
        isCosmic: true,
        description: 'Atmospheric ionization'
    },
    {
        id: 'aurora',
        label: 'Aurora',
        previewGradient: 'linear-gradient(to right, #2A0E61, #5A3FFF, #8CFFE9)',
        needsColor: false,
        needsVariant: true,
        hasAtmosVariants: true,
        isCosmic: true,
        description: 'The definitive Pano signature. Signal in the void.'
    },
    {
        id: 'cosmic_singularity_city',
        label: 'Cyber-Horizon',
        previewGradient: 'linear-gradient(to top, #000, #5A3FFF, #000)',
        needsColor: false,
        isCosmic: true,
        description: 'Metropolis at the edge of forever'
    },
    {
        id: 'cosmic_nebula',
        label: 'Deep Nebula',
        previewGradient: 'radial-gradient(circle, #2A0E61, #000)',
        needsColor: false,
        isCosmic: true,
        description: 'Turbulent cosmic clouds'
    },
    {
        id: 'cosmic_galaxy',
        label: 'Grand Galaxy',
        previewGradient: 'radial-gradient(circle, #FF5C8A, #1B82FF, #000)',
        needsColor: false,
        isCosmic: true,
        description: 'A spiral of infinite color'
    },
    {
        id: 'cosmic_aether_gate',
        label: 'Aether Gate',
        previewGradient: 'radial-gradient(circle, #FFF, #5A3FFF, #000)',
        needsColor: false,
        isCosmic: true,
        description: 'Orbital energy citadel'
    },
    {
        id: 'cosmic_omegasphere',
        label: 'The Omega',
        previewGradient: 'radial-gradient(circle, #8CFFE9, #5A3FFF, #000)',
        needsColor: false,
        isCosmic: true,
        description: 'The final frontier of computing'
    },
    {
        id: 'cosmic_infinite',
        label: 'The Infinite',
        previewGradient: 'radial-gradient(circle, #FF5C8A, #1B82FF, #000)',
        needsColor: false,
        isCosmic: true,
        description: 'Chaos theory visualised'
    },
    {
        id: 'cosmic_ascendant',
        label: 'The Quintessence',
        previewGradient: 'linear-gradient(to top, #000, #5A3FFF, #FFF)',
        needsColor: false,
        isCosmic: true,
        description: 'Alien code architecture'
    },
    {
        id: 'cosmic_apex',
        label: 'The Apex',
        previewGradient: 'radial-gradient(circle, #FFF, #8CFFE9, #5A3FFF, #000)',
        needsColor: false,
        isCosmic: true,
        description: 'Hyper-Engineered Core'
    },
    {
        id: 'cosmic_paradox',
        label: 'The Paradox',
        previewGradient: 'linear-gradient(135deg, #5A3FFF, #FF5C8A, #8CFFE9)',
        needsColor: false,
        isCosmic: true,
        description: 'Hyper-Manifold Artifact'
    },
    {
        id: 'cosmic_opus',
        label: 'The Spectrum',
        previewGradient: 'linear-gradient(to right, #FFF, #8CFFE9, #FF5C8A, #5A3FFF)',
        needsColor: false,
        isCosmic: true,
        description: 'Prismatic Light Refraction'
    },
    {
        id: 'cosmic_flux',
        label: 'The Flux',
        previewGradient: 'radial-gradient(circle at 30% 30%, #FFF, #CCC, #000)',
        needsColor: false,
        isCosmic: true,
        description: 'Digital Silk Flow'
    },
    {
        id: 'cosmic_ether',
        label: 'The Ether',
        previewGradient: 'radial-gradient(circle, rgba(255,255,255,0.2), #000)',
        needsColor: false,
        isCosmic: true,
        description: 'Next-Gen Glass OS'
    },
    {
        id: 'cosmic_absolute',
        label: 'The Absolute',
        previewGradient: 'radial-gradient(circle, #FFF, #5A3FFF)',
        needsColor: false,
        isCosmic: true,
        description: 'Infinite Complexity'
    },
    {
        id: 'system_memory',
        label: 'Memory Field',
        previewGradient: 'radial-gradient(#1B82FF 10%, #000 90%)',
        needsColor: false,
        description: 'Data dreaming in the dark'
    },
    {
        id: 'cosmic_omega_borealis',
        label: 'Omega Borealis',
        previewGradient: 'radial-gradient(circle, #5A3FFF, #8CFFE9)',
        needsColor: false,
        isCosmic: true,
        description: 'The Convergence of Light and Void'
    },
    {
        id: 'elysium',
        label: 'Elysium',
        previewGradient: 'linear-gradient(to bottom, #E0C3FC, #8EC5FC)',
        needsColor: false,
        isCosmic: true,
        description: 'Pure visual healing. Soft light.'
    },
    {
        id: 'atmos_pulse',
        label: 'Luminous Pulse',
        previewGradient: 'radial-gradient(circle, #FF5C8A, #5A3FFF)',
        needsColor: false,
        needsVariant: true,
        hasAtmosVariants: true,
        isCosmic: true,
        description: 'Breathing spheres of soft light.'
    },
    {
        id: 'atmos_flux',
        label: 'Digital Silk',
        previewGradient: 'linear-gradient(to right, #8CFFE9, #5A3FFF)',
        needsColor: false,
        needsVariant: true,
        hasAtmosVariants: true,
        isCosmic: true,
        description: 'Horizontal ribbons of data drift.'
    },
    {
        id: 'atmos_aether',
        label: 'Aether Drift',
        previewGradient: 'linear-gradient(135deg, #A7B6FF, #7FDBFF)',
        needsColor: false,
        needsVariant: true,
        hasAtmosVariants: true,
        isCosmic: true,
        description: 'Sweeping arcs of luminous wind.'
    },
    {
        id: 'atmos_globe',
        label: 'Data Sphere',
        previewGradient: 'radial-gradient(circle, #8CFFE9, #1B82FF, #000)',
        needsColor: false,
        needsVariant: true,
        hasAtmosVariants: true,
        isCosmic: true,
        description: 'Rotating 3D illusion of a data-rich world.'
    },
];
