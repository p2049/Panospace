import React from 'react';
import { BRAND_RAINBOW } from '../../core/constants/colorPacks';
import { useFeedStore } from '@/core/store/useFeedStore';

// Hash function: String -> Number
const hashStr = (str) => {
    let hash = 0;
    if (!str) return 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

// Seeded Random Generator (Mulberry32)
const mulberry32 = (a) => {
    return () => {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};



const CityscapeBanner = React.lazy(() => import('./CityscapeBanner'));
const OceanBanner = React.lazy(() => import('./OceanBanner'));
const EarthBanner = React.lazy(() => import('./EarthBanner'));
const DreamworldBanner = React.lazy(() => import('./DreamworldBanner'));
const AbsoluteAbstractBanner = React.lazy(() => import('./AbsoluteAbstractBanner'));
const GenesisAbstractBanner = React.lazy(() => import('./GenesisAbstractBanner'));
const SingularityBanner = React.lazy(() => import('./SingularityBanner'));
const BlackMirrorBanner = React.lazy(() => import('./BlackMirrorBanner'));
const PinballBanner = React.lazy(() => import('./PinballBanner'));
const BlackHoleBanner = React.lazy(() => import('./BlackHoleBanner'));
const SingularityCityBanner = React.lazy(() => import('./SingularityCityBanner'));
const NebulaBanner = React.lazy(() => import('./NebulaBanner'));
const GalaxyBanner = React.lazy(() => import('./GalaxyBanner'));
const AetherGateBanner = React.lazy(() => import('./AetherGateBanner'));
const SeraphimBanner = React.lazy(() => import('./SeraphimBanner'));
const OmegasphereBanner = React.lazy(() => import('./OmegasphereBanner'));
const InfiniteBanner = React.lazy(() => import('./InfiniteBanner'));
const AscendantBanner = React.lazy(() => import('./AscendantBanner'));
const ApexBanner = React.lazy(() => import('./ApexBanner'));
const ParadoxBanner = React.lazy(() => import('./ParadoxBanner'));
const SpectrumBanner = React.lazy(() => import('./OpusBanner'));
const FluxBanner = React.lazy(() => import('./FluxBanner'));
const EtherBanner = React.lazy(() => import('./EtherBanner'));
const ResonanceBanner = React.lazy(() => import('./ResonanceBanner'));
const InterferenceBanner = React.lazy(() => import('./InterferenceBanner'));
const OmniscienceBanner = React.lazy(() => import('./OmniscienceBanner'));
const AbsoluteBanner = React.lazy(() => import('./AbsoluteBanner'));
const AttractorBanner = React.lazy(() => import('./AttractorBanner'));
const ManifoldBanner = React.lazy(() => import('./ManifoldBanner'));
const LavaCubeBanner = React.lazy(() => import('./LavaCubeBanner'));
const OmniParadoxBanner = React.lazy(() => import('./OmniParadoxBanner'));
const OscilloscopeBanner = React.lazy(() => import('./OscilloscopeBanner'));
const SeedOscillatorBanner = React.lazy(() => import('./SeedOscillatorBanner'));
const FlowFieldBanner = React.lazy(() => import('./FlowFieldBanner'));
const SeededCityBanner = React.lazy(() => import('./SeededCityBanner'));
const DeepSpaceSnapshotBanner = React.lazy(() => import('./DeepSpaceSnapshotBanner'));
const SeededVoxelBanner = React.lazy(() => import('./SeededVoxelBanner'));
const SciFiUiBanner = React.lazy(() => import('./SciFiUiBanner'));
const StaticSystemBanners = React.lazy(() => import('./SystemAbstractBanners'));
const BannerOverlayRenderer = React.lazy(() => (import('./BannerOverlayRenderer')));
const TrainWindowBanner = React.lazy(() => import('./TrainWindowBanner'));
const ShuttleWindowBanner = React.lazy(() => import('./ShuttleWindowBanner'));
const PlaneWindowBanner = React.lazy(() => import('./PlaneWindowBanner'));
const MetroWindowBanner = React.lazy(() => import('./MetroWindowBanner'));
const BoatWindowBanner = React.lazy(() => import('./BoatWindowBanner'));
const SubmarineWindowBanner = React.lazy(() => import('./SubmarineWindowBanner'));
const RocketWindowBanner = React.lazy(() => import('./RocketWindowBanner'));
const AquariumWindowBanner = React.lazy(() => import('./AquariumWindowBanner'));
const SplitAquariumBanner = React.lazy(() => import('./SplitAquariumBanner'));
const ApartmentWindowBanner = React.lazy(() => import('./ApartmentWindowBanner'));
const SkyDriveBanner = React.lazy(() => import('./SkyDriveBanner'));
const SpaceStationWindowBanner = React.lazy(() => import('./SpaceStationWindowBanner'));
const LavaLampBanner = React.lazy(() => import('./LavaLampBanner'));
const OmniPortalBanner = React.lazy(() => import('./OmniPortalBanner'));
const PulseBanner = React.lazy(() => import('./PulseBanner'));
const OmegaBorealis = React.lazy(() => import('./OmegaBorealis'));
const ElysiumBanner = React.lazy(() => import('./ElysiumBanner'));
const AetherBanner = React.lazy(() => import('./AetherBanner'));
const GlobeBanner = React.lazy(() => import('./GlobeBanner'));
const IsoWaveBanner = React.lazy(() => import('./IsoWaveBanner'));
const SolarSystemBanner = React.lazy(() => import('./SolarSystemBanner'));
const GodEquationBanner = React.lazy(() => import('./GodEquationBanner'));
const MarmorisBanner = React.lazy(() => import('./MarmorisBanner'));
const WaveGridBanner = React.lazy(() => import('./WaveGridBanner'));
const AuroraBanner = React.lazy(() => import('./AuroraBanner'));
const NorthernLightsBanner = React.lazy(() => import('./NorthernLightsBanner'));
const TechnicolorTechBanner = React.lazy(() => import('./TechnicolorTechBanner'));
const LighthouseOceanBanner = React.lazy(() => import('./LighthouseOceanBanner'));
const CityVistaBanner = React.lazy(() => import('./CityVistaBanner'));


// Liquid Dynamics Pack (Named Exports)
const GossamerLiquidBanner = React.lazy(() => import('./LiquidBanners').then(module => ({ default: module.GossamerLiquidBanner })));
const CyberKineticBanner = React.lazy(() => import('./LiquidBanners').then(module => ({ default: module.CyberKineticBanner })));

// Advanced Math Banners
const LorenzAttractorBanner = React.lazy(() => import('./AdvancedMathBanners').then(module => ({ default: module.LorenzAttractorBanner })));
const ParticlePhysicsBanner = React.lazy(() => import('./AdvancedMathBanners').then(module => ({ default: module.ParticlePhysicsBanner })));
const FibonacciSpiralBanner = React.lazy(() => import('./AdvancedMathBanners').then(module => ({ default: module.FibonacciSpiralBanner })));

// Zen & Calm Banners
const SilkFlowBanner = React.lazy(() => import('./CalmBanners').then(module => ({ default: module.SilkFlowBanner })));
const ZenRipplesBanner = React.lazy(() => import('./CalmBanners').then(module => ({ default: module.ZenRipplesBanner })));
const DreamyBokehBanner = React.lazy(() => import('./CalmBanners').then(module => ({ default: module.DreamyBokehBanner })));
const MistyCloudsBanner = React.lazy(() => import('./CalmBanners').then(module => ({ default: module.MistyCloudsBanner })));
const SoothingStarsBanner = React.lazy(() => import('./CalmBanners').then(module => ({ default: module.SoothingStarsBanner })));
const ZenMonolithBanner = React.lazy(() => import('./CalmBanners').then(module => ({ default: module.ZenMonolithBanner })));
const ZenLavaBanner = React.lazy(() => import('./CalmBanners').then(module => ({ default: module.ZenLavaBanner })));
const ZenMandalaBanner = React.lazy(() => import('./CalmBanners').then(module => ({ default: module.ZenMandalaBanner })));
const ZenAurorasBanner = React.lazy(() => import('./CalmBanners').then(module => ({ default: module.ZenAurorasBanner })));
const ZenPulseBanner = React.lazy(() => import('./CalmBanners').then(module => ({ default: module.ZenPulseBanner })));
const LiquidZenBanner = React.lazy(() => import('./CalmBanners').then(module => ({ default: module.LiquidZenBanner })));
const NeuralZenBanner = React.lazy(() => import('./CalmBanners').then(module => ({ default: module.NeuralZenBanner })));
const CosmicZenBanner = React.lazy(() => import('./CalmBanners').then(module => ({ default: module.CosmicZenBanner })));
const PrismaticZenBanner = React.lazy(() => import('./CalmBanners').then(module => ({ default: module.PrismaticZenBanner })));
const FloralZenBanner = React.lazy(() => import('./CalmBanners').then(module => ({ default: module.FloralZenBanner })));
const ZenRainBanner = React.lazy(() => import('./CalmBanners').then(module => ({ default: module.ZenRainBanner })));
const ZenFirefliesBanner = React.lazy(() => import('./CalmBanners').then(module => ({ default: module.ZenFirefliesBanner })));
const ZenGridBanner = React.lazy(() => import('./CalmBanners').then(module => ({ default: module.ZenGridBanner })));
const ZenHeartbeatBanner = React.lazy(() => import('./CalmBanners').then(module => ({ default: module.ZenHeartbeatBanner })));
const ZenRaindropsBanner = React.lazy(() => import('./CalmBanners').then(module => ({ default: module.ZenRaindropsBanner })));
const ZenLanternsBanner = React.lazy(() => import('./CalmBanners').then(module => ({ default: module.ZenLanternsBanner })));
const ZenTunnelBanner = React.lazy(() => import('./CalmBanners').then(module => ({ default: module.ZenTunnelBanner })));
const ZenBorealisBanner = React.lazy(() => import('./CalmBanners').then(module => ({ default: module.ZenBorealisBanner })));
const ZenGeodesicBanner = React.lazy(() => import('./CalmBanners').then(module => ({ default: module.ZenGeodesicBanner })));
const ZenMercuryBanner = React.lazy(() => import('./CalmBanners').then(module => ({ default: module.ZenMercuryBanner })));



/**
 * Resolves a banner color. Handles both hex colors and variant IDs.
 */
const resolveBannerColor = (color, profileBorderColor) => {
    if (!color) return profileBorderColor || '#7FFFD4';
    if (color.startsWith('#') || color === 'brand') return color;

    // Mapping for known variant IDs to colors
    const colorMap = {
        'solar_mint': '#7FFFD4', 'solar_pink': '#FF5C8A', 'solar_blue': '#1B82FF',
        'solar_purple': '#5A3FFF', 'solar_orange': '#FF914D', 'solar_ice': '#FFFFFF',
        'solar_classic': '#7FFFD4', 'solar_sunset': '#FF5C8A', 'solar_deep': '#1B82FF',
        'solar_void': '#5A3FFF', 'solar_monochrome': '#FFFFFF',
        'aurora_borealis': '#7FFFD4', 'aurora_australis': '#FF5C8A', 'aurora_polar': '#FFFFFF',
        'aurora_deep': '#1B82FF', 'aurora_plasma': '#FF5C8A', 'aurora_synth': '#7FFFD4',
        'aurora_rose': '#FF5C8A', 'aurora_mint': '#7FFFD4', 'aurora_spirit': '#A7B6FF',
        'aurora_azure': '#1B82FF', 'aurora_void': '#2A0E61', 'aurora_prism': '#7FFFD4'
    };

    return colorMap[color] || profileBorderColor || '#7FFFD4';
};

const BannerThemeRenderer = ({ mode, color, starSettings, overlays = [], profileBorderColor }) => {
    // Resolve the final color to be used to avoid "solar_purple" and other ID strings
    // from crashing canvas gradients in simple components.
    const activeColor = resolveBannerColor(color, profileBorderColor);
    const animationsEnabled = useFeedStore(state => state.animationsEnabled);
    const [showInfo, setShowInfo] = React.useState(false);
    const [copied, setCopied] = React.useState(false);

    const isCustom = mode === 'custom_oscillator' || mode === 'custom_flow' || mode === 'custom_city' || mode === 'custom_snapshot' || mode === 'custom_voxel';
    const seed = starSettings?.seed || 'panospace';
    const speed = starSettings?.speed || 1.0;

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(seed);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Calculate engine details for HUD
    const engineDetails = React.useMemo(() => {
        if (!isCustom) return null;

        const numericSeed = hashStr(seed);
        const rand = mulberry32(numericSeed);

        if (mode === 'custom_oscillator') {
            const symmetryVal = Math.floor(rand() * 4);
            const symmetryLabel = symmetryVal === 0 ? 'NONE' : symmetryVal === 1 ? 'HORIZ' : symmetryVal === 2 ? 'VERT' : 'QUAD';
            return {
                name: 'OSCILLATOR ENGINE',
                version: 'v1.2',
                mode: rand() > 0.5 ? 'lissajous' : 'oscillator',
                complexity: 500 + Math.floor(rand() * 1500),
                symmetry: symmetryLabel
            };
        } else if (mode === 'custom_flow') {
            return {
                name: 'FLOW FIELD ENGINE',
                version: 'v2.0',
                palette: 'GENERATE',
                particles: 200 + Math.floor(rand() * 300),
                curl: (2 + rand() * 6).toFixed(2)
            };
        } else if (mode === 'custom_city') {
            return {
                name: 'CITY GENERATOR',
                version: 'v3.0',
                blocks: 40 + Math.floor(rand() * 20),
                theme: seed.substring(0, 2).toUpperCase()
            };
        } else if (mode === 'custom_snapshot') {
            return {
                name: 'DEEP SPACE SNAPSHOT',
                version: 'v1.0',
                bodies: 3 + Math.floor(rand() * 3), // Stars + Planets abstracted count
                sector: seed.substring(0, 4).toUpperCase()
            };
        } else if (mode === 'custom_voxel') {
            return {
                name: 'VOXEL BIOME BUILDER',
                version: 'v1.0',
                grid: '12x12 ISO',
                biome: seed.substring(0, 3).toUpperCase()
            };
        }
        return null;
    }, [isCustom, mode, seed]);

    const overlayStyle = {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
    };

    const renderContent = () => {
        // --- NEW CUSTOM SEED BANNER ---
        if (mode === 'custom_oscillator') {
            return <SeedOscillatorBanner seed={starSettings?.seed || 'panospace'} color={activeColor} speed={starSettings?.speed || 1.0} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'custom_flow') {
            return <FlowFieldBanner seed={starSettings?.seed || 'panospace'} color={activeColor} speed={starSettings?.speed || 1.0} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'custom_city') {
            return <SeededCityBanner seed={starSettings?.seed || 'panospace'} color={activeColor} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'custom_voxel') {
            return <SeededVoxelBanner seed={starSettings?.seed || 'panospace'} animationsEnabled={animationsEnabled} />;
        }

        // --- NEW TECHNICOLOR TECH BANNER ---
        if (mode === 'technicolor_hardware') {
            return <TechnicolorTechBanner variant={color} />;
        }

        // --- NEW WINDOW BANNERS ---
        if (mode === 'window_train') {
            return <TrainWindowBanner starSettings={starSettings} variant={color || 'night'} />;
        }
        if (mode === 'window_shuttle') {
            return <ShuttleWindowBanner starSettings={starSettings} variant={color || 'shuttle_orbit'} />;
        }
        if (mode === 'window_plane') {
            return <PlaneWindowBanner variant={color || 'plane_night'} />;
        }
        if (mode === 'window_metro') {
            return <MetroWindowBanner variant={color || 'metro_tunnel'} />;
        }
        if (mode === 'window_boat') {
            return <BoatWindowBanner starSettings={starSettings} variant={color || 'boat_storm'} />;
        }
        if (mode === 'window_submarine') {
            return <SubmarineWindowBanner variant={color || 'sub_reef'} />;
        }
        if (mode === 'window_rocket') {
            return <RocketWindowBanner starSettings={starSettings} variant={color || 'rocket_warp'} />;
        }
        if (mode === 'window_aquarium') {
            return <AquariumWindowBanner variant={color || 'marine_blue'} />;
        }
        if (mode === 'window_aquarium_dual') {
            return <SplitAquariumBanner variant={color || 'marine_blue'} />;
        }
        if (mode === 'window_apartment') {
            return <ApartmentWindowBanner starSettings={starSettings} variant={color || 'apt_lofi'} />;
        }
        if (mode === 'window_skydrive') {
            return <SkyDriveBanner starSettings={starSettings} variant={color || 'velocity_blue'} />;
        }
        if (mode === 'window_botanical') {
            return <SpaceStationWindowBanner variant={color || 'station_moon'} />;
        }
        if (mode === 'window_lava') {
            return <LavaLampBanner variant={color || 'lava_plasma'} />;
        }
        if (mode === 'window_omni') {
            return <OmniPortalBanner variant={color || 'omni_storm'} />;
        }
        // 6. LIQUID DYNAMICS PACK
        if (mode === 'liquid_gossamer') return <GossamerLiquidBanner />;
        if (mode === 'liquid_kinetic') return <CyberKineticBanner />;
        if (mode === 'liquid_lava_flow') {
            return <LavaFlowBanner profileBorderColor={profileBorderColor} variant={color} />;
        }

        // 5. CITYSCAPE PACK
        if (mode.startsWith('city') || mode === 'panospace_beyond') {
            if (mode === 'city_vista') {
                return <CityVistaBanner starSettings={starSettings} />;
            }
            return <CityscapeBanner themeId={mode} starSettings={starSettings} />;
        }

        // 6. OCEAN PACK
        // 6. OCEAN PACK
        if ((mode.startsWith('ocean') && mode !== 'ocean_depths') || mode === 'deep_underwater') {
            if (mode === 'ocean_lighthouse' || mode === 'ocean_lighthouse_night') {
                return <LighthouseOceanBanner starSettings={starSettings} variant={mode} />;
            }
            const themeToUse = mode === 'deep_underwater' ? 'ocean_night_bio' : mode;
            return <OceanBanner themeId={themeToUse} starSettings={starSettings} />;
        }

        // 6.5 ABSTRACT PACK
        // 6.5 ABSTRACT PACK & MATH PACK
        if (mode === 'math_god_equation') {
            return <GodEquationBanner profileBorderColor={activeColor} />;
        }
        if (mode === 'math_solar_system') {
            return <SolarSystemBanner profileBorderColor={activeColor} variant={color} starSettings={starSettings} />;
        }

        // --- ADVANCED 3D MATH PACK ---
        if (mode === 'math_butterfly_effect') {
            const lorenzVariant = color?.includes('rainbow') ? 'rainbow' : (color || 'classic');
            return <LorenzAttractorBanner profileBorderColor={activeColor} variant={lorenzVariant} />;
        }
        if (mode === 'math_gravitational_dance') {
            return <ParticlePhysicsBanner profileBorderColor={activeColor} />;
        }
        if (mode === 'math_golden_spiral') {
            return <FibonacciSpiralBanner profileBorderColor={activeColor} />;
        }

        // --- ZEN & CALM PACK ---
        if (mode === 'zen_silk_flow') return <SilkFlowBanner profileBorderColor={activeColor} />;
        if (mode === 'zen_ripples') return <ZenRipplesBanner profileBorderColor={activeColor} />;
        if (mode === 'zen_bokeh') return <DreamyBokehBanner profileBorderColor={activeColor} />;
        if (mode === 'zen_mist') return <MistyCloudsBanner profileBorderColor={activeColor} />;
        if (mode === 'zen_stars') return <SoothingStarsBanner profileBorderColor={activeColor} />;
        if (mode === 'zen_monolith') return <ZenMonolithBanner profileBorderColor={activeColor} />;
        if (mode === 'zen_lava') return <ZenLavaBanner profileBorderColor={activeColor} />;
        if (mode === 'zen_mandala') return <ZenMandalaBanner profileBorderColor={activeColor} />;
        if (mode === 'zen_aurora') return <ZenAurorasBanner profileBorderColor={activeColor} />;
        if (mode === 'zen_pulse') return <ZenPulseBanner profileBorderColor={activeColor} />;
        if (mode === 'zen_liquid') return <LiquidZenBanner profileBorderColor={activeColor} />;
        if (mode === 'zen_neural') return <NeuralZenBanner profileBorderColor={activeColor} />;
        if (mode === 'zen_cosmic') return <CosmicZenBanner profileBorderColor={activeColor} />;
        if (mode === 'zen_prismatic') return <PrismaticZenBanner profileBorderColor={activeColor} />;
        if (mode === 'zen_floral') return <FloralZenBanner profileBorderColor={activeColor} />;
        if (mode === 'zen_rain') return <ZenRainBanner profileBorderColor={activeColor} />;
        if (mode === 'zen_fireflies') return <ZenFirefliesBanner profileBorderColor={activeColor} />;
        if (mode === 'zen_grid') return <ZenGridBanner profileBorderColor={activeColor} />;
        if (mode === 'zen_heartbeat') return <ZenHeartbeatBanner profileBorderColor={activeColor} />;
        if (mode === 'zen_raindrops') return <ZenRaindropsBanner profileBorderColor={activeColor} />;
        if (mode === 'zen_lanterns') return <ZenLanternsBanner profileBorderColor={activeColor} />;
        if (mode === 'zen_tunnel') return <ZenTunnelBanner profileBorderColor={activeColor} />;
        if (mode === 'zen_garden') return <ZenGardenBanner profileBorderColor={activeColor} animationsEnabled={animationsEnabled} />;
        if (mode === 'zen_sky') return <ZenSkyBanner profileBorderColor={activeColor} animationsEnabled={animationsEnabled} />;
        if (mode === 'zen_ocean') return <ZenOceanBanner profileBorderColor={activeColor} animationsEnabled={animationsEnabled} />;
        if (mode === 'zen_eclipse') return <ZenEclipseBanner profileBorderColor={activeColor} animationsEnabled={animationsEnabled} />;
        if (mode === 'zen_borealis') return <ZenBorealisBanner profileBorderColor={activeColor} animationsEnabled={animationsEnabled} />;
        if (mode === 'zen_geodesic') return <ZenGeodesicBanner profileBorderColor={activeColor} />;
        if (mode === 'zen_mercury') return <ZenMercuryBanner profileBorderColor={activeColor} animationsEnabled={animationsEnabled} />;
        if (mode === 'abstract_oscilloscope' || mode.startsWith('math_') || mode.startsWith('os_')) {
            const variantId = mode === 'abstract_oscilloscope' ? color : mode;
            return <OscilloscopeBanner color={activeColor} variant={variantId} profileBorderColor={profileBorderColor} starSettings={starSettings} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'abstract_lava_cube') {
            return <LavaCubeBanner color={activeColor} profileBorderColor={activeColor} starSettings={starSettings} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'abstract_omni_paradox') {
            return <OmniParadoxBanner color={activeColor} profileBorderColor={activeColor} starSettings={starSettings} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'abstract_scifi_ui') {
            return <SciFiUiBanner />;
        }
        if (mode === 'abstract_neural_silk') {
            return <AbsoluteAbstractBanner variant={mode} color={activeColor} />;
        }
        if (mode === 'abstract_genesis_core') {
            return <GenesisAbstractBanner color={activeColor} />;
        }
        if (mode === 'abstract_singularity') {
            return <SingularityBanner color={activeColor} />;
        }
        if (mode === 'abstract_black_mirror') {
            return <BlackMirrorBanner color={activeColor} />;
        }
        if (mode === 'abstract_pinball') {
            return <PinballBanner color={activeColor} />;
        }

        // 7. COSMIC EARTH (Station Theme)
        if (mode === 'cosmic-earth') {
            return <EarthBanner color={activeColor} starSettings={starSettings} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'cosmic_black_hole') {
            return <BlackHoleBanner color={activeColor} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'cosmic_singularity_city') {
            return <SingularityCityBanner color={activeColor} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'cosmic_nebula') {
            return <NebulaBanner color={activeColor} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'cosmic_galaxy') {
            return <GalaxyBanner color={activeColor} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'cosmic_aether_gate') {
            return <AetherGateBanner color={activeColor} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'cosmic_seraphim') {
            return <SeraphimBanner color={activeColor} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'cosmic_omegasphere') {
            return <OmegasphereBanner color={activeColor} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'cosmic_infinite') {
            return <InfiniteBanner color={activeColor} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'cosmic_ascendant') {
            return <AscendantBanner color={activeColor} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'cosmic_apex') {
            return <ApexBanner color={activeColor} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'cosmic_paradox') {
            return <ParadoxBanner color={activeColor} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'cosmic_opus') {
            return <SpectrumBanner color={activeColor} />;
        }
        if (mode === 'cosmic_flux') {
            return <FluxBanner color={activeColor} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'cosmic_ether') {
            return <EtherBanner color={activeColor} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'cosmic_resonance') {
            return <ResonanceBanner color={activeColor} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'cosmic_interference') {
            return <InterferenceBanner color={activeColor} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'cosmic_omniscience') {
            return <OmniscienceBanner color={activeColor} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'cosmic_absolute') {
            return <AbsoluteBanner color={activeColor} animationsEnabled={animationsEnabled} />;
        }

        if (mode === 'iso_wave') {
            return <IsoWaveBanner color={activeColor} starSettings={starSettings} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'marmoris') {
            return <MarmorisBanner variant={color || 'main'} starSettings={starSettings} profileBorderColor={activeColor} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'wave_grid') {
            return <WaveGridBanner color={activeColor} starSettings={starSettings} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'cosmic_omega_borealis') {
            return <OmegaBorealis animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'elysium') {
            return <ElysiumBanner starSettings={starSettings} animationsEnabled={animationsEnabled} />;
        }

        // --- ATMOS BANNERS ---
        if (mode === 'atmos_pulse') {
            return <PulseBanner starSettings={starSettings} variant={color} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'atmos_flux') {
            return <FluxBanner variant={color || 'main'} starSettings={starSettings} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'atmos_aether') {
            return <AetherBanner starSettings={starSettings} variant={color} animationsEnabled={animationsEnabled} />;
        }
        if (mode === 'atmos_globe') {
            return <GlobeBanner starSettings={starSettings} variant={color} animationsEnabled={animationsEnabled} />;
        }

        if (mode === 'cosmic_dreamworld') {
            return <DreamworldBanner animationsEnabled={animationsEnabled} />;
        }

        // 7.5 SYSTEM ENVIRONMENTS (Memory)
        if (mode.startsWith('system_')) {
            return <StaticSystemBanners variant={mode} />;
        }

        // 8. PLANET - Abstract cosmic border (Over-Designed Premium)
        if (mode === 'planet') {
            const isBrand = starSettings?.color === 'brand' || starSettings?.color === BRAND_RAINBOW;
            const starColor = (starSettings?.color && !isBrand) ? starSettings.color : color;

            return (
                <div style={overlayStyle}>
                    <div style={{ position: 'absolute', inset: 0, background: '#020202', zIndex: 0 }} />

                    {/* Animated Stars */}
                    {starSettings?.enabled && (
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            zIndex: 0
                        }}>
                            {React.useMemo(() => {
                                const brandColors = ['#7FFFD4', '#FF5C8A', '#5A3FFF', '#1B82FF', '#FF914D'];
                                return [...Array(50)].map((_, i) => {
                                    const thisStarColor = isBrand
                                        ? brandColors[Math.floor(Math.random() * brandColors.length)]
                                        : starColor;
                                    return (
                                        <div
                                            key={i}
                                            style={{
                                                position: 'absolute',
                                                width: Math.random() * 2 + 1 + 'px',
                                                height: Math.random() * 2 + 1 + 'px',
                                                background: thisStarColor,
                                                borderRadius: '50%',
                                                top: Math.random() * 90 + '%', // Keep stars slightly higher
                                                left: Math.random() * 100 + '%',
                                                opacity: Math.random() * 0.6 + 0.2,
                                                animation: `twinkle ${Math.random() * 4 + 2}s ease-in-out infinite`,
                                                animationDelay: `${Math.random() * 3}s`,
                                                boxShadow: `0 0 ${Math.random() * 4 + 2}px ${thisStarColor}`,
                                                willChange: 'opacity'
                                            }}
                                        />
                                    );
                                });
                            }, [isBrand, starColor])}
                        </div>
                    )}

                    {/* 
                    THE PLANET HORIZON
                    "Over-designed the f*** out of it"
                */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-930px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '1000px',
                        height: '1000px',
                        borderRadius: '50%',
                        zIndex: 2,
                        padding: '4px', // Thicker premium bezel
                        // Complex Conic Gradient for "Space Age" metallic lighting (Blue & Purple Only)
                        background: 'conic-gradient(from 180deg at 50% 50%, #000000 120deg, #1B82FF 160deg, #5A3FFF 200deg, #000000 240deg)',
                        // Multi-layered "Shocking" Glow
                        boxShadow: `
                        0 -2px 10px rgba(27, 130, 255, 0.5),   /* Sharp Blue Highlight */
                        0 -10px 40px rgba(90, 63, 255, 0.4),   /* Deep Purple Atmosphere */
                        0 -30px 100px rgba(27, 130, 255, 0.3), /* Wide Blue Ambience */
                        inset 0 2px 20px rgba(255, 255, 255, 0.1) /* Inner Rim Light */
                    `
                    }}>
                        {/* Inner Void - Pitch Black with Gloss */}
                        <div style={{
                            width: '100%',
                            height: '100%',
                            background: '#000',
                            borderRadius: '50%',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Glossy Reflection on the dark side */}
                            <div style={{
                                position: 'absolute',
                                top: '0', left: '10%', right: '10%', height: '200px',
                                background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.05) 0%, transparent 60%)',
                                filter: 'blur(10px)'
                            }} />
                        </div>
                    </div>

                    {/* Atmospheric Haze Layer - SIGNIFICANTLY DARKENED */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0, left: 0, right: 0, height: '150px',
                        // Reduced opacity from 0.15/0.05 to 0.08/0.02 for subtler effect
                        background: 'linear-gradient(to top, rgba(27, 130, 255, 0.08) 0%, rgba(90, 63, 255, 0.02) 40%, transparent 100%)',
                        zIndex: 1,
                        pointerEvents: 'none',
                        mixBlendMode: 'screen'
                    }} />

                    <style>{`
                    @keyframes twinkle {
                        0%, 100% { opacity: 0.3; transform: scale(1); }
                        50% { opacity: 1; transform: scale(1.2); }
                    }
                `}</style>
                </div>
            );
        }

        // 9. ICE PLANET - Frozen World with Aurora
        if (mode === 'ice-planet') {
            const starColor = '#E0FFFF'; // Force Light Cyan (Ice) stars

            return (
                <div style={overlayStyle}>
                    {/* 1. Deep Cold Space Background */}
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 120%, #001529 0%, #000510 60%, #000000 100%)', zIndex: 0 }} />

                    {/* 2. Stars (Ice Cold) */}
                    {starSettings?.enabled && (
                        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                            {React.useMemo(() => [...Array(60)].map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        position: 'absolute',
                                        width: Math.random() * 2 + 1 + 'px',
                                        height: Math.random() * 2 + 1 + 'px',
                                        background: starColor,
                                        borderRadius: '50%',
                                        top: Math.random() * 90 + '%',
                                        left: Math.random() * 100 + '%',
                                        opacity: Math.random() * 0.7 + 0.3,
                                        boxShadow: `0 0 ${Math.random() * 4 + 1}px ${starColor}`,
                                        animation: `twinkle ${Math.random() * 4 + 3}s ease-in-out infinite`,
                                        animationDelay: `${Math.random() * 5}s`
                                    }}
                                />
                            )), [])}
                        </div>
                    )}

                    {/* 3. The Aurora Borealis (Matched Geometry to Planet) */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 3, // ON TOP of the planet
                        pointerEvents: 'none',
                        mixBlendMode: 'screen',
                        overflow: 'hidden'
                    }}>
                        <svg style={{ width: 0, height: 0, position: 'absolute' }}>
                            <defs>
                                <filter id="aurora-spikes">
                                    <feTurbulence type="fractalNoise" baseFrequency="0.004 0.04" numOctaves="5" result="noise" />
                                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="100" yChannelSelector="R" />
                                    <feGaussianBlur stdDeviation="2" />
                                </filter>
                            </defs>
                        </svg>

                        {/* Green Glow Base (Atmosphere) */}
                        <div style={{
                            position: 'absolute', left: '50%', bottom: '-930px', width: '1020px', height: '1020px', transform: 'translateX(-50%)', borderRadius: '50%',
                            boxShadow: `0 -10px 80px rgba(0, 255, 136, 0.4), inset 0 20px 60px rgba(0, 255, 136, 0.2)`,
                            opacity: 0.8
                        }} />

                        {/* Main Green Spiky Curtains (Mathematically aligned to surface) */}
                        <div style={{
                            // Center Alignment: Planet Center Y ~ -430px. Div Height 1600. Bottom = -430 - 800 = -1230.
                            position: 'absolute', left: '50%', bottom: '-1230px', width: '1600px', height: '1600px',
                            transform: 'translateX(-50%)',
                            borderRadius: '50%',
                            filter: 'url(#aurora-spikes) brightness(1.3) contrast(1.2)',
                            background: `conic-gradient(
                            from 170deg at 50% 50%, 
                            transparent 0deg, 
                            rgba(0, 255, 136, 0) 5deg, 
                            rgba(0, 255, 136, 0.9) 15deg, 
                            rgba(127, 255, 212, 0.6) 25deg, 
                            rgba(0, 255, 136, 0.8) 35deg, 
                            rgba(127, 255, 212, 0) 45deg
                        )`,
                            // Mask Start: Radius 500px (Planet Surface). 500/800 = 62.5%
                            maskImage: 'radial-gradient(circle at 50% 50%, transparent 62%, black 63%, black 70%, transparent 80%)',
                            WebkitMaskImage: 'radial-gradient(circle at 50% 50%, transparent 62%, black 63%, black 70%, transparent 80%)',
                            opacity: 1.0, mixBlendMode: 'normal'
                        }} />

                        {/* Purple Background Haze */}
                        <div style={{
                            position: 'absolute', left: '50%', bottom: '-1230px', width: '1800px', height: '1800px', transform: 'translateX(-50%) rotate(10deg)', borderRadius: '50%',
                            filter: 'blur(50px)',
                            background: `conic-gradient(from 150deg at 50% 50%, transparent 0deg, rgba(90, 63, 255, 0.0) 10deg, rgba(90, 63, 255, 0.6) 30deg, rgba(90, 63, 255, 0.0) 70deg)`,
                            // Wider mask for haze
                            maskImage: 'radial-gradient(circle at 50% 50%, transparent 55%, black 60%, transparent 80%)',
                            WebkitMaskImage: 'radial-gradient(circle at 50% 50%, transparent 55%, black 60%, transparent 80%)',
                            opacity: 0.8, mixBlendMode: 'screen'
                        }} />

                        {/* Pink Shimmers */}
                        <div style={{
                            position: 'absolute', left: '50%', bottom: '-1230px', width: '1600px', height: '1600px', transform: 'translateX(-50%)', borderRadius: '50%',
                            filter: 'url(#aurora-spikes) blur(1px)',
                            background: `conic-gradient(
                            from 165deg at 50% 50%, 
                            transparent 0deg, 
                            transparent 15deg, 
                            rgba(255, 42, 109, 0.9) 18deg, 
                            transparent 20deg, 
                            transparent 35deg, 
                            rgba(255, 42, 109, 0.7) 38deg, 
                            transparent 42deg
                        )`,
                            maskImage: 'radial-gradient(circle at 50% 50%, transparent 62%, black 63%, black 70%, transparent 80%)',
                            WebkitMaskImage: 'radial-gradient(circle at 50% 50%, transparent 62%, black 63%, black 70%, transparent 80%)',
                            opacity: 0.9, mixBlendMode: 'screen'
                        }} />
                    </div>


                    {/* 4. The ICE PLANET Horizon */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-930px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '1000px',
                        height: '1000px',
                        borderRadius: '50%',
                        zIndex: 2,
                        padding: '0', // No border, the glow is the border

                        // FROZEN GLOW
                        boxShadow: `
                        0 -5px 30px rgba(127, 255, 212, 0.6),   /* Intense Mint Rim */
                        0 -20px 80px rgba(27, 130, 255, 0.5),   /* Deep Blue Atmosphere */
                        inset 0 10px 50px rgba(255, 255, 255, 0.4) /* Inner Ice Reflection */
                    `
                    }}>
                        {/* Planet Surface Texture */}
                        <div style={{
                            width: '100%', height: '100%', borderRadius: '50%',
                            overflow: 'hidden',
                            position: 'relative',
                            // Base Ice Gradient
                            background: 'radial-gradient(circle at 50% 0%, #D4F1F9 0%, #7FDBFF 20%, #1B82FF 50%, #001529 100%)',
                        }}>
                            {/* Crushed Ice Texture Overlay */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.3'/%3E%3C/svg%3E")`,
                                mixBlendMode: 'overlay',
                                opacity: 0.5
                            }} />

                            {/* Frozen Cracks / Veins (CSS Pattern) */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'repeating-conic-gradient(from 0deg at 50% -20%, transparent 0deg, rgba(255,255,255,0.1) 2deg, transparent 4deg)',
                                opacity: 0.3,
                                mixBlendMode: 'screen'
                            }} />

                            {/* Glossy Top Shine */}
                            <div style={{
                                position: 'absolute', top: 0, left: '20%', right: '20%', height: '150px',
                                background: 'linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, transparent 100%)',
                                filter: 'blur(20px)',
                                borderRadius: '50%'
                            }} />
                        </div>
                    </div>
                </div>
            );
        }


        // 10. NORTHERN LIGHTS & AURORA
        if (mode === 'northern-lights') {
            const AURORA_PALETTES = {
                aurora_borealis: { main: '127, 255, 212', secondary: '127, 255, 212', spike: '255, 255, 255', star: '#E0FFFF' },
                aurora_australis: { main: '255, 92, 138', secondary: '90, 63, 255', spike: '255, 183, 213', star: '#FFB7D5' },
                aurora_polar: { main: '127, 255, 212', secondary: '255, 255, 255', spike: '127, 255, 212', star: '#FFFFFF' },
                aurora_deep: { main: '90, 63, 255', secondary: '27, 130, 255', spike: '167, 182, 255', star: '#7FDBFF' },
                aurora_plasma: { main: '255, 92, 138', secondary: '90, 63, 255', spike: '127, 255, 212', star: '#FFD700' },
                aurora_synth: { main: '127, 255, 212', secondary: '90, 63, 255', spike: '255, 92, 138', star: '#A7B6FF' },
                aurora_rose: { main: '255, 92, 138', secondary: '255, 183, 213', spike: '255, 92, 138', star: '#FFB7D5' },
                aurora_mint: { main: '127, 255, 212', secondary: '140, 255, 233', spike: '255, 255, 255', star: '#E0FFFF' },
                aurora_spirit: { main: '167, 182, 255', secondary: '255, 255, 255', spike: '167, 182, 255', star: '#FFFFFF' },
                aurora_azure: { main: '27, 130, 255', secondary: '127, 219, 255', spike: '27, 130, 255', star: '#7FDBFF' },
                aurora_void: { main: '42, 14, 97', secondary: '90, 63, 255', spike: '167, 182, 255', star: '#5A3FFF' },
                aurora_prism: { main: '0, 255, 136', secondary: '255, 92, 138', spike: '27, 130, 255', star: '#FFFFFF' },
                // Fallbacks
                aurora_solar: { main: '255, 68, 68', secondary: '255, 160, 122', spike: '255, 215, 0', star: '#FFD700' },
                main: { main: '140, 255, 233', secondary: '90, 63, 255', spike: '255, 42, 109', star: '#E0FFFF' }
            };
            const p = AURORA_PALETTES[color] || AURORA_PALETTES.aurora_borealis;

            return (
                <div style={overlayStyle}>
                    {/* 1. Deep Night Sky Background */}
                    <div style={{ position: 'absolute', inset: 0, background: '#020205', zIndex: 0 }} />

                    {/* Stars */}
                    {starSettings?.enabled && (
                        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                            {React.useMemo(() => [...Array(80)].map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        position: 'absolute',
                                        width: Math.random() * 2 + 1 + 'px',
                                        height: Math.random() * 2 + 1 + 'px',
                                        background: p.star,
                                        borderRadius: '50%',
                                        top: Math.random() * 100 + '%',
                                        left: Math.random() * 100 + '%',
                                        opacity: Math.random() * 0.7 + 0.3,
                                        boxShadow: `0 0 ${Math.random() * 3 + 1}px ${p.star}`,
                                        animation: `twinkle ${Math.random() * 4 + 3}s ease-in-out infinite`,
                                        animationDelay: `${Math.random() * 5}s`
                                    }}
                                />
                            )), [p.star])}
                        </div>
                    )}

                    {/* THE AURORA BOREALIS - Full Sky Curtains */}
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', mixBlendMode: 'screen', overflow: 'hidden'
                    }}>
                        <svg style={{ width: 0, height: 0, position: 'absolute' }}>
                            <defs>
                                <filter id="aurora-curtains">
                                    {/* Vertical stretch for curtain look */}
                                    <feTurbulence type="fractalNoise" baseFrequency="0.002 0.04" numOctaves="3" result="noise" />
                                    {/* Extreme horizontal displacement to shred it into curtains */}
                                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="200" xChannelSelector="R" yChannelSelector="G" />
                                    <feGaussianBlur stdDeviation="8" />
                                </filter>
                            </defs>
                        </svg>

                        {/* Layer 1: Purple/Blue Deep Atmosphere wash */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            background: 'linear-gradient(to top, rgba(90, 63, 255, 0.1) 0%, rgba(27, 130, 255, 0.0) 50%, rgba(90, 63, 255, 0.4) 100%)',
                            filter: 'blur(30px)', opacity: 0.8
                        }} />

                        {/* Layer 2: Main Ribbon (Wavy Curtains) */}
                        <div style={{
                            position: 'absolute', top: '-20%', left: '-20%', right: '-20%', bottom: '-20%',
                            transform: 'perspective(500px) rotateX(10deg) skewY(-5deg)',
                            filter: 'url(#aurora-curtains) brightness(1.4)',
                            background: `repeating-linear-gradient(90deg, transparent, rgba(${p.main}, 0.1) 5%, rgba(${p.main}, 0.8) 15%, rgba(${p.secondary}, 0.5) 25%, transparent 35%, transparent 60%)`,
                            opacity: 0.9,
                            mixBlendMode: 'normal'
                        }} />

                        {/* Layer 3: Secondary Curtains (Offset) */}
                        <div style={{
                            position: 'absolute', top: '20%', left: '-20%', right: '-20%', bottom: '-20%',
                            transform: 'perspective(500px) rotateX(20deg) skewY(2deg)',
                            filter: 'url(#aurora-curtains) hue-rotate(30deg)',
                            background: `repeating-linear-gradient(90deg, transparent, transparent 30%, rgba(${p.main}, 0.5) 45%, transparent 60%)`,
                            opacity: 0.7, mixBlendMode: 'screen'
                        }} />

                        {/* Layer 4: Ionization Spikes */}
                        <div style={{
                            position: 'absolute', top: '-10%', left: '-10%', right: '-10%', bottom: '0',
                            transform: 'perspective(500px) rotateX(15deg) skewY(-2deg)',
                            filter: 'url(#aurora-curtains) blur(2px)',
                            background: `repeating-linear-gradient(90deg, transparent, transparent 40%, rgba(${p.spike}, 0.7) 42%, transparent 45%, transparent 80%, rgba(${p.spike}, 0.6) 82%, transparent 85%)`,
                            opacity: 1, mixBlendMode: 'screen'
                        }} />

                        {/* Layer 5: Bright White Bottom Definition */}
                        <div style={{
                            position: 'absolute', bottom: '10%', left: '-20%', right: '-20%', height: '30%',
                            filter: 'blur(15px)',
                            background: `radial-gradient(ellipse at 50% 100%, rgba(${p.secondary}, 0.4) 0%, transparent 60%)`,
                            opacity: 0.6, mixBlendMode: 'overlay'
                        }} />
                    </div>
                </div>
            );
        }
        if (mode === 'aurora') {
            return <AuroraBanner variant={color} starSettings={starSettings} />;
        }




        // 1. CYBERPUNK LINES - Futurstic HUD style
        if (mode === 'cyberpunkLines') {
            const isBrand = color === 'brand';
            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#7FFFD4');
                return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 255, 255';
            };
            const colorRgb = hexToRgb(activeColor);

            // Brand Palette
            const colors = {
                mint: '#7FFFD4',
                pink: '#FF5C8A',
                purple: '#5A3FFF',
                blue: '#1B82FF',
                orange: '#FF914D'
            };

            return (
                <div style={overlayStyle}>
                    {/* Tron Rainbow Grid - Static 2D version */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        zIndex: 0,
                        background: isBrand
                            ? 'linear-gradient(135deg, #7FFFD4, #FF5C8A, #5A3FFF, #1B82FF)'
                            : `rgba(${colorRgb}, 0.5)`,
                        WebkitMaskImage: `
                        linear-gradient(to bottom, #000 1px, transparent 1px),
                        linear-gradient(to right, #000 1px, transparent 1px)
                    `,
                        WebkitMaskSize: '30px 30px',
                        maskImage: `
                        linear-gradient(to bottom, #000 1px, transparent 1px),
                        linear-gradient(to right, #000 1px, transparent 1px)
                    `,
                        maskSize: '30px 30px',
                        opacity: 0.4,
                        filter: 'drop-shadow(0 0 5px rgba(127, 255, 212, 0.5))'
                    }} />

                    {/* Ambient Void Glow */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.8) 100%)',
                        zIndex: 1
                    }} />

                    {/* SVG HUD Frame */}
                    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
                        <defs>
                            <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={colors.mint} />
                                <stop offset="25%" stopColor={colors.pink} />
                                <stop offset="50%" stopColor={colors.purple} />
                                <stop offset="75%" stopColor={colors.blue} />
                                <stop offset="100%" stopColor={colors.orange} />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Top Left Bracket */}
                        <path d="M10,40 V10 H40" fill="none" stroke={isBrand ? 'url(#rainbowGrad)' : color} strokeWidth="2" filter="url(#glow)" />
                        <circle cx="10" cy="10" r="2" fill={isBrand ? colors.mint : color} filter="url(#glow)" />

                        {/* Top Right Bracket */}
                        <path d="Mcalc(100% - 40),10 Hcalc(100% - 10) V40" fill="none" stroke={isBrand ? 'url(#rainbowGrad)' : color} strokeWidth="2" filter="url(#glow)" />
                        <circle cx="calc(100% - 10)" cy="10" r="2" fill={isBrand ? colors.pink : color} filter="url(#glow)" />

                        {/* Bottom Left Bracket */}
                        <path d="M10,calc(100% - 40) Vcalc(100% - 10) H40" fill="none" stroke={isBrand ? 'url(#rainbowGrad)' : color} strokeWidth="2" filter="url(#glow)" />
                        <circle cx="10" cy="calc(100% - 10)" r="2" fill={isBrand ? colors.blue : color} filter="url(#glow)" />

                        {/* Connecting Data Lines - Thin & Low Opacity */}
                        <path d="M60,10 Hcalc(100% - 60)" stroke={isBrand ? 'url(#rainbowGrad)' : color} strokeWidth="1" strokeOpacity="0.3" strokeDasharray="5 5" />
                        <path d="M10,60 Vcalc(100% - 60)" stroke={isBrand ? 'url(#rainbowGrad)' : color} strokeWidth="1" strokeOpacity="0.3" strokeDasharray="5 5" />
                        <path d="Mcalc(100% - 10),60 Vcalc(100% - 60)" stroke={isBrand ? 'url(#rainbowGrad)' : color} strokeWidth="1" strokeOpacity="0.3" strokeDasharray="5 5" />

                        {/* Decorative Circuit Nodes */}
                        <circle cx="50" cy="20" r="1.5" fill={isBrand ? colors.mint : color} fillOpacity="0.5" />
                        <circle cx="70" cy="20" r="1.5" fill={isBrand ? colors.pink : color} fillOpacity="0.5" />
                        <line x1="50" y1="20" x2="80" y2="20" stroke={isBrand ? 'url(#rainbowGrad)' : color} strokeWidth="1" strokeOpacity="0.3" />
                    </svg>

                    {/* Central Pulse */}
                    <div style={{
                        position: 'absolute',
                        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        width: '60%', height: '60%',
                        background: isBrand
                            ? `radial-gradient(circle, rgba(127, 255, 212, 0.1) 0%, rgba(90, 63, 255, 0.05) 40%, transparent 70%)`
                            : `radial-gradient(circle, rgba(${colorRgb}, 0.1) 0%, transparent 70%)`,
                        animation: 'gentlePulse 4s infinite ease-in-out'
                    }} />
                    <style>{`@keyframes gentlePulse { 0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); } }`}</style>
                </div>
            );
        }

        // 2. NEON GRID - Retrowave / TRON
        if (mode === 'neonGrid') {
            const isBrand = color === 'brand';
            const gridColor = activeColor;
            const brandRainbow = 'linear-gradient(to right, #FF914D, #FF5C8A, #FFB7D5, #5A3FFF, #A7B6FF, #1B82FF, #7FDBFF, #7FFFD4)';

            return (
                <div style={overlayStyle}>
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: '#000'
                    }} />

                    {/* Perspective Grid */}
                    <div style={{
                        position: 'absolute',
                        inset: '-100% -50%',
                        width: '200%',
                        height: '200%',
                        background: isBrand
                            ? 'linear-gradient(to right, #7FFFD4, #FF5C8A, #5A3FFF, #1B82FF)'
                            : gridColor,
                        WebkitMaskImage: `
                        linear-gradient(#000 2px, transparent 2px),
                        linear-gradient(90deg, #000 2px, transparent 2px)
                    `,
                        WebkitMaskSize: '60px 60px',
                        maskImage: `
                        linear-gradient(#000 2px, transparent 2px),
                        linear-gradient(90deg, #000 2px, transparent 2px)
                    `,
                        maskSize: '60px 60px',
                        transform: 'perspective(400px) rotateX(65deg) translateY(-80px)',
                        animation: 'gridScroll 15s linear infinite',
                        opacity: isBrand ? 0.6 : 0.4,
                        filter: `drop-shadow(0 0 8px ${isBrand ? '#5A3FFF' : gridColor})`
                    }} />

                    {/* Horizon Glow */}
                    <div style={{
                        position: 'absolute',
                        bottom: '40%',
                        left: 0, right: 0, height: '2px',
                        background: isBrand ? brandRainbow : gridColor,
                        boxShadow: `0 0 20px 2px ${isBrand ? '#5A3FFF' : gridColor}`,
                        zIndex: 3
                    }} />

                    {/* Fog Fade */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to bottom, #000 20%, transparent 45%, transparent 70%, rgba(0,0,0,0.5) 100%)',
                        zIndex: 2
                    }} />

                    {/* Bottom Reflection Glow */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0, left: 0, right: 0, height: '40%',
                        background: `linear-gradient(to top, ${isBrand ? '#5A3FFF20' : gridColor + '20'} 0%, transparent 100%)`,
                        zIndex: 1
                    }} />

                    <style>{`@keyframes gridScroll { from { background-position: 0 0; } to { background-position: 0 60px; } }`}</style>
                </div>
            );
        }

        // 3. UNDERWATER - Atmospheric Depth
        if (mode === 'underwaterY2K') {
            const isBrand = color === 'brand';

            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#7FFFD4');
                return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 255, 255';
            };

            const colorRgb = hexToRgb(activeColor);

            // Brand Rainbow Support - Randomized Splotches
            const brandRainbowSplotches = `
            radial-gradient(circle at 10% 20%, rgba(127, 255, 212, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 90% 80%, rgba(255, 92, 138, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(90, 63, 255, 0.4) 0%, transparent 60%),
            radial-gradient(circle at 30% 70%, rgba(27, 130, 255, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 70% 30%, rgba(255, 145, 77, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 80% 10%, rgba(255, 183, 213, 0.3) 0%, transparent 40%),
            radial-gradient(circle at 20% 90%, rgba(127, 219, 255, 0.3) 0%, transparent 40%)
        `;

            return (
                <div style={overlayStyle}>
                    {/* 1. Base Gradient: Lighter Top -> Deep Dark Bottom */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: isBrand
                            ? brandRainbowSplotches
                            : `linear-gradient(to bottom, rgba(${colorRgb}, 0.6) 0%, rgba(${colorRgb}, 0.3) 40%, rgba(0,0,0,0.8) 100%)`,
                        backgroundColor: '#000',
                        zIndex: 1
                    }} />

                    {/* 2. Surface Water Glow */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '30%',
                        background: `linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, transparent 100%)`,
                        filter: 'blur(10px)',
                        zIndex: 2,
                        mixBlendMode: 'screen'
                    }} />

                    {/* 3. Caustic Light Pattern */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        opacity: 0.15,
                        backgroundImage: `
                        radial-gradient(circle at 50% 50%, white 0%, transparent 10%),
                        radial-gradient(circle at 20% 40%, white 0%, transparent 10%),
                        radial-gradient(circle at 80% 60%, white 0%, transparent 10%),
                        radial-gradient(circle at 40% 10%, white 0%, transparent 15%),
                        radial-gradient(circle at 70% 80%, white 0%, transparent 12%)
                    `,
                        backgroundSize: '120px 120px',
                        backgroundRepeat: 'repeat',
                        mixBlendMode: 'overlay',
                        filter: 'blur(5px)',
                        zIndex: 2
                    }} />

                    {/* 4. Deep Depth Vignette */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'radial-gradient(circle at 50% 0%, transparent 40%, #000 120%)',
                        zIndex: 3,
                        opacity: 0.7
                    }} />

                    {/* 5. Subtle Wavy Distortion */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        opacity: 0.05,
                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, #fff 10px, #fff 20px)`,
                        filter: 'blur(20px)',
                        mixBlendMode: 'overlay',
                        zIndex: 2
                    }} />

                    {/* 6. Soft Light Rays (Diagonal, top-left to center) */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: isBrand
                            ? `linear-gradient(110deg, transparent 20%, rgba(127, 255, 212, 0.05) 30%, rgba(255, 92, 138, 0.05) 40%, rgba(90, 63, 255, 0.05) 50%, rgba(27, 130, 255, 0.05) 60%, transparent 80%)`
                            : `linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%),
                           linear-gradient(100deg, transparent 20%, rgba(255,255,255,0.03) 30%, transparent 40%)`,
                        mixBlendMode: 'screen',
                        zIndex: 3
                    }} />

                </div>
            );
        }



        if (mode === 'simple_gradient') {
            const isBrand = color === 'brand';
            const brandRainbow = 'linear-gradient(to right, #FF914D, #FF5C8A, #FFB7D5, #5A3FFF, #1B82FF, #7FDBFF, #7FFFD4)';

            return (
                <div style={{
                    ...overlayStyle,
                    background: isBrand
                        ? `linear-gradient(to bottom, #000000 0%, #111111 40%, transparent 100%), ${brandRainbow}`
                        : `linear-gradient(to bottom, #000000 0%, #111111 40%, ${activeColor} 100%)`
                }} />
            )
        }

        if (mode === 'nebula') {
            return <NebulaBanner />;
        }

        // 4. ORBITAL - Signature PanoSpace Cosmic Aesthetic
        if (mode === 'orbital') {
            const spaceColors = {
                deepVoid: '#050B14', // Darker than dark nebula
                nebulaDark: '#0A1A3A',
                ionBlue: '#1B82FF',
                auroraMint: '#8CFFE9',
                starlight: '#F2F7FA'
            };

            return (
                <div style={overlayStyle}>
                    {/* 1. Deep Space Void Background */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: `linear-gradient(to bottom, ${spaceColors.nebulaDark} 0%, ${spaceColors.deepVoid} 100%)`,
                        zIndex: 0
                    }} />

                    {/* 2. The Planetary Horizon (Massive Atmospheric Glow) */}
                    {/* This curves upward from the bottom, framing the content area */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-150%', left: '-20%', right: '-20%', height: '200%',
                        background: `radial-gradient(ellipse at 50% 0%, ${spaceColors.auroraMint} 0%, ${spaceColors.ionBlue} 20%, transparent 60%)`,
                        opacity: 0.6,
                        filter: 'blur(60px)',
                        zIndex: 1,
                        mixBlendMode: 'screen'
                    }} />

                    {/* 3. Orbital Ring Segment (Geometric Arc) */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-80%', left: '-10%', right: '-10%', height: '100%',
                        borderRadius: '50%',
                        borderTop: `1px solid ${spaceColors.starlight}`,
                        boxShadow: `0 -2px 20px ${spaceColors.ionBlue}`,
                        opacity: 0.4,
                        transform: 'scaleY(0.4)', // Flatten to look like a ring
                        zIndex: 2
                    }} />

                    {/* 4. Secondary Ring (Fainter, Mint) */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-78%', left: '-5%', right: '-5%', height: '100%',
                        borderRadius: '50%',
                        borderTop: `1px solid ${spaceColors.auroraMint}`,
                        opacity: 0.2,
                        transform: 'scaleY(0.4)',
                        zIndex: 2
                    }} />

                    {/* 5. Cosmic Dust / Noise Texture */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        opacity: 0.15,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
                        mixBlendMode: 'overlay',
                        zIndex: 3
                    }} />

                    {/* 6. Distant Star/Lens Flare Highlights */}
                    <div style={{
                        position: 'absolute', top: '20%', right: '15%',
                        width: '2px', height: '2px',
                        background: 'white',
                        boxShadow: `0 0 10px 2px white, 0 0 20px 10px ${spaceColors.ionBlue}`,
                        borderRadius: '50%',
                        zIndex: 2,
                        opacity: 0.8
                    }} />
                    <div style={{
                        position: 'absolute', top: '40%', left: '10%',
                        width: '1px', height: '1px',
                        background: 'white',
                        boxShadow: `0 0 8px 1px ${spaceColors.auroraMint}`,
                        borderRadius: '50%',
                        zIndex: 2,
                        opacity: 0.6
                    }} />

                </div>
            );
        }



        // 4. PANO OCEAN - Signature Deep Sea Palette
        if (mode === 'ocean_depths') {
            const panospaceColors = {
                iceWhite: '#F2F7FA',
                auroraBlue: '#7FDBFF',
                classicMint: '#7FFFD4',
                auroraMint: '#8CFFE9',
                ionBlue: '#1B82FF',
                darkNebula: '#0A1A3A',
                black: '#000000'
            };

            return (
                <div style={overlayStyle}>
                    {/* 1. Base Gradient: Aggressively Top-Heavy for Text Readability */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        // Ellipse flattens the light so it doesn't reach down to the username
                        background: `radial-gradient(ellipse at 50% 0%, 
                        ${panospaceColors.iceWhite} 0%, 
                        ${panospaceColors.auroraBlue} 5%, 
                        ${panospaceColors.classicMint} 15%, 
                        ${panospaceColors.ionBlue} 25%, 
                        ${panospaceColors.darkNebula} 50%, 
                        ${panospaceColors.black} 100%)`,
                        zIndex: 1
                    }} />

                    {/* 2. Turbulent Water Texture (Restricted to Top Only) */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        opacity: 0.3,
                        mixBlendMode: 'overlay',
                        backgroundImage: `
                        radial-gradient(circle at 20% 10%, ${panospaceColors.classicMint} 0%, transparent 30%),
                        radial-gradient(circle at 80% 15%, ${panospaceColors.auroraBlue} 0%, transparent 25%),
                        radial-gradient(circle at 50% 5%, ${panospaceColors.iceWhite} 0%, transparent 20%)
                    `,
                        filter: 'blur(30px)',
                        zIndex: 2,
                        transform: 'scaleY(0.8)'
                    }} />



                    {/* 4. Deep Depth Vignette (Dark Nebular + Black) */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: `radial-gradient(circle at 50% 0%, transparent 40%, ${panospaceColors.black} 120%)`,
                        zIndex: 3,
                        opacity: 0.8
                    }} />

                    {/* 5. Subtle Wavy Distortion (Mint tinted) */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        opacity: 0.1,
                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${panospaceColors.auroraMint} 10px, ${panospaceColors.auroraMint} 20px)`,
                        filter: 'blur(20px)',
                        mixBlendMode: 'overlay',
                        zIndex: 2
                    }} />

                    {/* 6. Realistic Scattered Light Beams (Green Mint Only, Thin, Spread) */}
                    <div style={{
                        position: 'absolute', inset: '-50%', // Oversize to allow rotation without edges
                        background: `repeating-conic-gradient(
                        from 0deg at 50% -20%, 
                        transparent 0deg, 
                        transparent 10deg, 
                        ${panospaceColors.auroraMint} 15deg, 
                        transparent 20deg
                    )`,
                        opacity: 0.15, // Dim beams
                        filter: 'blur(8px)', // Soften edges
                        mixBlendMode: 'overlay', // Realistic blending
                        zIndex: 3,
                        transform: 'rotate(-10deg) scale(1.5)' // Angle and spread
                    }} />

                    {/* 7. Secondary Faint Rays for texture */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: `repeating-linear-gradient(
                        100deg, 
                        transparent, 
                        transparent 40px, 
                        ${panospaceColors.auroraMint} 42px, 
                        transparent 45px
                    )`,
                        opacity: 0.05,
                        filter: 'blur(2px)',
                        mixBlendMode: 'overlay',
                        zIndex: 2
                    }} />

                </div>
            );
        }




        if (mode === 'custom_snapshot') {
            return (
                <div style={overlayStyle}>
                    <React.Suspense fallback={<div style={{ width: '100%', height: '100%', background: '#000' }} />}>
                        <DeepSpaceSnapshotBanner
                            seed={seed}
                            color={activeColor}
                            animationsEnabled={animationsEnabled}
                        />
                    </React.Suspense>
                    <BannerOverlayRenderer overlays={overlays} />
                </div>
            );
        }

        // 11. 2000 - PS2 Procedural System Environment (Code-First / Ambient / State-Based)
        if (mode === 'ps2_2000') {
            const ps2Theme = {
                void: '#000000',
                abyss: '#010307',
                deepIndigo: '#081021',
                mutedCyan: '#0D2129',
                ghostWhite: 'rgba(230, 233, 255, 0.03)'
            };

            return (
                <div style={{
                    ...overlayStyle,
                    backgroundColor: ps2Theme.void,
                    overflow: 'hidden',
                    perspective: '1500px'
                }}>
                    {/* 1. Hardware Artifact Composite (Scanlines, Noise, Interlacing) */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        zIndex: 10,
                        pointerEvents: 'none',
                        background: `
                        linear-gradient(rgba(18, 16, 16, 0.1) 50%, rgba(0, 0, 0, 0.25) 50%),
                        url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")
                    `,
                        backgroundSize: '100% 3px, auto',
                        mixBlendMode: 'screen',
                        animation: 'ps2HardwareFlicker 8s infinite alternate'
                    }} />

                    {/* 2. Deep Volumetric Wash - The 'Spirit' of the system */}
                    <div style={{
                        position: 'absolute', inset: -50,
                        background: `radial-gradient(circle at 70% 30%, ${ps2Theme.deepIndigo} 0%, ${ps2Theme.void} 70%)`,
                        zIndex: 1,
                        animation: 'ps2SystemBreath 45s ease-in-out infinite alternate',
                        opacity: 0.6
                    }} />

                    {/* 3. Procedural Ghost Geometry (Vertical Indices & Light Fields) */}
                    <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
                        {React.useMemo(() => {
                            const count = 15;
                            const elements = [];

                            for (let i = 0; i < count; i++) {
                                const isColumn = i % 3 !== 0; // Mix of light columns and ghost indices
                                const width = isColumn ? (40 + Math.random() * 120) : 1;
                                const xPos = Math.random() * 110 - 5;
                                const speed = 50 + Math.random() * 40;
                                const delay = -(Math.random() * 80);
                                const depth = -200 + (Math.random() * -600);
                                const blur = Math.max(0, (depth / -20)); // Distant elements are blurrier

                                elements.push(
                                    <div
                                        key={i}
                                        style={{
                                            position: 'absolute',
                                            left: `${xPos}%`,
                                            top: '-20%',
                                            bottom: '-20%',
                                            width: `${width}px`,
                                            background: isColumn ? `linear-gradient(to right, transparent, ${ps2Theme.mutedCyan}dd, transparent)` : ps2Theme.ghostWhite,
                                            borderLeft: !isColumn ? `1px solid ${ps2Theme.ghostWhite}` : 'none',
                                            transformStyle: 'preserve-3d',
                                            transform: `translate3d(0, 0, ${depth}px)`,
                                            filter: `blur(${blur}px)`,
                                            opacity: isColumn ? 0.07 : 0.03,
                                            animation: `ps2SystemDrift ${speed}s linear infinite`,
                                            animationDelay: `${delay}s`,
                                            mixBlendMode: 'screen'
                                        }}
                                    />
                                );
                            }
                            return elements;
                        }, [])}
                    </div>

                    {/* 4. Atmosphere Layer - Global Fog and Banding */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(ellipse at 50% 50%, transparent 20%, ${ps2Theme.void} 95%)`,
                        zIndex: 5,
                        pointerEvents: 'none',
                        opacity: 0.8
                    }} />

                    <style>{`
                    @keyframes ps2SystemBreath {
                        0% { transform: translate(-2%, -2%) scale(1); }
                        100% { transform: translate(2%, 2%) scale(1.1); }
                    }
                    @keyframes ps2SystemDrift {
                        0% { transform: translate3d(-30px, 0, var(--depth, 0)) translateX(0); }
                        100% { transform: translate3d(30px, 0, var(--depth, 0)) translateX(100px); }
                    }
                    @keyframes ps2HardwareFlicker {
                        0%, 100% { opacity: 0.12; }
                        50% { opacity: 0.16; }
                        98% { opacity: 0.12; }
                        99% { opacity: 0.25; } /* System micro-glitch */
                    }
                `}</style>
                </div>
            );
        }

        // 12. Deep Underwater - Repurposed Volumetric Environment
        if (mode === 'deep_underwater') {
            const oceanTheme = {
                void: '#000000',
                abyss: '#010408',
                core: '#050B16',
                glow: '#0D2B36',
                haze: 'rgba(10, 20, 40, 0.4)'
            };

            return (
                <div style={{
                    ...overlayStyle,
                    backgroundColor: oceanTheme.void,
                    perspective: '1200px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        zIndex: 10,
                        pointerEvents: 'none',
                        background: `
                        repeating-linear-gradient(
                            transparent,
                            transparent 1px,
                            rgba(0, 0, 0, 0.1) 2px,
                            transparent 3px
                        ),
                        url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")
                    `,
                        mixBlendMode: 'overlay'
                    }} />

                    <div style={{ position: 'absolute', inset: 0, background: oceanTheme.abyss, zIndex: 0 }} />

                    <div style={{ position: 'absolute', inset: '-20%', zIndex: 1, transformStyle: 'preserve-3d' }}>
                        {React.useMemo(() => {
                            const layers = [
                                { count: 6, z: -800, blur: 15, opacity: 0.2, speed: 45 },
                                { count: 8, z: -400, blur: 6, opacity: 0.15, speed: 35 },
                                { count: 5, z: 100, blur: 2, opacity: 0.1, speed: 25 }
                            ];

                            return layers.flatMap((layer, lIdx) =>
                                [...Array(layer.count)].map((_, i) => {
                                    const width = 60 + Math.random() * 140;
                                    const xPos = Math.random() * 100;
                                    const delay = -(Math.random() * 40);
                                    const heightScale = 1 + Math.random() * 2;

                                    return (
                                        <div
                                            key={`${lIdx}-${i}`}
                                            style={{
                                                position: 'absolute',
                                                left: `${xPos}%`,
                                                top: '-50%',
                                                bottom: '-50%',
                                                width: `${width}px`,
                                                transformStyle: 'preserve-3d',
                                                transform: `translate3d(0, 0, ${layer.z}px) scaleY(${heightScale})`,
                                                opacity: layer.opacity,
                                                filter: `blur(${layer.blur}px)`,
                                                animation: `ps2SystemIdle ${layer.speed}s ease-in-out infinite alternate`,
                                                animationDelay: `${delay}s`
                                            }}
                                        >
                                            <div style={{
                                                position: 'absolute', inset: 0,
                                                background: `linear-gradient(to bottom, transparent 0%, ${oceanTheme.core} 20%, ${oceanTheme.glow} 50%, ${oceanTheme.core} 80%, transparent 100%)`,
                                                boxShadow: `0 0 40px ${oceanTheme.glow}22`
                                            }} />
                                        </div>
                                    );
                                })
                            );
                        }, [])}
                    </div>

                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(ellipse at 50% 50%, transparent 20%, ${oceanTheme.abyss} 90%)`,
                        zIndex: 5,
                        pointerEvents: 'none',
                        opacity: 0.7
                    }} />

                    <style>{`
                    @keyframes retroSystemIdle {
                        0% { transform: translate3d(-20px, 0%, var(--z, 0)) scaleX(1); opacity: var(--o, 0.1); }
                        50% { transform: translate3d(20px, -5%, var(--z, 0)) scaleX(1.2); opacity: calc(var(--o, 0.1) * 1.5); }
                        100% { transform: translate3d(-10px, 5%, var(--z, 0)) scaleX(0.9); opacity: var(--o, 0.1); }
                    }
                `}</style>
                </div>
            );
        }

        return null;
    };

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
            <React.Suspense fallback={<div style={{ width: '100%', height: '100%', background: '#000' }} />}>
                <BannerOverlayRenderer overlays={overlays} monochromeColor={activeColor}>
                    {renderContent()}
                </BannerOverlayRenderer>
            </React.Suspense>

            {/* Centralized Custom Banner HUD */}
            {isCustom && (
                <>
                    {/* Info Toggle Button - Dropped 40px below banner bottom */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowInfo(!showInfo);
                        }}
                        style={{
                            position: 'absolute',
                            bottom: '-40px',
                            left: '12px',
                            width: '32px',
                            height: '24px',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(127, 255, 212, 0.15)',
                            color: 'rgba(127, 255, 212, 0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 1000,
                            transition: 'all 0.2s ease',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            fontFamily: 'monospace',
                            outline: 'none',
                            WebkitTapHighlightColor: 'transparent'
                        }}
                    >
                        {showInfo ? '✕' : 'INF'}
                    </button>

                    {/* HUD Modal */}
                    {showInfo && (
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                position: 'absolute',
                                bottom: '48px',
                                left: '12px',
                                background: 'rgba(0, 0, 0, 0.85)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(127, 255, 212, 0.3)',
                                borderRadius: '12px',
                                padding: '16px',
                                color: '#fff',
                                fontFamily: 'monospace',
                                fontSize: '0.75rem',
                                zIndex: 1001,
                                animation: 'fadeInUpTheme 0.3s ease',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                                minWidth: '220px',
                                maxWidth: 'calc(100% - 24px)'
                            }}>
                            <div style={{ color: '#7FFFD4', marginBottom: '10px', fontWeight: 'bold', borderBottom: '1px solid rgba(127,255,212,0.2)', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{engineDetails?.name}</span>
                                <span style={{ opacity: 0.5 }}>{engineDetails?.version}</span>
                            </div>

                            <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    <span style={{ color: '#888' }}>SEED:</span> {seed}
                                </div>
                                <button
                                    onClick={handleCopy}
                                    style={{
                                        background: copied ? 'rgba(127, 255, 212, 0.2)' : 'rgba(255,255,255,0.1)',
                                        border: `1px solid ${copied ? '#7FFFD4' : 'rgba(255,255,255,0.2)'}`,
                                        borderRadius: '4px',
                                        color: copied ? '#7FFFD4' : '#fff',
                                        padding: '2px 6px',
                                        fontSize: '9px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        whiteSpace: 'nowrap',
                                        WebkitTapHighlightColor: 'transparent'
                                    }}
                                >
                                    {copied ? 'COPIED!' : 'COPY'}
                                </button>
                            </div>

                            {mode === 'custom_oscillator' ? (
                                <>
                                    <div style={{ marginBottom: '6px' }}><span style={{ color: '#888' }}>MODE:</span> {engineDetails.mode}</div>
                                    <div style={{ marginBottom: '6px' }}><span style={{ color: '#888' }}>COMPLEXITY:</span> {engineDetails.complexity}</div>
                                    <div style={{ marginBottom: '6px' }}><span style={{ color: '#888' }}>SYMMETRY:</span> {engineDetails.symmetry}</div>
                                </>
                            ) : (
                                <>
                                    <div style={{ marginBottom: '6px' }}><span style={{ color: '#888' }}>PALETTE:</span> {engineDetails.palette}</div>
                                    <div style={{ marginBottom: '6px' }}><span style={{ color: '#888' }}>PARTICLES:</span> {engineDetails.particles}</div>
                                    <div style={{ marginBottom: '6px' }}><span style={{ color: '#888' }}>CURVE:</span> {engineDetails.curl}</div>
                                </>
                            )}

                            <div style={{ marginTop: '12px', color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontStyle: 'italic', lineHeight: '1.4' }}>
                                Deterministic generative output derived from cosmic frequencies.
                            </div>
                        </div>
                    )}

                    <style>{`
                        @keyframes fadeInUpTheme {
                            from { opacity: 0; transform: translateY(10px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                </>
            )}
        </div>
    );
};

export default BannerThemeRenderer;
