// ─── Weed / Unwanted Plant Information Database ──────────────────────────────
// Covers all 16 CLASS_NAMES detected by the YOLO model.

export type RiskLevel = 'low' | 'medium' | 'high' | 'very_high';

export interface WeedInfo {
  /** Common display name */
  name: string;
  /** Scientific / botanical name */
  scientificName: string;
  /** Risk level for crops */
  riskLevel: RiskLevel;
  /** Short description of the plant */
  description: string;
  /** What makes this weed harmful to crops */
  cropImpact: string;
  /** Typical habitats where it grows */
  habitat: string;
  /** Recommended control/management methods */
  controlMethods: string[];
  /** Distinctive visual characteristics */
  visualTraits: string;
  /** Emoji icon for quick visual reference */
  icon: string;
  image: string; // URL or local path to an image of the weed
}

/** Risk level display helper */
export const RISK_META: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  low:      { label: 'Low Risk',       color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
  medium:   { label: 'Moderate Risk',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  high:     { label: 'High Risk',      color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
  very_high:{ label: 'Critical Risk',  color: '#dc2626', bg: 'rgba(220,38,38,0.15)'  },
};

// Keys match CLASS_NAMES from yoloInference.ts
export const WEED_DATABASE: Record<string, WeedInfo> = {
  'Kena': {
    name: 'Kena',
    scientificName: 'Saccharum spontaneum',
    riskLevel: 'high',
    image: '/assets/weeds/kena.jpg',
    description:
      'Kena is a perennial wild cane found across tropical and subtropical regions of South Asia. It spreads aggressively via both seeds and underground rhizomes, forming dense colonies that are very difficult to eradicate once established.',
    cropImpact:
      'Competes intensely for water, nutrients, and light. Its dense root network can choke out crop root systems and significantly reduce yield in paddy, sugarcane, and vegetable fields.',
    habitat: 'Roadsides, riverbanks, degraded farmland, and marginal areas in humid tropical zones.',
    controlMethods: [
      'Deep tillage repeated across 2–3 seasons to exhaust rhizome reserves',
      'Cover crops (cowpea, sorghum) to shade out growth',
      'Herbicide: Glyphosate (non-selective) on non-cropped areas',
      'Biological control: avoid grazing livestock near crop edges',
    ],
    visualTraits: 'Tall (1–4 m), silvery-white feathery plumes at maturity, narrow serrated leaves with white mid-rib.',
    icon: '🌾',
  },

  'Lavhala': {
    name: 'Lavhala',
    scientificName: 'Digera muricata',
    riskLevel: 'medium',
    image: '/assets/weeds/lavhala.jpg',
    description:
      'Lavhala is a common summer annual weed prevalent in the arid and semi-arid farming regions of India. It thrives in disturbed soils and is tolerant of heat and drought.',
    cropImpact:
      'Competes with kharif crops (groundnut, pearl millet, sorghum) for nutrients and moisture during the critical growth phase. Reduces yield by 20–35% if uncontrolled.',
    habitat: 'Dryland crop fields, wastelands, sandy loam soils across Rajasthan, Gujarat, and Maharashtra.',
    controlMethods: [
      'Hand weeding at 2–3 weeks after crop emergence',
      'Inter-row cultivations in wide-row crops',
      'Herbicide: Pendimethalin as pre-emergence treatment',
      'Crop rotation with winter pulses to break weed cycle',
    ],
    visualTraits: 'Erect herb (20–60 cm), small oval leaves, pinkish-purple small flowers in axillary spikes.',
    icon: '🌿',
  },

  'Lamber Quarter Plant': {
    name: 'Lamb\'s Quarters',
    scientificName: 'Chenopodium album',
    riskLevel: 'medium',
    image: '/assets/weeds/lambs_quarters.jpg',
    description:
      'One of the world\'s most widespread annual weeds, Lamb\'s Quarters is an extremely prolific seed producer capable of generating over 70,000 seeds per plant. It is highly adaptable and thrives in disturbed, nutrient-rich soils.',
    cropImpact:
      'A major pest in maize, soybean, vegetable, and pulse fields. Can reduce corn yields by up to 25% through intense competition for nitrogen and phosphorus.',
    habitat: 'Cultivated fields, gardens, roadsides, compost heaps — nearly any disturbed fertile soil worldwide.',
    controlMethods: [
      'Early mechanical weeding before flowering (prevent seed set)',
      'Mulching to suppress germination',
      'Herbicide: Atrazine (in maize), Metribuzin (in vegetables)',
      'Crop canopy closure via optimum plant spacing',
    ],
    visualTraits: 'Upright plant (0.3–2 m), mealy white coating on young leaves, diamond-shaped toothed leaves, tiny green flowers in dense clusters.',
    icon: '🌱',
  },

  'Little Mallow': {
    name: 'Little Mallow',
    scientificName: 'Malva parviflora',
    riskLevel: 'medium',
    image: '/assets/weeds/little_mallow.jpg',
    description:
      'Little Mallow is a cool-season annual or biennial weed native to the Mediterranean, now naturalised across Asia and Australia. Its taproots penetrate deeply and it can re-grow from root fragments.',
    cropImpact:
      'Competes with winter crops (wheat, chickpea, mustard) for moisture and nutrients. Also acts as a host for several fungal diseases and insect pests.',
    habitat: 'Winter crop fields, orchards, roadsides, and irrigated soils in mild climates.',
    controlMethods: [
      'Hand removal before seed set — remove entire taproot',
      'Herbicide: 2,4-D amine in cereal crops',
      'Crop scouting post-monsoon for early emergence',
      'Summer fallowing to dry out taproot systems',
    ],
    visualTraits: 'Prostrate to erect (20–80 cm), round kidney-shaped lobed leaves, small white-pink 5-petalled flowers, disc-shaped seed pods (cheeses).',
    icon: '🌺',
  },

  'Moti Dudhi': {
    name: 'Moti Dudhi',
    scientificName: 'Euphorbia hirta',
    riskLevel: 'medium',
    image: '/assets/weeds/moti_dudhi.jpg',
    description:
      'Moti Dudhi (Large Spurge) is a prostrate to ascending annual weed with milky latex sap that can cause skin irritation. It is common in tropical and subtropical regions of Asia.',
    cropImpact:
      'Colonises crop row spaces in groundnut, cotton, and vegetable fields. Its mat-forming habit smothers seedlings and competes for moisture. Harbours root-knot nematodes.',
    habitat: 'Cropland, roadsides, waste ground, and sandy soils throughout tropical India and Southeast Asia.',
    controlMethods: [
      'Manual uprooting during early vegetative stage',
      'Herbicide: Onnalin or fluchloralin as pre-emergence',
      'Avoid disturbing soil at crop margins (reduces germination)',
      'Use competitive crop spacing to shade out seedlings',
    ],
    visualTraits: 'Low-growing (10–40 cm), hairy reddish stems, oval leaves with reddish midrib, tiny pinkish-red flowers in dense axillary clusters; oozes white latex when cut.',
    icon: '🍃',
  },

  'Obscure Morning Glory': {
    name: 'Obscure Morning Glory',
    scientificName: 'Ipomoea obscura',
    riskLevel: 'high',
    image: '/assets/weeds/morning_glory.jpg',
    description:
      'A twining, climbing annual vine that wraps around crops, causing physical damage and shading. It is extremely difficult to control once infestation is established due to massive seed production and deep seed dormancy.',
    cropImpact:
      'Twines around crop stems (sorghum, maize, vegetables), causing lodging and physical breakage. Creates a shade canopy reducing photosynthesis in lower crop layers by up to 40%.',
    habitat: 'Kharif crop fields, hedgerows, waste ground, river margins — common across peninsular India.',
    controlMethods: [
      'Hand pulling before climbing stage — crucial before flowering',
      'Herbicide: Pendimethalin pre-emergence, or 2,4-D post-emergence',
      'Summer deep tillage to kill seed bank',
      'Avoid bringing in infested soil or compost',
    ],
    visualTraits: 'Thin, twining vine; heart-shaped leaves (3–8 cm); pale yellow to white funnel-shaped flowers; small round brown seeds.',
    icon: '🌸',
  },

  'Asian Pigeonwings': {
    name: 'Asian Pigeonwings',
    scientificName: 'Clitoria ternatea',
    riskLevel: 'low',
    image: '/assets/weeds/pigeonwings.jpg',
    description:
      'Asian Pigeonwings is usually cultivated as an ornamental or cover crop, but when it escapes cultivation it can become a mild weed in crop margins. It fixes nitrogen and is generally considered beneficial in agroforestry systems.',
    cropImpact:
      'Minimal direct harm; may compete at field edges. Its nitrogen fixation can actually benefit surrounding soil. More a nuisance than a serious pest.',
    habitat: 'Crop margins, fallow land, roadsides, and disturbed forest edges in tropical Asia.',
    controlMethods: [
      'Manual removal from crop rows if density is high',
      'Can be incorporated as green manure — chop and turn before flowering',
      'No herbicide typically required for isolated plants',
    ],
    visualTraits: 'Twining vine with pinnate leaves (5–7 leaflets), distinctive bright blue or white butterfly-shaped flowers, slender seed pods.',
    icon: '💙',
  },

  'Bilayat': {
    name: 'Bilayat / Vilayati Babool',
    scientificName: 'Prosopis juliflora',
    riskLevel: 'very_high',
    image: '/assets/weeds/bilayat.jpg',
    description:
      'Bilayat is one of the most invasive exotic weeds in India, declared a noxious invasive species. Originally introduced for reforestation, it has escaped and now dominates vast areas of agricultural land and pasture.',
    cropImpact:
      'Forms impenetrable thorny thickets, making land completely unusable for farming. Deep tap roots (up to 50m) extract groundwater year-round. Allelopathic compounds in litter inhibit germination of native species and crops.',
    habitat: 'Wastelands, riverbanks, degraded farmland, roadsides — dryland areas of Rajasthan, Gujarat, Andhra Pradesh, Tamil Nadu.',
    controlMethods: [
      'Physical removal: cut at ground level + immediate stump treatment with herbicide',
      'Herbicide: Triclopyr + Picloram applied to cut stump',
      'Biological: Beetles (Neltumius arizonensis) as biocontrol agents being tested',
      'Community-level coordinated control across farm boundaries',
      'Repeated follow-up treatment over 3–5 years required',
    ],
    visualTraits: 'Thorny shrub or small tree (2–12 m); bipinnate leaves; small yellow cylindrical flower spikes; pale yellow long seed pods in clusters.',
    icon: '🌵',
  },

  'Choti Dudhi': {
    name: 'Choti Dudhi',
    scientificName: 'Euphorbia thymifolia',
    riskLevel: 'low',
    image: '/assets/weeds/choti_dudhi.jpg',
    description:
      'Choti Dudhi (Small Spurge) is a tiny prostrate annual weed with minute leaves and a milky latex sap. Less problematic than Moti Dudhi due to its small size, it rarely forms dense enough stands to seriously impact crops.',
    cropImpact:
      'Minor competitor in vegetable gardens and nursery beds. Can harbour aphids and whiteflies that spread to crops.',
    habitat: 'Footpaths, garden beds, nurseries, and disturbed sandy soils in warm tropical areas.',
    controlMethods: [
      'Hand weeding or hoeing during early growth',
      'Mulching in garden beds to prevent germination',
      'No specific herbicide usually needed at low density',
    ],
    visualTraits: 'Prostrate mat-forming herb (5–20 cm), tiny oval leaves (<1 cm), reddish stems, minute pinkish cyathia flowers; oozes white latex when broken.',
    icon: '🌿',
  },

  'Digitaria SP': {
    name: 'Crabgrass / Hairy Fingergrass',
    scientificName: 'Digitaria sanguinalis / D. ciliaris',
    riskLevel: 'high',
    image: '/assets/weeds/crabgrass.jpg',
    description:
      'Digitaria species (crabgrasses) are among the most troublesome summer annual grassy weeds in cultivated fields worldwide. They produce massive quantities of seeds and spread rapidly through rooting at nodes.',
    cropImpact:
      'Severe competitor in kharif crops — maize, sorghum, cotton, and vegetables. Can reduce soybean yield by over 50% in heavy infestations. Hosts fungal diseases like downy mildew.',
    habitat: 'Cultivated fields, lawns, roadsides on fertile, warm, well-drained soils worldwide.',
    controlMethods: [
      'Pre-emergence: Pendimethalin, Alachlor (before crop emergence)',
      'Post-emergence: Quizalofop-p-ethyl in broadleaf crops',
      'Timely mechanical weeding at 2–3 weeks after sowing',
      'Smother crops (mustard, cowpea) to outcompete seedlings',
    ],
    visualTraits: 'Spreading grass with hairy sheaths; leaf blades 5–10 cm, softly hairy; finger-like purplish seed heads with 3–9 racemes radiating from tip.',
    icon: '🌾',
  },

  'Gajar Gavat': {
    name: 'Gajar Gavat / Congress Grass',
    scientificName: 'Parthenium hysterophorus',
    riskLevel: 'very_high',
    image: '/assets/weeds/gajar_gavat.jpg',
    description:
      'Gajar Gavat (Parthenium weed) is one of the most aggressive and harmful invasive weeds in India. Declared a noxious weed, it causes severe health hazards — contact dermatitis, asthma, and hay fever in humans and animals — in addition to massive crop losses.',
    cropImpact:
      'Severely allelopathic — its biochemicals suppress germination and growth of crops (wheat, sorghum, mustard). Can cause 40–90% yield loss. Also poisons grazing livestock.',
    habitat: 'Roadsides, wasteland, disturbed areas, cropland margins — spread aggressively across peninsular India since 1950s.',
    controlMethods: [
      'IMMEDIATE removal before flowering — wear gloves and mask',
      'Biological control: Mexican beetle Zygogramma bicolorata (approved in India)',
      'Smother with dense cover crops (Cassia sericea, sunflower)',
      'Herbicide: Atrazine pre-emergence; 2,4-D or Metribuzin post-emergence',
      'Community-wide clearance campaigns required for effective control',
    ],
    visualTraits: 'Erect herb (0.5–1.5 m); deeply pinnately lobed leaves; tiny white daisy-like flower heads; strong unpleasant herbal smell when crushed.',
    icon: '⚠️',
  },

  'Graceful Sandmart': {
    name: 'Graceful Sandmat',
    scientificName: 'Chamaesyce gracillima',
    riskLevel: 'low',
    image: '/assets/weeds/sandmat.jpg',
    description:
      'Graceful Sandmat is a slender, delicate-looking prostrate annual spurge. It is common in sandy soils and disturbed areas but rarely causes serious crop damage at low densities.',
    cropImpact:
      'Minor competitor in vegetable and pulse crops. Presence indicates sandy, nutrient-poor soil conditions that may need amendment.',
    habitat: 'Sandy soils, margins of cultivated fields, roadsides, and coastal areas in tropical regions.',
    controlMethods: [
      'Hand weeding before seed set',
      'Improving soil organic matter reduces its competitiveness',
      'Mulching in garden beds',
    ],
    visualTraits: 'Prostrate, slender stems (10–30 cm); narrow elliptic leaves in pairs; tiny cyathia flowers; smooth capsule fruits.',
    icon: '🌱',
  },

  'Sicklepod': {
    name: 'Sicklepod',
    scientificName: 'Senna obtusifolia',
    riskLevel: 'high',
    image: '/assets/weeds/sicklepod.jpg',
    description:
      'Sicklepod is a robust tropical annual legume weed that is one of the worst crop weeds worldwide. Despite its leguminous nature, it competes aggressively with crops and its seeds are toxic to livestock.',
    cropImpact:
      'Major pest in soybean, cotton, and peanut fields. Competes for all resources and can reduce soybean yield by up to 80% in severe infestations. Seeds cause digestive disorders in cattle and is regulated in several countries.',
    habitat: 'Crop fields, roadsides, waste ground in warm tropical climates. Common in kharif field margins.',
    controlMethods: [
      'Hand weeding early (before 4 leaves stage in crop)',
      'Herbicide: Imazethapyr in soybean; Acifluorfen in peanut',
      'Avoid soil disturbance that brings seeds to surface',
      'Rotation with competitive winter crops (wheat)',
    ],
    visualTraits: 'Erect annual (0.5–1.5 m); even-pinnate compound leaves (3 pairs of oblong leaflets); yellow 5-petalled flowers; distinctive slender curved (sickle-shaped) seed pods 10–20 cm long.',
    icon: '🌿',
  },

  'Harali': {
    name: 'Harali / Bermuda Grass',
    scientificName: 'Cynodon dactylon',
    riskLevel: 'high',
    image: '/assets/weeds/harali.jpg',
    description:
      'Harali (Bermuda Grass) is one of the most persistent perennial weeds in the world. Its creeping stolons and deep rhizomes make complete eradication extremely difficult. While valued as a lawn and pasture grass, it is a serious pest in crop fields.',
    cropImpact:
      'Pervasive competitor in irrigated crops — cotton, sugarcane, vegetables, orchards. Its rapid stoloniferous spread creates a dense mat. Any piece of stolon left in soil can regenerate into a new plant.',
    habitat: 'Irrigated farmland, orchards, lawns, roadsides — virtually any warm, sunny location globally.',
    controlMethods: [
      'Repeated cultivation to exhaust rhizome reserves (3–4 seasons)',
      'Solarisation: clear plastic mulch in summer for 6–8 weeks',
      'Herbicide: Glyphosate (non-selective on fallow land)', 
      'Quizalofop-p-ethyl or Fluazifop-p-butyl in broadleaf crops',
      'No single season control — multi-year IPM approach required',
    ],
    visualTraits: 'Low-growing creeping grass; flat blue-green leaf blades (2–5 cm), prominent white ligule; 3–7 finger-like spike racemes at stem tip; purplish at times.',
    icon: '🌱',
  },

  'Dwarf Cassia': {
    name: 'Dwarf Cassia',
    scientificName: 'Cassia pumila',
    riskLevel: 'medium',
    image: '/assets/weeds/dwarf_cassia.jpg',
    description:
      'Dwarf Cassia is a small, delicate-looking but persistent annual leguminous weed. It favours sandy and dry soils and is common in dryland kharif crop fields across South Asia.',
    cropImpact:
      'Competes moderately with groundnut, pearl millet, and sesame. Though its nitrogen fixation slightly benefits soil, its competitive draw for water in dry conditions can hurt germination.',
    habitat: 'Sandy dryland fields, roadsides, and grassland areas of peninsular and central India.',
    controlMethods: [
      'Hand weeding at 3 weeks after crop sowing',
      'Pre-emergence herbicide: Fluchloralin or Trifluralin',
      'Can be used as green manure if incorporated before seed set',
    ],
    visualTraits: 'Small erect herb (10–30 cm); sensitive pinnate leaves (many small leaflets); small yellow flowers; slender flat seed pods 2–4 cm long.',
    icon: '🌼',
  },

  'Punarnava': {
    name: 'Punarnava',
    scientificName: 'Boerhavia diffusa',
    riskLevel: 'low',
    image: '/assets/weeds/punarnava.jpg',
    description:
      'Punarnava is a widespread tropical weed with significant medicinal value in Ayurveda. As a weed, it is a prostrate, spreading annual or perennial that colonises disturbed fertile soils. Its medicinal status means it is sometimes deliberately cultivated.',
    cropImpact:
      'Mild competitor in vegetable gardens and kharif pulse fields. Rarely causes serious yield loss but can compete in poorly managed gardens. Its sprawling habit outcompetes small seedlings.',
    habitat: 'Roadsides, gardens, waste ground, and open farmland across tropical India and Asia.',
    controlMethods: [
      'Hand removal during early vegetative stage',
      'Mulching to suppress emergence near crop rows',
      'Consider selective harvesting for medicinal use before seeding',
    ],
    visualTraits: 'Prostrate spreading herb; thick fleshy oval leaves (2–5 cm) with wavy margins; small pink-purple funnel flowers; club-shaped sticky fruits that cling to clothing.',
    icon: '🌸',
  },
};

/** Get weed info with a safe fallback for unknowns */
export function getWeedInfo(label: string): WeedInfo | null {
  return WEED_DATABASE[label] ?? null;
}
