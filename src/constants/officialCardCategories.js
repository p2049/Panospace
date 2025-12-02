// Official Card Categories and Auto-Rarity Configuration
import { PARKS_DATA } from './parksData';

export const CARD_CATEGORIES = {
    ANIMALS: 'animals',
    TERRAIN: 'terrain',
    NATIONAL_PARKS: 'national_parks',
    STATE_PARKS: 'state_parks',
    BUGS: 'bugs',
    CUSTOM: 'custom'
};

// Animals with auto-rarity (organized by photography commonality)
export const ANIMALS_CONFIG = {
    // 🟩 COMMON (90 animals)
    domestic_cat: { rarity: 'common', label: 'Domestic Cat' },
    domestic_dog: { rarity: 'common', label: 'Domestic Dog' },
    squirrel: { rarity: 'common', label: 'Squirrel' },
    chipmunk: { rarity: 'common', label: 'Chipmunk' },
    rabbit: { rarity: 'common', label: 'Rabbit' },
    hare: { rarity: 'common', label: 'Hare' },
    mouse: { rarity: 'common', label: 'Mouse' },
    rat: { rarity: 'common', label: 'Rat' },
    raccoon: { rarity: 'common', label: 'Raccoon' },
    opossum: { rarity: 'common', label: 'Opossum' },
    skunk: { rarity: 'common', label: 'Skunk' },
    groundhog: { rarity: 'common', label: 'Groundhog' },
    prairie_dog: { rarity: 'common', label: 'Prairie Dog' },
    beaver: { rarity: 'common', label: 'Beaver' },
    otter: { rarity: 'common', label: 'Otter' },
    horse: { rarity: 'common', label: 'Horse' },
    donkey: { rarity: 'common', label: 'Donkey' },
    mule: { rarity: 'common', label: 'Mule' },
    goat: { rarity: 'common', label: 'Goat' },
    sheep: { rarity: 'common', label: 'Sheep' },
    cow: { rarity: 'common', label: 'Cow' },
    pig: { rarity: 'common', label: 'Pig' },
    pigeon: { rarity: 'common', label: 'Pigeon' },
    sparrow: { rarity: 'common', label: 'Sparrow' },
    robin: { rarity: 'common', label: 'Robin' },
    starling: { rarity: 'common', label: 'Starling' },
    blackbird: { rarity: 'common', label: 'Blackbird' },
    finch: { rarity: 'common', label: 'Finch' },
    wren: { rarity: 'common', label: 'Wren' },
    crow: { rarity: 'common', label: 'Crow' },
    raven: { rarity: 'common', label: 'Raven' },
    seagull: { rarity: 'common', label: 'Seagull' },
    cardinal: { rarity: 'common', label: 'Cardinal' },
    blue_jay: { rarity: 'common', label: 'Blue Jay' },
    chicken: { rarity: 'common', label: 'Chicken' },
    rooster: { rarity: 'common', label: 'Rooster' },
    duck: { rarity: 'common', label: 'Duck' },
    goose: { rarity: 'common', label: 'Goose' },
    turkey: { rarity: 'common', label: 'Turkey' },
    magpie: { rarity: 'common', label: 'Magpie' },
    common_frog: { rarity: 'common', label: 'Common Frog' },
    toad: { rarity: 'common', label: 'Toad' },
    gecko: { rarity: 'common', label: 'Gecko' },
    box_turtle: { rarity: 'common', label: 'Box Turtle' },
    garter_snake: { rarity: 'common', label: 'Garter Snake' },
    corn_snake: { rarity: 'common', label: 'Corn Snake' },
    goldfish: { rarity: 'common', label: 'Goldfish' },
    betta: { rarity: 'common', label: 'Betta' },
    guppy: { rarity: 'common', label: 'Guppy' },
    trout: { rarity: 'common', label: 'Trout' },
    bass: { rarity: 'common', label: 'Bass' },
    // Bugs moved to BUGS_CONFIG
    crab: { rarity: 'common', label: 'Crab' },
    hermit_crab: { rarity: 'common', label: 'Hermit Crab' },
    lobster: { rarity: 'common', label: 'Lobster' },
    shrimp: { rarity: 'common', label: 'Shrimp' },
    starfish: { rarity: 'common', label: 'Starfish' },
    jellyfish: { rarity: 'common', label: 'Jellyfish' },
    sea_anemone: { rarity: 'common', label: 'Sea Anemone' },
    coral: { rarity: 'common', label: 'Coral' },
    barnacle: { rarity: 'common', label: 'Barnacle' },
    guinea_pig: { rarity: 'common', label: 'Guinea Pig' },
    ferret: { rarity: 'common', label: 'Ferret' },
    hamster: { rarity: 'common', label: 'Hamster' },
    alpaca: { rarity: 'common', label: 'Alpaca' },
    llama: { rarity: 'common', label: 'Llama' },
    domestic_goose: { rarity: 'common', label: 'Domestic Goose' },
    domestic_duck: { rarity: 'common', label: 'Domestic Duck' },
    budgie: { rarity: 'common', label: 'Budgie / Small Parrot' },
    pug: { rarity: 'common', label: 'Pug' },
    golden_retriever: { rarity: 'common', label: 'Golden Retriever' },

    highland_cow: { rarity: 'common', label: 'Highland Cow' },
    dove: { rarity: 'common', label: 'Dove' },
    canary: { rarity: 'common', label: 'Canary' },
    thrush: { rarity: 'common', label: 'Thrush' },
    salmon: { rarity: 'common', label: 'Salmon' },
    grouper: { rarity: 'common', label: 'Grouper' },
    tilapia: { rarity: 'common', label: 'Tilapia' },
    bluegill: { rarity: 'common', label: 'Bluegill' },
    carp: { rarity: 'common', label: 'Carp' },
    parrotfish: { rarity: 'common', label: 'Parrotfish' },
    sea_bass: { rarity: 'common', label: 'Sea Bass' },
    shark: { rarity: 'common', label: 'Shark' },
    mackerel: { rarity: 'common', label: 'Mackerel' },
    herring: { rarity: 'common', label: 'Herring' },
    sardine: { rarity: 'common', label: 'Sardine' },
    newt: { rarity: 'common', label: 'Newt' },
    barn_cat: { rarity: 'common', label: 'Barn Cat' },
    shepherd_dog: { rarity: 'common', label: 'Shepherd Dog' },
    calf: { rarity: 'common', label: 'Calf' },
    foal: { rarity: 'common', label: 'Foal' },
    duckling: { rarity: 'common', label: 'Duckling' },
    chick: { rarity: 'common', label: 'Chick' },

    // 🟦 UNCOMMON (80 animals)
    deer: { rarity: 'uncommon', label: 'Deer' },
    elk: { rarity: 'uncommon', label: 'Elk' },
    moose: { rarity: 'uncommon', label: 'Moose' },
    red_fox: { rarity: 'uncommon', label: 'Red Fox' },
    coyote: { rarity: 'uncommon', label: 'Coyote' },
    bobcat: { rarity: 'uncommon', label: 'Bobcat' },
    lynx: { rarity: 'uncommon', label: 'Lynx' },
    ocelot: { rarity: 'uncommon', label: 'Ocelot' },
    badger: { rarity: 'uncommon', label: 'Badger' },
    porcupine: { rarity: 'uncommon', label: 'Porcupine' },
    armadillo: { rarity: 'uncommon', label: 'Armadillo' },
    bat: { rarity: 'uncommon', label: 'Bat' },
    meerkat: { rarity: 'uncommon', label: 'Meerkat' },
    sloth: { rarity: 'uncommon', label: 'Sloth' },
    koala: { rarity: 'uncommon', label: 'Koala' },
    wallaby: { rarity: 'uncommon', label: 'Wallaby' },
    kangaroo: { rarity: 'uncommon', label: 'Kangaroo' },
    owl: { rarity: 'uncommon', label: 'Owl' },
    barn_owl: { rarity: 'uncommon', label: 'Barn Owl' },
    great_horned_owl: { rarity: 'uncommon', label: 'Great Horned Owl' },
    eagle: { rarity: 'uncommon', label: 'Eagle' },
    red_tailed_hawk: { rarity: 'uncommon', label: 'Red-tailed Hawk' },
    falcon: { rarity: 'uncommon', label: 'Falcon' },
    heron: { rarity: 'uncommon', label: 'Heron' },
    egret: { rarity: 'uncommon', label: 'Egret' },
    crane: { rarity: 'uncommon', label: 'Crane' },
    pelican: { rarity: 'uncommon', label: 'Pelican' },
    flamingo: { rarity: 'uncommon', label: 'Flamingo' },
    peacock: { rarity: 'uncommon', label: 'Peacock' },
    parrot: { rarity: 'uncommon', label: 'Parrot' },
    woodpecker: { rarity: 'uncommon', label: 'Woodpecker' },
    hummingbird: { rarity: 'uncommon', label: 'Hummingbird' },
    iguana: { rarity: 'uncommon', label: 'Iguana' },
    bearded_dragon: { rarity: 'uncommon', label: 'Bearded Dragon' },
    chameleon: { rarity: 'uncommon', label: 'Chameleon' },
    tortoise: { rarity: 'uncommon', label: 'Tortoise' },
    tree_frog: { rarity: 'uncommon', label: 'Tree Frog' },
    salamander: { rarity: 'uncommon', label: 'Salamander' },
    axolotl: { rarity: 'uncommon', label: 'Axolotl' },
    koi: { rarity: 'uncommon', label: 'Koi' },
    clownfish: { rarity: 'uncommon', label: 'Clownfish' },
    angelfish: { rarity: 'uncommon', label: 'Angelfish' },
    catfish: { rarity: 'uncommon', label: 'Catfish' },
    sea_lion: { rarity: 'uncommon', label: 'Sea Lion' },
    harbor_seal: { rarity: 'uncommon', label: 'Harbor Seal' },
    stingray: { rarity: 'uncommon', label: 'Stingray' },
    seahorse: { rarity: 'uncommon', label: 'Seahorse' },
    octopus: { rarity: 'uncommon', label: 'Octopus' },
    warthog: { rarity: 'uncommon', label: 'Warthog' },
    mule_deer: { rarity: 'uncommon', label: 'Mule Deer' },
    wild_turkey: { rarity: 'uncommon', label: 'Wild Turkey' },
    ibex: { rarity: 'uncommon', label: 'Ibex' },
    mountain_goat: { rarity: 'uncommon', label: 'Mountain Goat' },
    dik_dik: { rarity: 'uncommon', label: 'Dik-Dik' },
    vulture: { rarity: 'uncommon', label: 'Vulture' },
    puffin: { rarity: 'uncommon', label: 'Puffin' },
    quail: { rarity: 'uncommon', label: 'Quail' },
    pheasant: { rarity: 'uncommon', label: 'Pheasant' },
    grouse: { rarity: 'uncommon', label: 'Grouse' },
    horned_lizard: { rarity: 'uncommon', label: 'Horned Lizard' },

    cockatoo: { rarity: 'uncommon', label: 'Cockatoo' },
    parakeet: { rarity: 'uncommon', label: 'Parakeet' },
    kestrel: { rarity: 'uncommon', label: 'Kestrel' },
    eagle_owl: { rarity: 'uncommon', label: 'Eagle Owl' },
    swan: { rarity: 'uncommon', label: 'Swan' },
    stork: { rarity: 'uncommon', label: 'Stork' },
    ibis: { rarity: 'uncommon', label: 'Ibis' },
    camel: { rarity: 'uncommon', label: 'Camel' },
    dromedary: { rarity: 'uncommon', label: 'Dromedary' },
    wild_boar: { rarity: 'uncommon', label: 'Wild Boar' },
    capybara: { rarity: 'uncommon', label: 'Capybara' },
    marmot: { rarity: 'uncommon', label: 'Marmot' },

    // 🟧 RARE (60 animals)
    giraffe: { rarity: 'rare', label: 'Giraffe' },
    zebra: { rarity: 'rare', label: 'Zebra' },
    wildebeest: { rarity: 'rare', label: 'Wildebeest' },
    african_buffalo: { rarity: 'rare', label: 'African Buffalo' },
    bison: { rarity: 'rare', label: 'Bison' },
    hyena: { rarity: 'rare', label: 'Hyena' },
    antelope: { rarity: 'rare', label: 'Antelope' },
    gazelle: { rarity: 'rare', label: 'Gazelle' },
    okapi: { rarity: 'rare', label: 'Okapi' },
    tapir: { rarity: 'rare', label: 'Tapir' },
    cougar: { rarity: 'rare', label: 'Cougar' },
    snow_leopard_rare: { rarity: 'rare', label: 'Snow Leopard' },
    leopard: { rarity: 'rare', label: 'Leopard' },
    jaguar: { rarity: 'rare', label: 'Jaguar' },
    baboon: { rarity: 'rare', label: 'Baboon' },
    mandrill: { rarity: 'rare', label: 'Mandrill' },
    gibbon: { rarity: 'rare', label: 'Gibbon' },
    lemur: { rarity: 'rare', label: 'Lemur' },
    capuchin_monkey: { rarity: 'rare', label: 'Capuchin Monkey' },
    manatee: { rarity: 'rare', label: 'Manatee' },
    dolphin: { rarity: 'rare', label: 'Dolphin' },
    beluga: { rarity: 'rare', label: 'Beluga' },
    sea_otter: { rarity: 'rare', label: 'Sea Otter' },
    narwhal: { rarity: 'rare', label: 'Narwhal' },
    condor: { rarity: 'rare', label: 'Condor' },
    vulture_rare: { rarity: 'rare', label: 'Vulture' },
    albatross: { rarity: 'rare', label: 'Albatross' },
    secretary_bird: { rarity: 'rare', label: 'Secretary Bird' },
    emu: { rarity: 'rare', label: 'Emu' },
    ostrich: { rarity: 'rare', label: 'Ostrich' },
    hornbill: { rarity: 'rare', label: 'Hornbill' },
    toucan: { rarity: 'rare', label: 'Toucan' },
    kookaburra: { rarity: 'rare', label: 'Kookaburra' },
    alligator: { rarity: 'rare', label: 'Alligator' },
    monitor_lizard: { rarity: 'rare', label: 'Monitor Lizard' },
    boa: { rarity: 'rare', label: 'Boa' },
    python: { rarity: 'rare', label: 'Python' },
    rattlesnake: { rarity: 'rare', label: 'Rattlesnake' },
    poison_dart_frog: { rarity: 'rare', label: 'Poison Dart Frog' },
    glass_frog: { rarity: 'rare', label: 'Glass Frog' },
    manta_ray: { rarity: 'rare', label: 'Manta Ray' },
    lionfish: { rarity: 'rare', label: 'Lionfish' },
    nudibranch: { rarity: 'rare', label: 'Nudibranch' },
    whale_shark: { rarity: 'rare', label: 'Whale Shark' },

    walrus: { rarity: 'rare', label: 'Walrus' },
    marlin: { rarity: 'rare', label: 'Marlin' },
    swordfish: { rarity: 'rare', label: 'Swordfish' },
    barracuda: { rarity: 'rare', label: 'Barracuda' },
    giant_tortoise: { rarity: 'rare', label: 'Giant Tortoise' },

    // 🟪 EPIC (40 animals)
    tiger: { rarity: 'epic', label: 'Tiger' },
    cheetah: { rarity: 'epic', label: 'Cheetah' },
    black_panther: { rarity: 'epic', label: 'Black Panther Variant' },
    white_tiger: { rarity: 'epic', label: 'White Tiger' },
    grizzly_bear: { rarity: 'epic', label: 'Grizzly Bear' },
    black_bear: { rarity: 'epic', label: 'Black Bear' },
    polar_bear: { rarity: 'epic', label: 'Polar Bear' },
    wolf: { rarity: 'epic', label: 'Wolf' },
    african_wild_dog: { rarity: 'epic', label: 'African Wild Dog' },
    red_panda: { rarity: 'epic', label: 'Red Panda' },
    aardvark: { rarity: 'epic', label: 'Aardvark' },
    platypus: { rarity: 'epic', label: 'Platypus' },
    echidna: { rarity: 'epic', label: 'Echidna' },
    tamarin: { rarity: 'epic', label: 'Tamarin' },
    slender_loris: { rarity: 'epic', label: 'Slender Loris' },
    bald_eagle: { rarity: 'epic', label: 'Bald Eagle' },
    golden_eagle: { rarity: 'epic', label: 'Golden Eagle' },
    snowy_owl: { rarity: 'epic', label: 'Snowy Owl' },
    kingfisher: { rarity: 'epic', label: 'Kingfisher' },
    scarlet_macaw: { rarity: 'epic', label: 'Scarlet Macaw' },
    resplendent_quetzal: { rarity: 'epic', label: 'Resplendent Quetzal' },
    orca: { rarity: 'epic', label: 'Orca' },
    humpback_whale: { rarity: 'epic', label: 'Humpback Whale' },
    blue_whale: { rarity: 'epic', label: 'Blue Whale' },
    komodo_dragon: { rarity: 'epic', label: 'Komodo Dragon' },
    king_cobra: { rarity: 'epic', label: 'King Cobra' },
    hellbender: { rarity: 'epic', label: 'Hellbender' },
    giant_salamander: { rarity: 'epic', label: 'Giant Salamander' },
    caracal: { rarity: 'epic', label: 'Caracal' },
    serval: { rarity: 'epic', label: 'Serval' },
    saiga_antelope: { rarity: 'epic', label: 'Saiga Antelope' },
    musk_ox: { rarity: 'epic', label: 'Musk Ox' },
    vicuna: { rarity: 'epic', label: 'Vicuna' },
    pangolin: { rarity: 'epic', label: 'Pangolin' },

    arctic_fox: { rarity: 'epic', label: 'Arctic Fox' },
    fennec_fox: { rarity: 'epic', label: 'Fennec Fox' },
    reindeer: { rarity: 'epic', label: 'Reindeer' },
    yak: { rarity: 'epic', label: 'Yak' },
    hippo: { rarity: 'epic', label: 'Hippo' },
    chimpanzee: { rarity: 'epic', label: 'Chimpanzee' },
    bonobo: { rarity: 'epic', label: 'Bonobo' },
    proboscis_monkey: { rarity: 'epic', label: 'Proboscis Monkey' },

    // 🟫 LEGENDARY (20 animals)
    snow_leopard_legendary: { rarity: 'legendary', label: 'Snow Leopard' },
    amur_leopard: { rarity: 'legendary', label: 'Amur Leopard' },
    sumatran_tiger: { rarity: 'legendary', label: 'Sumatran Tiger' },
    javan_rhino: { rarity: 'legendary', label: 'Javan Rhino' },
    black_rhino: { rarity: 'legendary', label: 'Black Rhino' },
    mountain_gorilla: { rarity: 'legendary', label: 'Mountain Gorilla' },
    cross_river_gorilla: { rarity: 'legendary', label: 'Cross River Gorilla' },
    wild_orangutan: { rarity: 'legendary', label: 'Wild Orangutan' },
    saola: { rarity: 'legendary', label: 'Saola' },
    markhor: { rarity: 'legendary', label: 'Markhor' },
    harpy_eagle: { rarity: 'legendary', label: 'Harpy Eagle' },
    philippine_eagle: { rarity: 'legendary', label: 'Philippine Eagle' },
    shoebill_stork: { rarity: 'legendary', label: 'Shoebill Stork' },
    kakapo: { rarity: 'legendary', label: 'Kakapo' },
    whale_shark_legendary: { rarity: 'legendary', label: 'Whale Shark' },
    giant_squid: { rarity: 'legendary', label: 'Giant Squid' },
    dugong: { rarity: 'legendary', label: 'Dugong' },
    irrawaddy_dolphin: { rarity: 'legendary', label: 'Irrawaddy Dolphin' },
    arctic_wolf: { rarity: 'legendary', label: 'Arctic Wolf' },
    ethiopian_wolf: { rarity: 'legendary', label: 'Ethiopian Wolf' },

    gila_monster: { rarity: 'legendary', label: 'Gila Monster' },
    anaconda: { rarity: 'legendary', label: 'Anaconda' },
    basilisk_lizard: { rarity: 'legendary', label: 'Basilisk Lizard' },
    frilled_lizard: { rarity: 'legendary', label: 'Frilled Lizard' },
    hammerhead_shark: { rarity: 'legendary', label: 'Hammerhead Shark' },
    great_white_shark: { rarity: 'legendary', label: 'Great White Shark' },
    kiwi: { rarity: 'legendary', label: 'Kiwi' },
    california_condor: { rarity: 'legendary', label: 'California Condor' },
    tarsier: { rarity: 'legendary', label: 'Tarsier' },

    // 🟧 MYTHIC (10 animals)
    ivory_billed_woodpecker: { rarity: 'mythic', label: 'Ivory-Billed Woodpecker' },
    amur_tiger_wild: { rarity: 'mythic', label: 'Amur Tiger' },
    black_footed_ferret: { rarity: 'mythic', label: 'Black-Footed Ferret' },
    pink_amazon_dolphin: { rarity: 'mythic', label: 'Pink Amazon Dolphin' },
    spirit_bear: { rarity: 'mythic', label: 'Spirit Bear' },
    giant_river_otter: { rarity: 'mythic', label: 'Giant River Otter' },
    snowy_mountain_lynx: { rarity: 'mythic', label: 'Snowy Mountain Lynx Variant' },
    white_orca: { rarity: 'mythic', label: 'White Orca' },
    albino_alligator: { rarity: 'mythic', label: 'Albino Alligator' },
    albino_moose: { rarity: 'mythic', label: 'Albino Moose' },
    mystery_slot_1: { rarity: 'mythic', label: 'Mystery Creature 1' },
    mystery_slot_2: { rarity: 'mythic', label: 'Mystery Creature 2' }
};

// Bugs Configuration
export const BUGS_CONFIG = {
    // 🟫 LEGENDARY (S-Tier: Extremely Rare)
    lord_howe_island_stick_insect: { rarity: 'legendary', label: 'Lord Howe Island Stick Insect' },
    giant_fijian_longhorn_beetle: { rarity: 'legendary', label: 'Giant Fijian Longhorn Beetle' },
    polynesian_tree_snail: { rarity: 'legendary', label: 'Polynesian Tree Snail' },
    seychelles_golden_beetle: { rarity: 'legendary', label: 'Seychelles Golden Beetle' },
    american_burying_beetle: { rarity: 'legendary', label: 'American Burying Beetle' },
    dinacoma_beetle: { rarity: 'legendary', label: 'Dinacoma Beetle' },
    california_beetle: { rarity: 'legendary', label: 'California Beetle' },
    franklins_bumblebee: { rarity: 'legendary', label: 'Franklin\'s Bumblebee' },
    rusty_patched_bumblebee: { rarity: 'legendary', label: 'Rusty Patched Bumblebee' },
    socotra_island_giant_centipede: { rarity: 'legendary', label: 'Socotra Island Giant Centipede' },
    dracula_ant: { rarity: 'legendary', label: 'Dracula Ant' },
    giant_weta: { rarity: 'legendary', label: 'Giant Weta' },
    kauai_cave_wolf_spider: { rarity: 'legendary', label: 'Kauai Cave Wolf Spider' },
    kauai_cave_amphipod: { rarity: 'legendary', label: 'Kauai Cave Amphipod' },
    hines_emerald_dragonfly: { rarity: 'legendary', label: 'Hine\'s Emerald Dragonfly' },
    wallaces_giant_bee: { rarity: 'legendary', label: 'Wallace\'s Giant Bee' },
    blue_calamintha_bee: { rarity: 'legendary', label: 'Blue Calamintha Bee' },
    malaysian_ghost_mantis: { rarity: 'legendary', label: 'Malaysian Ghost Mantis' },
    devils_flower_mantis: { rarity: 'legendary', label: 'Devil\'s Flower Mantis' },
    orchid_mantis: { rarity: 'legendary', label: 'Orchid Mantis' },
    titan_beetle: { rarity: 'legendary', label: 'Titan Beetle' },
    goliath_beetle: { rarity: 'legendary', label: 'Goliath Beetle' },
    hercules_beetle: { rarity: 'legendary', label: 'Hercules Beetle' },
    golden_stag_beetle: { rarity: 'legendary', label: 'Golden Stag Beetle' },
    sabertooth_longhorn_beetle: { rarity: 'legendary', label: 'Sabertooth Longhorn Beetle' },

    // 🟪 EPIC (A-Tier: Very Rare)
    new_zealand_giant_dragonfly: { rarity: 'epic', label: 'New Zealand Giant Dragonfly' },
    queen_alexandras_birdwing_butterfly: { rarity: 'epic', label: 'Queen Alexandra\'s Birdwing Butterfly' },
    attenboroughs_pitcher_plant_midge: { rarity: 'epic', label: 'Attenborough\'s Pitcher Plant Midge' },
    madagascan_sunset_moth: { rarity: 'epic', label: 'Madagascan Sunset Moth' },
    red_slender_loris_tick_mite: { rarity: 'epic', label: 'Red Slender Loris Tick Mite' },
    romanian_cave_leech: { rarity: 'epic', label: 'Romanian Cave Leech' },
    giant_burrowing_cockroach: { rarity: 'epic', label: 'Giant Burrowing Cockroach' },
    white_spotted_walking_stick: { rarity: 'epic', label: 'White-Spotted Walking Stick' },
    leaf_insect_rare: { rarity: 'epic', label: 'Leaf Insect' },
    stick_insect_rare: { rarity: 'epic', label: 'Stick Insect' },
    pink_dragon_millipede: { rarity: 'epic', label: 'Pink Dragon Millipede' },
    florida_leafwing_butterfly: { rarity: 'epic', label: 'Florida Leafwing Butterfly' },
    miami_blue_butterfly: { rarity: 'epic', label: 'Miami Blue Butterfly' },
    xerces_blue: { rarity: 'epic', label: 'Xerces Blue' },
    australian_peacock_spider: { rarity: 'epic', label: 'Australian Peacock Spider' },
    seychelles_mangrove_crab: { rarity: 'epic', label: 'Seychelles Mangrove Crab' },
    ant_mimicking_jumping_spider: { rarity: 'epic', label: 'Ant-Mimicking Jumping Spider' },
    ant_mimicking_beetle: { rarity: 'epic', label: 'Ant-Mimicking Beetle' },
    chinese_golden_mantis: { rarity: 'epic', label: 'Chinese Golden Mantis' },
    rare_mantid_ghost_morphs: { rarity: 'epic', label: 'Rare Mantid Ghost Morphs' },
    jewel_beetle_rare: { rarity: 'epic', label: 'Jewel Beetle' },
    pseudoscorpion_cave: { rarity: 'epic', label: 'Cave Pseudoscorpion' },
    hellgrammite_rare: { rarity: 'epic', label: 'Hellgrammite' },
    dobsonfly_rare: { rarity: 'epic', label: 'Dobsonfly' },
    japanese_giant_hornet: { rarity: 'epic', label: 'Japanese Giant Hornet' },
    madagascar_hissing_roach: { rarity: 'epic', label: 'Madagascar Hissing Roach' },
    african_flower_beetle: { rarity: 'epic', label: 'African Flower Beetle' },
    velvet_worm: { rarity: 'epic', label: 'Velvet Worm' },
    tarantula_rare: { rarity: 'epic', label: 'Tarantula' },
    trapdoor_spider_rare: { rarity: 'epic', label: 'Trapdoor Spider' },
    funnel_web_spider_rare: { rarity: 'epic', label: 'Funnel Web Spider' },
    blue_death_feigning_beetle: { rarity: 'epic', label: 'Blue Death Feigning Beetle' },
    darkling_beetle_rare: { rarity: 'epic', label: 'Darkling Beetle' },
    leafcutter_ant_rare: { rarity: 'epic', label: 'Leafcutter Ant' },
    atlas_moth: { rarity: 'epic', label: 'Atlas Moth' },

    // 🟧 RARE (B-Tier: Uncommon/Special)
    emperor_scorpion: { rarity: 'rare', label: 'Emperor Scorpion' },
    vinegaroon: { rarity: 'rare', label: 'Vinegaroon' },
    whip_scorpion: { rarity: 'rare', label: 'Whip Scorpion' },
    jerusalem_cricket: { rarity: 'rare', label: 'Jerusalem Cricket' },
    mole_cricket: { rarity: 'rare', label: 'Mole Cricket' },
    weta_common: { rarity: 'rare', label: 'Weta' },
    stick_insect_common: { rarity: 'rare', label: 'Stick Insect' },
    leaf_insect_common: { rarity: 'rare', label: 'Leaf Insect' },
    orchid_bee: { rarity: 'rare', label: 'Orchid Bee' },
    metallic_sweat_bee: { rarity: 'rare', label: 'Metallic Sweat Bee' },
    carpenter_bee: { rarity: 'rare', label: 'Carpenter Bee' },
    longhorn_beetle: { rarity: 'rare', label: 'Longhorn Beetle' },
    ground_beetle_uncommon: { rarity: 'rare', label: 'Ground Beetle' },
    tiger_beetle_rare: { rarity: 'rare', label: 'Tiger Beetle' },
    scarab_beetle: { rarity: 'rare', label: 'Scarab Beetle' },
    assassin_bug: { rarity: 'rare', label: 'Assassin Bug' },
    wheel_bug: { rarity: 'rare', label: 'Wheel Bug' },
    kissing_bug: { rarity: 'rare', label: 'Kissing Bug' },
    water_scorpion: { rarity: 'rare', label: 'Water Scorpion' },
    giant_water_bug: { rarity: 'rare', label: 'Giant Water Bug' },
    diving_beetle: { rarity: 'rare', label: 'Diving Beetle' },
    whirligig_beetle: { rarity: 'rare', label: 'Whirligig Beetle' },
    emerald_cockroach_wasp: { rarity: 'rare', label: 'Emerald Cockroach Wasp' },
    blue_carpenter_bee: { rarity: 'rare', label: 'Blue Carpenter Bee' },
    paper_wasp_rare: { rarity: 'rare', label: 'Paper Wasp' },
    potter_wasp: { rarity: 'rare', label: 'Potter Wasp' },
    sawfly: { rarity: 'rare', label: 'Sawfly' },
    pine_sawfly: { rarity: 'rare', label: 'Pine Sawfly' },
    stonefly: { rarity: 'rare', label: 'Stonefly' },
    mayfly: { rarity: 'rare', label: 'Mayfly' },
    caddisfly: { rarity: 'rare', label: 'Caddisfly' },
    antlion: { rarity: 'rare', label: 'Antlion' },
    mantisfly: { rarity: 'rare', label: 'Mantisfly' },
    lacewing: { rarity: 'rare', label: 'Lacewing' },
    hoverfly_uncommon: { rarity: 'rare', label: 'Hoverfly' },
    clearwing_moth: { rarity: 'rare', label: 'Clearwing Moth' },
    hawk_moth: { rarity: 'rare', label: 'Hawk Moth' },
    sphinx_moth: { rarity: 'rare', label: 'Sphinx Moth' },
    ghost_moth: { rarity: 'rare', label: 'Ghost Moth' },
    cicada_rare: { rarity: 'rare', label: 'Cicada' },
    termite_rare: { rarity: 'rare', label: 'Termite' },
    velvet_ant: { rarity: 'rare', label: 'Velvet Ant' },
    gall_wasp: { rarity: 'rare', label: 'Gall Wasp' },
    tsetse_fly: { rarity: 'rare', label: 'Tsetse Fly' },
    robber_fly: { rarity: 'rare', label: 'Robber Fly' },
    dragonfly_uncommon: { rarity: 'rare', label: 'Dragonfly' },
    damselfly_uncommon: { rarity: 'rare', label: 'Damselfly' },
    funnel_weaver_spider: { rarity: 'rare', label: 'Funnel Weaver Spider' },
    orb_weaver_rare: { rarity: 'rare', label: 'Orb Weaver' },
    wolf_spider_rare: { rarity: 'rare', label: 'Wolf Spider' },
    camel_spider: { rarity: 'rare', label: 'Camel Spider' },
    desert_centipede: { rarity: 'rare', label: 'Desert Centipede' },
    giant_african_millipede: { rarity: 'rare', label: 'Giant African Millipede' },
    house_centipede_rare: { rarity: 'rare', label: 'House Centipede' },
    leaf_mimic_katydid: { rarity: 'rare', label: 'Leaf-Mimic Katydid' },
    treehopper: { rarity: 'rare', label: 'Treehopper' },
    planthopper: { rarity: 'rare', label: 'Planthopper' },
    leafhopper: { rarity: 'rare', label: 'Leafhopper' },
    bristletail: { rarity: 'rare', label: 'Bristletail' },
    firebrat: { rarity: 'rare', label: 'Firebrat' },

    // 🟦 UNCOMMON (C-Tier: Common-Rare)
    firefly: { rarity: 'uncommon', label: 'Firefly' },
    spittlebug: { rarity: 'uncommon', label: 'Spittlebug' },
    froghopper: { rarity: 'uncommon', label: 'Froghopper' },
    shield_bug: { rarity: 'uncommon', label: 'Shield Bug' },
    boxelder_bug: { rarity: 'uncommon', label: 'Boxelder Bug' },
    aphid_rare: { rarity: 'uncommon', label: 'Aphid' },
    thrip: { rarity: 'uncommon', label: 'Thrip' },
    scale_insect: { rarity: 'uncommon', label: 'Scale Insect' },
    root_maggot: { rarity: 'uncommon', label: 'Root Maggot' },
    leaf_miner: { rarity: 'uncommon', label: 'Leaf Miner' },
    silverfish: { rarity: 'uncommon', label: 'Silverfish' },
    book_louse: { rarity: 'uncommon', label: 'Book Louse' },
    bark_louse: { rarity: 'uncommon', label: 'Bark Louse' },
    springtail: { rarity: 'uncommon', label: 'Springtail' },
    water_strider: { rarity: 'uncommon', label: 'Water Strider' },
    back_swimmer: { rarity: 'uncommon', label: 'Back Swimmer' },
    water_boatman: { rarity: 'uncommon', label: 'Water Boatman' },
    soldier_fly: { rarity: 'uncommon', label: 'Soldier Fly' },
    hoverfly: { rarity: 'uncommon', label: 'Hoverfly' },
    flush_fly: { rarity: 'uncommon', label: 'Flush Fly' },
    horse_fly: { rarity: 'uncommon', label: 'Horse Fly' },
    botfly: { rarity: 'uncommon', label: 'Botfly' },
    gall_midge: { rarity: 'uncommon', label: 'Gall Midge' },
    crane_fly: { rarity: 'uncommon', label: 'Crane Fly' },
    crane_fly_larva: { rarity: 'uncommon', label: 'Crane Fly Larva' },
    ant_queen: { rarity: 'uncommon', label: 'Ant Queen' },
    beetle_larva: { rarity: 'uncommon', label: 'Beetle Larva' },
    caterpillar_common: { rarity: 'uncommon', label: 'Caterpillar' },
    moth_caterpillar: { rarity: 'uncommon', label: 'Moth Caterpillar' },
    earwig: { rarity: 'uncommon', label: 'Earwig' },
    rove_beetle: { rarity: 'uncommon', label: 'Rove Beetle' },
    weevil: { rarity: 'uncommon', label: 'Weevil' },
    bark_beetle: { rarity: 'uncommon', label: 'Bark Beetle' },
    carrion_beetle: { rarity: 'uncommon', label: 'Carrion Beetle' },
    dung_beetle: { rarity: 'uncommon', label: 'Dung Beetle' },
    seed_bug: { rarity: 'uncommon', label: 'Seed Bug' },
    stink_bug: { rarity: 'uncommon', label: 'Stink Bug' },
    water_mite: { rarity: 'uncommon', label: 'Water Mite' },
    spider_mite: { rarity: 'uncommon', label: 'Spider Mite' },
    harvestman: { rarity: 'uncommon', label: 'Harvestman' },

    // 🟩 COMMON (D & E Tier: Very/Ultra Common)
    housefly: { rarity: 'common', label: 'Housefly' },
    fruit_fly: { rarity: 'common', label: 'Fruit Fly' },
    mosquito: { rarity: 'common', label: 'Mosquito' },
    gnat: { rarity: 'common', label: 'Gnat' },
    wasp_common: { rarity: 'common', label: 'Wasp' },
    bee_common: { rarity: 'common', label: 'Bee' },
    cricket: { rarity: 'common', label: 'Cricket' },
    grasshopper: { rarity: 'common', label: 'Grasshopper' },
    katydid: { rarity: 'common', label: 'Katydid' },
    carpenter_ant: { rarity: 'common', label: 'Carpenter Ant' },
    fire_ant: { rarity: 'common', label: 'Fire Ant' },
    black_ant: { rarity: 'common', label: 'Black Ant' },
    weaver_ant: { rarity: 'common', label: 'Weaver Ant' },
    millipede: { rarity: 'common', label: 'Millipede' },
    centipede: { rarity: 'common', label: 'Centipede' },
    daddy_long_legs: { rarity: 'common', label: 'Daddy Long Legs' },
    jumping_spider: { rarity: 'common', label: 'Jumping Spider' },
    orb_weaver: { rarity: 'common', label: 'Orb Weaver' },
    garden_spider: { rarity: 'common', label: 'Garden Spider' },
    funnel_web_spider: { rarity: 'common', label: 'Funnel Web Spider' },
    moth_general: { rarity: 'common', label: 'Moth' },
    butterfly_general: { rarity: 'common', label: 'Butterfly' },
    beetle_common: { rarity: 'common', label: 'Beetle' },
    house_centipede: { rarity: 'common', label: 'House Centipede' },
    pill_bug: { rarity: 'common', label: 'Pill Bug / Roly Poly' },
    woodlouse: { rarity: 'common', label: 'Woodlouse' },
    cockroach: { rarity: 'common', label: 'Cockroach' },
    earwig_common: { rarity: 'common', label: 'Earwig' },
    thrip_common: { rarity: 'common', label: 'Thrip' },
    ant_worker: { rarity: 'common', label: 'Ant Worker' },
    house_spider: { rarity: 'common', label: 'House Spider' },
    house_cricket: { rarity: 'common', label: 'House Cricket' },
    house_centipede_common: { rarity: 'common', label: 'House Centipede' },
    sowbug: { rarity: 'common', label: 'Sowbug' },
    ant_general: { rarity: 'common', label: 'Ant' },
    mosquito_ubiquitous: { rarity: 'common', label: 'Mosquito' },
    fly_general: { rarity: 'common', label: 'Fly' },
    fruit_fly_ubiquitous: { rarity: 'common', label: 'Fruit Fly' },
    gnat_ubiquitous: { rarity: 'common', label: 'Gnat' },
    common_moth: { rarity: 'common', label: 'Common Moth' }
};

// Terrain/Landforms with auto-rarity
export const TERRAIN_CONFIG = {
    // Common
    forest: { rarity: 'common', label: 'Forest' },
    meadow: { rarity: 'common', label: 'Meadow' },
    hill: { rarity: 'common', label: 'Hill' },
    stream: { rarity: 'common', label: 'Stream' },

    // Uncommon
    lake: { rarity: 'uncommon', label: 'Lake' },
    river: { rarity: 'uncommon', label: 'River' },
    valley: { rarity: 'uncommon', label: 'Valley' },
    plateau: { rarity: 'uncommon', label: 'Plateau' },

    // Rare
    canyon: { rarity: 'rare', label: 'Canyon' },
    waterfall: { rarity: 'rare', label: 'Waterfall' },
    mountain: { rarity: 'rare', label: 'Mountain' },
    cave: { rarity: 'rare', label: 'Cave' },

    // Epic
    glacier: { rarity: 'epic', label: 'Glacier' },
    geyser: { rarity: 'epic', label: 'Geyser' },
    hot_spring: { rarity: 'epic', label: 'Hot Spring' },
    dunes: { rarity: 'epic', label: 'Sand Dunes' },

    // Legendary
    volcano: { rarity: 'legendary', label: 'Volcano' },
    aurora: { rarity: 'legendary', label: 'Aurora' },
    fjord: { rarity: 'legendary', label: 'Fjord' },
    arch: { rarity: 'legendary', label: 'Natural Arch' }
};

// National Parks with auto-rarity
export const NATIONAL_PARKS_CONFIG = {
    // Common (smaller/less visited parks)
    congaree: { rarity: 'common', label: 'Congaree National Park' },
    dry_tortugas: { rarity: 'common', label: 'Dry Tortugas National Park' },
    isle_royale: { rarity: 'common', label: 'Isle Royale National Park' },

    // Uncommon
    acadia: { rarity: 'uncommon', label: 'Acadia National Park' },
    badlands: { rarity: 'uncommon', label: 'Badlands National Park' },
    shenandoah: { rarity: 'uncommon', label: 'Shenandoah National Park' },

    // Rare
    grand_teton: { rarity: 'rare', label: 'Grand Teton National Park' },
    rocky_mountain: { rarity: 'rare', label: 'Rocky Mountain National Park' },
    sequoia: { rarity: 'rare', label: 'Sequoia National Park' },

    // Epic
    yosemite: { rarity: 'epic', label: 'Yosemite National Park' },
    zion: { rarity: 'epic', label: 'Zion National Park' },
    grand_canyon: { rarity: 'epic', label: 'Grand Canyon National Park' },

    // Legendary
    yellowstone: { rarity: 'legendary', label: 'Yellowstone National Park' },
    glacier: { rarity: 'legendary', label: 'Glacier National Park' },
    denali: { rarity: 'legendary', label: 'Denali National Park' }
};

// State Parks with auto-rarity (sample - can be expanded)
export const STATE_PARKS_CONFIG = {
    // Common (most state parks)
    generic_state_park: { rarity: 'common', label: 'State Park' },

    // Uncommon
    adirondack: { rarity: 'uncommon', label: 'Adirondack Park' },
    custer: { rarity: 'uncommon', label: 'Custer State Park' },

    // Rare
    porcupine_mountains: { rarity: 'rare', label: 'Porcupine Mountains State Park' },
    valley_of_fire: { rarity: 'rare', label: 'Valley of Fire State Park' },

    // Epic
    anza_borrego: { rarity: 'epic', label: 'Anza-Borrego Desert State Park' },
    baxter: { rarity: 'epic', label: 'Baxter State Park' }
};

// Helper function to get all tags for a category
export const getCategoryTags = (category) => {
    switch (category) {
        case CARD_CATEGORIES.ANIMALS:
            return Object.keys(ANIMALS_CONFIG).sort((a, b) =>
                ANIMALS_CONFIG[a].label.localeCompare(ANIMALS_CONFIG[b].label)
            );
        case CARD_CATEGORIES.TERRAIN:
            return Object.keys(TERRAIN_CONFIG).sort((a, b) =>
                TERRAIN_CONFIG[a].label.localeCompare(TERRAIN_CONFIG[b].label)
            );
        case CARD_CATEGORIES.NATIONAL_PARKS:
            return Object.keys(NATIONAL_PARKS_CONFIG).sort((a, b) =>
                NATIONAL_PARKS_CONFIG[a].label.localeCompare(NATIONAL_PARKS_CONFIG[b].label)
            );
        case CARD_CATEGORIES.STATE_PARKS:
            return Object.keys(STATE_PARKS_CONFIG).sort((a, b) =>
                STATE_PARKS_CONFIG[a].label.localeCompare(STATE_PARKS_CONFIG[b].label)
            );
        case CARD_CATEGORIES.BUGS:
            return Object.keys(BUGS_CONFIG).sort((a, b) =>
                BUGS_CONFIG[a].label.localeCompare(BUGS_CONFIG[b].label)
            );
        default:
            return [];
    }
};

// Helper function to get rarity for a tag
export const getAutoRarity = (category, tag) => {
    let config;
    switch (category) {
        case CARD_CATEGORIES.ANIMALS:
            config = ANIMALS_CONFIG;
            break;
        case CARD_CATEGORIES.TERRAIN:
            config = TERRAIN_CONFIG;
            break;
        case CARD_CATEGORIES.NATIONAL_PARKS:
            config = NATIONAL_PARKS_CONFIG;
            break;
        case CARD_CATEGORIES.STATE_PARKS:
            config = STATE_PARKS_CONFIG;
            break;
        case CARD_CATEGORIES.BUGS:
            config = BUGS_CONFIG;
            break;
        default:
            return null;
    }
    return config[tag]?.rarity || null;
};

// Helper function to get label for a tag
export const getTagLabel = (category, tag) => {
    let config;
    switch (category) {
        case CARD_CATEGORIES.ANIMALS:
            config = ANIMALS_CONFIG;
            break;
        case CARD_CATEGORIES.TERRAIN:
            config = TERRAIN_CONFIG;
            break;
        case CARD_CATEGORIES.NATIONAL_PARKS:
            config = NATIONAL_PARKS_CONFIG;
            break;
        case CARD_CATEGORIES.STATE_PARKS:
            config = STATE_PARKS_CONFIG;
            break;
        case CARD_CATEGORIES.BUGS:
            config = BUGS_CONFIG;
            break;
        default:
            return tag;
    }
    return config[tag]?.label || tag;
};

// Get all parks for autocomplete (Merged with PARKS_DATA)
export const getAllParks = () => {
    return PARKS_DATA.map(park => {
        // Determine config based on type
        const config = park.parkType === 'national' ? NATIONAL_PARKS_CONFIG : STATE_PARKS_CONFIG;

        // Check if we have a specific config for this park ID (using the ID as key if it matches, or trying to match by name if needed)
        // The existing config keys (e.g., 'yosemite') might not match PARKS_DATA ids (e.g., 'yosemite-np') exactly in all cases.
        // Let's try to find a match.

        // Strategy: 
        // 1. Try direct key match (unlikely given different naming conventions in some cases)
        // 2. Try to find by label match

        let rarity = park.parkType === 'national' ? 'uncommon' : 'common'; // Defaults
        let label = park.parkName;

        // Append "National Park" or "State Park" if not present for display consistency with old list
        if (park.parkType === 'national' && !label.includes('National Park')) {
            label = `${label} National Park`;
        } else if (park.parkType === 'state' && !label.includes('State Park')) {
            label = `${label} State Park`;
        }

        // Look for overrides in our manual config
        const configEntry = Object.entries(config).find(([key, val]) => {
            // Check if our manual label matches the generated label or the raw park name
            return val.label === label || val.label.includes(park.parkName);
        });

        if (configEntry) {
            rarity = configEntry[1].rarity;
        }

        return {
            key: park.parkId,
            label: label,
            rarity: rarity,
            type: park.parkType
        };
    });
};
