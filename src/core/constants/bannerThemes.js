export const BANNER_TYPES = [
    {
        id: 'custom_saved',
        label: 'Saved',
        previewGradient: 'linear-gradient(135deg, #7FFFD4, #1B82FF)',
        isCustom: true,
        description: 'Your collection of saved personal banner configurations.'
    },
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
    // --- VECTOR DYNAMICS PACK ---
    {
        id: 'math_god_equation',
        label: 'God Elevation',
        previewGradient: 'linear-gradient(135deg, #FFD700, #FFFFFF, #7FFFD4)',
        needsColor: true,
        description: 'The Ultimate Mathematical Singularity. A living, breathing chaotic attractor.'
    },
    {
        id: 'math_solar_system',
        label: 'Orbital Mechanics',
        previewGradient: 'radial-gradient(circle, #FFFFFF, #000)',
        needsColor: true,
        description: 'Dual solar systems orbiting in perfect synchronization.',
        customVariants: [
            { id: 'solar_multi', name: 'Panospace Core', color: 'linear-gradient(135deg, #FF5C8A, #1B82FF, #7FFFD4)' },
            { id: 'solar_mint', name: 'Mint', color: '#7FFFD4' },
            { id: 'solar_pink', name: 'Solar Pink', color: '#FF5C8A' },
            { id: 'solar_blue', name: 'Ion Blue', color: '#1B82FF' },
            { id: 'solar_purple', name: 'Deep Orbit', color: '#5A3FFF' },
            { id: 'solar_orange', name: 'Stellar Orange', color: '#FF914D' },
            { id: 'solar_ice', name: 'Ice White', color: '#FFFFFF' }
        ]
    },
    {
        id: 'os_classic',
        label: 'Digital Sphere',
        previewGradient: 'linear-gradient(to right, #000, #7FFFD4, #000)',
        needsColor: false,
        description: 'Classic green digital oscilloscope sphere'
    },
    {
        id: 'os_amber',
        label: 'Vintage Amber',
        previewGradient: 'linear-gradient(to right, #000, #FF914D, #000)',
        needsColor: false,
        description: 'Retro monochrome amber display'
    },
    {
        id: 'os_cyan',
        label: 'Digital Cyan',
        previewGradient: 'linear-gradient(to right, #000, #1B82FF, #000)',
        needsColor: false,
        description: 'High-tech blue vector grid'
    },
    {
        id: 'os_daft',
        label: 'Prism Geometry',
        previewGradient: 'linear-gradient(135deg, #FF5C8A, #1B82FF, #7FFFD4)',
        needsColor: false,
        description: 'Multi-color geometric prism rotation'
    },
    {
        id: 'os_tesseract',
        label: 'Hypercube 4D',
        previewGradient: 'linear-gradient(45deg, #5A3FFF, #7FFFD4)',
        needsColor: false,
        description: 'Four-dimensional tesseract projection'
    },
    {
        id: 'math_aizawa',
        label: 'Aizawa Chaos',
        previewGradient: 'radial-gradient(circle, #7FFFD4, #000)',
        needsColor: false,
        description: 'Fluid-like chaotic attractor system'
    },
    {
        id: 'math_lorenz',
        label: 'Lorenz Logic',
        previewGradient: 'radial-gradient(circle, #1B82FF, #000)',
        needsColor: false,
        description: 'The butterfly effect visualized'
    },
    {
        id: 'math_rossler',
        label: 'Rossler Band',
        previewGradient: 'radial-gradient(circle, #FF5C8A, #000)',
        needsColor: false,
        description: 'Chaotic folding band structure'
    },
    {
        id: 'math_knot',
        label: 'Torus Knot',
        previewGradient: 'radial-gradient(circle, #1B82FF, #000)',
        needsColor: false,
        description: 'Complex knotted geometry in 3D'
    },
    {
        id: 'math_enneper',
        label: 'Enneper Field',
        previewGradient: 'radial-gradient(circle, #5A3FFF, #000)',
        needsColor: false,
        description: 'Self-intersecting minimal surface'
    },
    {
        id: 'math_mobius',
        label: 'Mobius Loop',
        previewGradient: 'radial-gradient(circle, #7FFFD4, #000)',
        needsColor: false,
        description: 'Infinite non-orientable loop'
    },
    {
        id: 'math_pentachoron',
        label: '5-Cell Simplex',
        previewGradient: 'linear-gradient(to right, #5A3FFF, #000)',
        needsColor: false,
        description: '4D simplex rotating in hyperspace'
    },
    {
        id: 'math_24cell',
        label: '24-Cell Project',
        previewGradient: 'linear-gradient(to right, #1B82FF, #000)',
        needsColor: false,
        description: 'Complex 4D regular polytope'
    },
    {
        id: 'math_wave',
        label: 'Quantum Wave',
        previewGradient: 'linear-gradient(to bottom, #000, #7FFFD4, #000)',
        needsColor: false,
        description: 'Oscillating quantum probability waves'
    },
    {
        id: 'math_interference',
        label: 'Interference',
        previewGradient: 'linear-gradient(to bottom, #000, #1B82FF, #000)',
        needsColor: false,
        description: 'Wave interference patterns'
    },
    {
        id: 'math_quantum_foam',
        label: 'Quantum Foam',
        previewGradient: 'linear-gradient(135deg, #FF5C8A, #000)',
        needsColor: false,
        description: 'Sub-atomic spacetime fluctuations'
    },
    {
        id: 'math_phyllotaxis',
        label: 'Golden Ratio',
        previewGradient: 'radial-gradient(circle, #7FFFD4, #000)',
        needsColor: false,
        description: 'Organic growth spiral patterns'
    },
    {
        id: 'math_fibonacci',
        label: 'Fibonacci Life',
        previewGradient: 'radial-gradient(circle, #FFFFFF, #000)',
        needsColor: false,
        description: 'Mathematical sequence of life'
    },
    {
        id: 'math_lissajous',
        label: 'Harmonic Field',
        previewGradient: 'linear-gradient(45deg, #1B82FF, #000)',
        needsColor: false,
        description: 'Complex harmonic motion curves'
    },
    {
        id: 'math_hypotrochoid',
        label: 'Spirograph',
        previewGradient: 'linear-gradient(45deg, #FF5C8A, #000)',
        needsColor: false,
        description: 'Geometric roulette curves'
    },
    {
        id: 'math_supershape',
        label: 'Supershape',
        previewGradient: 'linear-gradient(45deg, #5A3FFF, #000)',
        needsColor: false,
        description: 'Gielis supershape formula visualization'
    },
    {
        id: 'math_calabi',
        label: 'Calabi-Yau 6D',
        previewGradient: 'radial-gradient(circle, #7FFFD4, #5A3FFF, #000)',
        needsColor: false,
        description: 'String theory hidden dimensions'
    },
    {
        id: 'math_singularity',
        label: 'Event Horizon',
        previewGradient: 'radial-gradient(circle, #000, #222)',
        needsColor: false,
        description: 'Black hole gravitational lensing'
    },
    {
        id: 'math_ribbon',
        label: 'Attractor Ribbon',
        previewGradient: 'linear-gradient(to right, #FF5C8A, #000)',
        needsColor: false,
        description: 'Flowing chaos ribbon'
    },
    {
        id: 'math_fire',
        label: 'Fractal Flame',
        previewGradient: 'radial-gradient(circle, #FF5C8A, #FF914D, #000)',
        needsColor: false,
        description: 'Recursive fractal fire'
    },
    {
        id: 'math_mandala',
        label: 'Geo Symphony',
        previewGradient: 'radial-gradient(circle, #5A3FFF, #7FFFD4, #000)',
        needsColor: false,
        description: 'Rotating geometric mandala'
    },
    {
        id: 'math_nebula',
        label: 'Transcendence',
        previewGradient: 'radial-gradient(circle, #7FFFD4, #1B82FF, #000)',
        needsColor: false,
        description: 'Nebula cloud simulation'
    },
    {
        id: 'abstract_lava_cube',
        label: 'Lava Fusion',
        previewGradient: 'linear-gradient(135deg, #FF5C8A, #5A3FFF, #7FFFD4)',
        needsColor: true,
        description: 'Organic 3D geometry. Lava lamp physics meeting digital structure.',
        customVariants: [
            { id: 'fusion_prism', name: 'Prism Flow', color: 'linear-gradient(135deg, #FF5C8A, #5A3FFF, #7FFFD4)' },
            { id: 'fusion_mint', name: 'Neo Mint', color: '#7FFFD4' },
            { id: 'fusion_pink', name: 'Solar Pulse', color: '#FF5C8A' },
            { id: 'fusion_blue', name: 'Ion Static', color: '#1B82FF' },
            { id: 'fusion_deep', name: 'Void Flux', color: '#5A3FFF' }
        ]
    },
    {
        id: 'abstract_omni_paradox',
        label: 'Omni Paradox',
        previewGradient: 'linear-gradient(135deg, #FF5C8A, #5A3FFF, #7FFFD4, #FF914D)',
        needsColor: true,
        description: 'The ultimate fusion of liquid physics and 4D geometry. State-of-the-art.',
        customVariants: [
            { id: 'paradox_prism', name: 'Prism Nova', color: 'linear-gradient(135deg, #FF5C8A, #5A3FFF, #7FFFD4)' },
            { id: 'paradox_stellar', name: 'Stellar Wind', color: '#FF914D' },
            { id: 'paradox_cyber', name: 'Cyber Grid', color: '#7FFFD4' },
            { id: 'paradox_void', name: 'Deep Void', color: '#5A3FFF' }
        ]
    },

    // --- WINDOW BANNERS ---
    {
        id: 'window_apartment',
        label: 'Apartment View',
        previewGradient: 'linear-gradient(to bottom, #351c35, #e3a15c)',
        needsColor: true,
        description: 'Your highrise sanctuary',
        customVariants: [
            { id: 'apt_lofi', name: 'Loft', color: '#FF914D' },
            { id: 'apt_cyber', name: 'Grid', color: '#1B82FF' },
            { id: 'apt_nyc', name: 'Metro', color: '#FFFFFF' },
            { id: 'apt_vapor', name: 'Vista', color: '#7FFFD4' },
            { id: 'apt_noir', name: 'Noir', color: '#FF914D' },
            { id: 'apt_aurora', name: 'Borealis', color: '#7FFFD4' },
            { id: 'apt_manor', name: 'Heritage', color: '#AA7744' },
            { id: 'apt_emerald', name: 'Gilded', color: '#D4AF37' },
            { id: 'apt_starlight', name: 'Silver', color: '#FFFFFF' },
            { id: 'apt_midnight', name: 'Midnight', color: '#1B82FF' },
            { id: 'apt_amber', name: 'Horizon', color: '#FF914D' },
            { id: 'apt_cobalt', name: 'Stream', color: '#7FFFD4' },
            { id: 'apt_crimson', name: 'District', color: '#FF5C8A' },
            { id: 'apt_rose', name: 'Suite', color: '#FF5C8A' },
            { id: 'apt_glacier', name: 'Frontier', color: '#FFFFFF' },
            { id: 'apt_solaris', name: 'Apex', color: '#FF914D' },
            { id: 'apt_future', name: 'Zenith', color: '#FFFFFF' },
            { id: 'apt_terrace', name: 'Terrace', color: '#7FFFD4' },
            { id: 'apt_penthouse', name: 'Penthouse', color: '#FFD700' }
        ]
    },
    {
        id: 'window_skydrive',
        label: 'SkyDrive POV',
        previewGradient: 'linear-gradient(to right, #001533, #1B82FF, #001533)',
        needsColor: true,
        description: 'High-speed pilot POV through a neon megalopolis',
        customVariants: [
            { id: 'velocity_blue', name: 'Ion Velocity', color: '#1B82FF' },
            { id: 'velocity_mint', name: 'Mint Rush', color: '#7FFFD4' },
            { id: 'velocity_pink', name: 'Solar Streak', color: '#FF5C8A' },
            { id: 'velocity_orange', name: 'Stellar Burn', color: '#FF914D' }
        ]
    },
    {
        id: 'window_botanical',
        label: 'Space Station',
        previewGradient: 'linear-gradient(to bottom, #000, #1B82FF, #222)',
        needsColor: true,
        description: 'Industrial outposts orbiting various core worlds',
        customVariants: [
            { id: 'station_moon', name: 'Lunar Outpost', color: '#FFFFFF' },
            { id: 'station_mars', name: 'Mars Station', color: '#FF914D' },
            { id: 'station_deep', name: 'Deep Space', color: '#5A3FFF' },
            { id: 'station_vulcan', name: 'Forge Alpha', color: '#FF5C8A' },
            { id: 'station_ice', name: 'Glacial Reach', color: '#7FFFD4' },
            { id: 'singularity_nexus', name: 'Singularity Nexus', color: '#1B82FF' },
            { id: 'singularity_supernova', name: 'Supernova Forge', color: '#FF914D' }
        ]
    },
    {
        id: 'window_lava',
        label: 'Glow Core',
        previewGradient: 'radial-gradient(circle, #7FFFD4, #1B82FF, #5A3FFF, #FF5C8A)',
        needsColor: true,
        description: 'Atmospheric liquid-motion lighting displays',
        customVariants: [
            { id: 'lava_plasma', name: 'Plasma Flow', color: 'linear-gradient(45deg, #7FFFD4, #1B82FF, #5A3FFF, #FF5C8A)', description: 'Multi-color rhythmic lava conduits.', customVariants: { variant: 'lava_plasma' } },
            { id: 'lava_omniflow', name: 'Omni Flow', color: 'linear-gradient(90deg, #7FFFD4, #1B82FF, #5A3FFF, #FF5C8A)', description: 'Screen-wide multi-color wax spread.', customVariants: { variant: 'lava_omniflow' } },
            { id: 'lava_neon', name: 'Neon Mint', color: 'linear-gradient(45deg, #7FFFD4, #000)', description: 'Monochrome arctic wax flow.', customVariants: { variant: 'lava_neon' } },
            { id: 'lava_solar', name: 'Solar Flare', color: 'linear-gradient(45deg, #FF914D, #000)', description: 'Monochrome solar wax flow.', customVariants: { variant: 'lava_solar' } },
            { id: 'lava_nebula', name: 'Deep Nebula', color: 'linear-gradient(45deg, #5A3FFF, #000)', description: 'Monochrome void wax flow.', customVariants: { variant: 'lava_nebula' } }
        ]
    },
    {
        id: 'window_omni',
        label: 'Omni Portal',
        previewGradient: 'conic-gradient(from 180deg at 50% 50%, #7FFFD4, #FF5C8A, #5A3FFF, #1B82FF, #7FFFD4)',
        needsColor: true,
        description: 'A trans-dimensional gateway to other worlds',
        customVariants: [
            { id: 'omni_storm', name: 'Omni Storm', color: 'linear-gradient(135deg, #7FFFD4, #1B82FF, #5A3FFF, #FF5C8A)' },
            { id: 'omni_void', name: 'Deep Void', color: 'linear-gradient(to bottom, #000, #5A3FFF)' },
            { id: 'omni_pulse', name: 'Pulse Gate', color: 'linear-gradient(45deg, #FF5C8A, #7FFFD4)' }
        ]
    },
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
    {
        id: 'window_boat',
        label: 'Boat',
        previewGradient: 'linear-gradient(to bottom, #1B82FF, #2A0E61)',
        needsColor: true,
        description: 'Below deck looking out a porthole',
        customVariants: [
            { id: 'boat_storm', name: 'Deep Orbit', color: 'linear-gradient(to bottom, #2A0E61, #5A3FFF)' },
            { id: 'boat_sunset', name: 'Pink Dusk', color: 'linear-gradient(to bottom, #FF5C8A, #FF914D)' },
            { id: 'boat_mint', name: 'Aurora Wake', color: 'linear-gradient(to bottom, #2A0E61, #8CFFE9)' }
        ]
    },
    {
        id: 'window_submarine',
        label: 'Submarine',
        previewGradient: 'linear-gradient(to bottom, #0D2B36, #010408)',
        needsColor: true,
        description: 'Underwater observation deck',
        customVariants: [
            { id: 'sub_reef', name: 'Coral Reef', color: 'linear-gradient(to bottom, #1B82FF, #8CFFE9)' },
            { id: 'sub_abyss', name: 'The Abyss', color: 'linear-gradient(to bottom, #010408, #0D2B36)' },
            { id: 'sub_neon', name: 'Bio-Lume', color: 'linear-gradient(to bottom, #2A0E61, #FF5C8A)' }
        ]
    },
    {
        id: 'window_rocket',
        label: 'Rocket Pilot',
        previewGradient: 'linear-gradient(to bottom, #000, #5A3FFF)',
        needsColor: true,
        description: 'Pilot POV from a high-speed spacecraft',
        customVariants: [
            { id: 'rocket_warp', name: 'Hyperspace', color: 'linear-gradient(to bottom, #000, #7FDBFF)' },
            { id: 'rocket_nebula', name: 'Nebula Drift', color: 'linear-gradient(to bottom, #2A0E61, #FF5C8A)' }
        ]
    },
    {
        id: 'window_aquarium',
        label: 'Aquarium Wall',
        previewGradient: 'linear-gradient(to bottom, #001835, #00F3FF)',
        needsColor: true,
        description: 'Vibey architectural aquarium viewing wall',
        customVariants: [
            { id: 'marine_blue', name: 'Marine Ocean', color: 'linear-gradient(to bottom, #001835, #1B82FF)' },
            { id: 'tropical_reef', name: 'Tropical Reef', color: 'linear-gradient(to bottom, #003d5b, #8CFFE9)' },
            { id: 'deep_abyss', name: 'Deep Abyss', color: 'linear-gradient(to bottom, #000000, #1A1A2E)' }
        ]
    },
    {
        id: 'window_aquarium_dual',
        label: 'Aquarium Dual',
        previewGradient: 'linear-gradient(to right, #000 10%, #00F3FF 30%, #000 50%, #00F3FF 70%, #000 90%)',
        needsColor: true,
        description: 'Two-window observation deck of the deep sea',
        customVariants: [
            { id: 'marine_blue', name: 'Marine Ocean', color: 'linear-gradient(to bottom, #001835, #1B82FF)' },
            { id: 'tropical_reef', name: 'Tropical Reef', color: 'linear-gradient(to bottom, #003d5b, #8CFFE9)' },
            { id: 'deep_abyss', name: 'Deep Abyss', color: 'linear-gradient(to bottom, #000000, #1A1A2E)' }
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
    {
        id: 'city_vista',
        label: 'Hilltop Vista',
        previewGradient: 'linear-gradient(to bottom, #050210, #1b263b)',
        needsColor: false,
        description: 'Looking down on a twinkling city'
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
        id: 'ocean_lighthouse',
        label: 'Lighthouse Sunset',
        previewGradient: 'linear-gradient(to bottom, #2A0E61, #FF914D)',
        needsColor: false,
        description: 'Lonesome lighthouse guarding the sunset shore'
    },
    {
        id: 'ocean_lighthouse_night',
        label: 'Lighthouse Moonnight',
        previewGradient: 'linear-gradient(to bottom, #000, #2A0E61)',
        needsColor: false,
        description: 'Deep night lighthouse with glowing bioluminescence'
    },

    {
        id: 'abstract_scifi_ui',
        label: 'Sci-Fi UI',
        previewGradient: 'linear-gradient(135deg, #020406, #7FFFD4, #05080a)',
        needsColor: false,
        isCosmic: true,
        description: 'Cinematic data visualization interface'
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
        label: 'Singularity',
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
        label: 'Velocity',
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
        needsColor: true,
        isCosmic: true,
        description: 'Metropolis at the edge of forever'
    },
    {
        id: 'cosmic_nebula',
        label: 'Deep Nebula',
        previewGradient: 'radial-gradient(circle, #2A0E61, #000)',
        needsColor: true,
        isCosmic: true,
        description: 'Turbulent cosmic clouds'
    },
    {
        id: 'cosmic_galaxy',
        label: 'Grand Galaxy',
        previewGradient: 'radial-gradient(circle, #FF5C8A, #1B82FF, #000)',
        needsColor: true,
        isCosmic: true,
        description: 'A spiral of infinite color'
    },
    {
        id: 'cosmic_aether_gate',
        label: 'Gateway',
        previewGradient: 'radial-gradient(circle, #FFF, #5A3FFF, #000)',
        needsColor: false,
        isCosmic: true,
        description: 'Orbital energy citadel'
    },
    {
        id: 'cosmic_omegasphere',
        label: 'Frontier',
        previewGradient: 'radial-gradient(circle, #8CFFE9, #5A3FFF, #000)',
        needsColor: false,
        isCosmic: true,
        description: 'The final frontier of computing'
    },
    {
        id: 'cosmic_infinite',
        label: 'Infinite',
        previewGradient: 'radial-gradient(circle, #FF5C8A, #1B82FF, #000)',
        needsColor: false,
        isCosmic: true,
        description: 'Chaos theory visualised'
    },
    {
        id: 'cosmic_ascendant',
        label: 'Quintessence',
        previewGradient: 'linear-gradient(to top, #000, #5A3FFF, #FFF)',
        needsColor: false,
        isCosmic: true,
        description: 'Alien code architecture'
    },
    {
        id: 'cosmic_apex',
        label: 'Apex',
        previewGradient: 'radial-gradient(circle, #FFF, #8CFFE9, #5A3FFF, #000)',
        needsColor: false,
        isCosmic: true,
        description: 'Hyper-Engineered Core'
    },
    {
        id: 'cosmic_paradox',
        label: 'Paradox',
        previewGradient: 'linear-gradient(135deg, #5A3FFF, #FF5C8A, #8CFFE9)',
        needsColor: false,
        isCosmic: true,
        description: 'Hyper-Manifold Artifact'
    },
    {
        id: 'cosmic_opus',
        label: 'Spectrum',
        previewGradient: 'linear-gradient(to right, #FFF, #8CFFE9, #FF5C8A, #5A3FFF)',
        needsColor: false,
        isCosmic: true,
        description: 'Prismatic Light Refraction'
    },
    {
        id: 'cosmic_flux',
        label: 'Flux',
        previewGradient: 'radial-gradient(circle at 30% 30%, #FFF, #CCC, #000)',
        needsColor: false,
        isCosmic: true,
        description: 'Digital Silk Flow'
    },
    {
        id: 'cosmic_ether',
        label: 'Ether',
        previewGradient: 'radial-gradient(circle, rgba(255,255,255,0.2), #000)',
        needsColor: true,
        isCosmic: true,
        description: 'Next-Gen Glass OS'
    },
    {
        id: 'cosmic_absolute',
        label: 'Absolute',
        previewGradient: 'radial-gradient(circle, #FFF, #5A3FFF)',
        needsColor: false,
        isCosmic: true,
        description: 'Infinite Complexity'
    },
    {
        id: 'system_memory',
        label: 'Memory Field',
        previewGradient: 'radial-gradient(#1B82FF 10%, #000 90%)',
        needsColor: true,
        description: 'Data dreaming in the dark'
    },
    {
        id: 'cosmic_omega_borealis',
        label: 'Aurora Frontier',
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

    // --- LIQUID DYNAMICS PACK ---

    {
        id: 'liquid_gossamer',
        label: 'Gossamer Silk',
        previewGradient: 'linear-gradient(135deg, #1B82FF, #5A3FFF, #FF5C8A)',
        needsColor: false,
        isCosmic: true,
        description: 'Weightless iridescent liquid light.'
    },
    {
        id: 'liquid_kinetic',
        label: 'Cyber Kinetic',
        previewGradient: 'linear-gradient(to right, #000 0%, #1B82FF 100%)',
        needsColor: false,
        isCosmic: true,
        description: 'High-velocity data streams in fluid motion.'
    },

    // --- ADVANCED MATH VISUALIZATIONS (ADHD-FRIENDLY) ---

    {
        id: 'math_butterfly_effect',
        label: 'Butterfly Effect',
        previewGradient: 'linear-gradient(135deg, #000508 0%, #1B82FF 100%)',
        needsColor: true,
        isCosmic: true,
        description: 'Hypnotic Lorenz attractor chaos theory visualization.',
        customVariants: [
            { id: 'math_lorenz_classic', label: 'Butterfly Effect (Classic)' },
            { id: 'math_lorenz_rainbow', label: 'Butterfly Effect (Rainbow)' }
        ]
    },
    {
        id: 'math_gravitational_dance',
        label: 'Gravitational Dance',
        previewGradient: 'linear-gradient(135deg, #00000a 0%, #7FFFD4 50%, #FF5C8A 100%)',
        needsColor: true,
        isCosmic: true,
        description: 'Mesmerizing particle physics simulation with gravitational attraction.'
    },
    {
        id: 'math_golden_spiral',
        label: 'Golden Ratio Spiral',
        previewGradient: 'linear-gradient(135deg, #000510 0%, #FFD700 100%)',
        needsColor: true,
        isCosmic: true,
        description: 'Hypnotic Fibonacci spiral particles following the golden ratio.'
    },

    // --- ZEN & CALM PACK (ULTRA CHILL) ---

    {
        id: 'zen_silk_flow',
        label: 'Silk Flow',
        previewGradient: 'linear-gradient(135deg, #050208 0%, #7FFFD4 100%)',
        needsColor: true,
        isCosmic: true,
        description: 'Ethereal ribbons of light flowing like silk.'
    },
    {
        id: 'zen_ripples',
        label: 'Zen Ripples',
        previewGradient: 'radial-gradient(circle, #7FFFD4 0%, #0a0a0f 70%)',
        needsColor: true,
        isCosmic: false,
        description: 'Centering concentric waves reflecting calm waters.'
    },
    {
        id: 'zen_bokeh',
        label: 'Dreamy Bokeh',
        previewGradient: 'radial-gradient(circle at 30% 30%, #FF5C8A 0%, #08050a 100%)',
        needsColor: true,
        isCosmic: false,
        description: 'Soft floating orbs in a deep, peaceful blur.'
    },
    {
        id: 'zen_mist',
        label: 'Misty Clouds',
        previewGradient: 'linear-gradient(to bottom, #0a0a1a, #1a1a2a)',
        needsColor: true,
        isCosmic: true,
        description: 'Ethereal morning fog drifting through space.'
    },
    {
        id: 'zen_stars',
        label: 'Soothing Stars',
        previewGradient: 'radial-gradient(circle, #7FFFD4 0%, #020205 100%)',
        needsColor: true,
        isCosmic: true,
        description: 'Slow, breathing starfield in a vast cosmic void.'
    },
    {
        id: 'zen_monolith',
        label: 'Zen Monolith',
        previewGradient: 'linear-gradient(135deg, #030106 0%, #7FFFD4 100%)',
        needsColor: true,
        isCosmic: true,
        description: 'Rotating glass crystal with a glowing core.'
    },
    {
        id: 'zen_lava',
        label: 'Zen Lava',
        previewGradient: 'radial-gradient(circle, #7FFFD4 0%, #040206 100%)',
        needsColor: true,
        isCosmic: true,
        description: 'Slow-motion melting liquid glass spheres.'
    },
    {
        id: 'zen_mandala',
        label: 'Zen Mandala',
        previewGradient: 'radial-gradient(circle, #7FFFD4 0%, #020005 100%)',
        needsColor: true,
        isCosmic: false,
        description: 'Breathing sacred geometry patterns.'
    },
    {
        id: 'zen_aurora',
        label: 'Zen Auroras',
        previewGradient: 'linear-gradient(to right, #010408, #7FFFD4, #010408)',
        needsColor: true,
        isCosmic: true,
        description: 'Vertical light curtains drifting like silk.'
    },
    {
        id: 'zen_pulse',
        label: 'Zen Pulse',
        previewGradient: 'radial-gradient(circle, #7FFFD4 0%, #040104 100%)',
        needsColor: true,
        isCosmic: false,
        description: 'Deep breathing orb of pure energy.'
    },
    {
        id: 'zen_liquid',
        label: 'Liquid Zen',
        previewGradient: 'linear-gradient(to top, #050a08, #7FFFD4)',
        needsColor: true,
        isCosmic: false,
        description: 'Rising glass bubbles in thick rhythmic oil.'
    },
    {
        id: 'zen_neural',
        label: 'Neural Zen',
        previewGradient: 'linear-gradient(135deg, #020008 0%, #7FFFD4 100%)',
        needsColor: true,
        isCosmic: false,
        description: 'Synaptic currents flowing through a calm mind.'
    },
    {
        id: 'zen_cosmic',
        label: 'Cosmic Zen',
        previewGradient: 'radial-gradient(circle, #000005 0%, #7FFFD4 100%)',
        needsColor: true,
        isCosmic: true,
        description: 'Breathing accretion disk around a silent star.'
    },
    {
        id: 'zen_prismatic',
        label: 'Prismatic Zen',
        previewGradient: 'conic-gradient(#05050a, #7FFFD4, #05050a)',
        needsColor: true,
        isCosmic: false,
        description: 'Light rays refracting through a rotating prism.'
    },
    {
        id: 'zen_floral',
        label: 'Floral Zen',
        previewGradient: 'radial-gradient(circle, #0a0508 0%, #7FFFD4 100%)',
        needsColor: true,
        isCosmic: false,
        description: 'Recursive symmetrical petal blooms.'
    },
    {
        id: 'zen_rain',
        label: 'Zen Rain',
        previewGradient: 'linear-gradient(to bottom, #010508, #1B82FF)',
        needsColor: true,
        isCosmic: false,
        description: 'Vertical mist falling slowly through a dark sky.'
    },
    {
        id: 'zen_fireflies',
        label: 'Zen Fireflies',
        previewGradient: 'radial-gradient(circle, #FF914D, #050505)',
        needsColor: true,
        isCosmic: false,
        description: 'Softly glowing spots drifting and fading in silence.'
    },
    {
        id: 'zen_grid',
        label: 'Zen Grid',
        previewGradient: 'linear-gradient(to bottom, #030106, #5A3FFF)',
        needsColor: true,
        isCosmic: false,
        description: 'Perspective grid of deep purple light.'
    },
    {
        id: 'zen_heartbeat',
        label: 'Zen Pulse Wave',
        previewGradient: 'linear-gradient(to right, #050105, #FF5C8A, #050105)',
        needsColor: true,
        isCosmic: false,
        description: 'A single, oscillating heartbeat line.'
    },
    {
        id: 'zen_raindrops',
        label: 'Zen Raindrops',
        previewGradient: 'radial-gradient(circle, #7FDBFF, #080a15)',
        needsColor: true,
        isCosmic: false,
        description: 'Ripples appearing on a calm dark surface.'
    },
    {
        id: 'zen_lanterns',
        label: 'Zen Lanterns',
        previewGradient: 'linear-gradient(to top, #0a0502, #FF914D)',
        needsColor: true,
        isCosmic: false,
        description: 'Warm glowing lanterns drifting into the night.'
    },
    {
        id: 'zen_tunnel',
        label: 'Zen Tunnel',
        previewGradient: 'radial-gradient(circle, #1B82FF, #000208)',
        needsColor: true,
        isCosmic: true,
        description: 'Infinite receding geometric shapes.'
    },
    {
        id: 'zen_borealis',
        label: 'Zen Aurora Borealis',
        previewGradient: 'linear-gradient(to right, #01050a, #7FFFD4, #01050a)',
        needsColor: true,
        isCosmic: true,
        description: 'Dancing curtains of green and blue light.'
    },
    {
        id: 'zen_geodesic',
        label: 'Zen Sacred Sphere',
        previewGradient: 'radial-gradient(circle, #FFFFFF, #000000)',
        needsColor: true,
        isCosmic: true,
        description: 'Rotating wireframe sphere of pure light.'
    },
    {
        id: 'zen_mercury',
        label: 'Zen Mercury',
        previewGradient: 'radial-gradient(circle, #FFFFFF, #0a0a0a)',
        needsColor: true,
        isCosmic: false,
        description: 'Melting liquid metal blobs merging slowly.'
    },

    // --- CUSTOM SEED CATEGORY ---
    {
        id: 'custom_oscillator',
        label: 'Seed Oscillator',
        previewGradient: 'linear-gradient(45deg, #000, #7FFFD4, #000)',
        needsColor: true,
        isCustom: true,
        needsSeed: true,
        description: 'Procedurally generated dynamics derived from your unique code. Repeatable and infinite.'
    },
    {
        id: 'custom_flow',
        label: 'Flow Field',
        previewGradient: 'linear-gradient(45deg, #021a1a, #2C7873, #021a1a)',
        needsColor: true,
        isCustom: true,
        needsSeed: true,
        description: 'Organic particle movement guided by mathematical noise. Flowing and liquid.'
    },
    {
        id: 'custom_city',
        label: 'Custom City',
        previewGradient: 'linear-gradient(to top, #000, #1e90ff, #000)',
        needsColor: false, // Color is derived from seed
        isCustom: true,
        needsSeed: true,
        description: 'A procedural metropolis generated from your unique text code. Weather, layout, and atmosphere are all determined by the seed.'
    },
    {
        id: 'custom_snapshot',
        label: 'Space Snapshot',
        previewGradient: 'radial-gradient(circle, #000 20%, #2A0E61 100%)',
        needsColor: false, // Color is now internally managed by seed using Brand Colors
        isCustom: true,
        needsSeed: true,
        description: 'A unique deep space view generated from your seed. Galaxy layout, stars, and planets are determined by your code.'
    },
    {
        id: 'custom_voxel',
        label: 'Voxel Biome',
        previewGradient: 'linear-gradient(135deg, #4CAF50 30%, #795548 70%)',
        needsColor: false,
        isCustom: true,
        needsSeed: true,
        description: 'A procedural floating island generated from your seed. Discover rare biomes and structures.'
    },
    {
        id: 'custom_digital_forest',
        label: 'Digital Forest',
        previewGradient: 'linear-gradient(to top, #000, #0f0)',
        needsColor: false,
        isCustom: true,
        needsSeed: true,
        description: 'Recursive high-tech forest composed of glowing circuit-trees.'
    },
    {
        id: 'custom_digital_jungle',
        label: 'Digi Jungle',
        previewGradient: 'linear-gradient(to top, #051a14, #4a1d36, #ff4d00)',
        needsColor: false,
        isCustom: true,
        needsSeed: true,
        description: 'Lush procedural rainforest with exotic wildlife and hidden ponds.'
    },
    {
        id: 'custom_liquid_fractal',
        label: 'Liquid Fusion',
        previewGradient: 'linear-gradient(135deg, #7FFFD4, #5A3FFF)',
        needsColor: false,
        isCustom: true,
        needsSeed: true,
        description: 'Deep-space liquid glass fractal fusion with real-time metaball physics.'
    },
    {
        id: 'custom_jazz_cup',
        label: 'Jazz',
        previewGradient: 'linear-gradient(135deg, #ffffff 0%, #00A8A8 50%, #892CDC 100%)',
        needsColor: false, // Preset palettes
        isCustom: true,
        needsSeed: true,
        description: '90s paper cup aesthetic. Teal blobs, purple squiggles, and screen-printed grain.'
    },
    {
        id: 'custom_memphis_pattern',
        label: 'Memphis Pattern',
        previewGradient: 'linear-gradient(45deg, #000 25%, #FF00CC 25%, #FF00CC 50%, #000 50%, #000 75%, #00DDFF 75%, #00DDFF 100%)',
        needsColor: false,
        isCustom: true,
        needsSeed: true,
        description: '80s/90s high-contrast geometric confetti. Randomized zigzags, squiggles, and shapes.'
    },
    {
        id: 'custom_aquarium_abyss',
        label: 'Aquarium Abyss',
        previewGradient: 'linear-gradient(to bottom, #001421, #000)',
        needsColor: false,
        isCustom: true,
        needsSeed: true,
        description: 'A fullscreen procedural underwater ecosystem. Seed determines biomes, plant life, and the appearance of rare sharks.'
    }
];
