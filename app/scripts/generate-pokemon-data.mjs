// Generates /data/pokemon.json — all 151 Gen 1 Pokemon with tier + evolution data.
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Canonical Gen 1 species data: [id, name, evolvesToId|null, evolveLevel|null]
// For stone/trade evolutions, we assign a level so the kid can still evolve them by leveling.
const SPECIES = [
  [1, "Bulbasaur", 2, 16], [2, "Ivysaur", 3, 32], [3, "Venusaur", null, null],
  [4, "Charmander", 5, 16], [5, "Charmeleon", 6, 36], [6, "Charizard", null, null],
  [7, "Squirtle", 8, 16], [8, "Wartortle", 9, 36], [9, "Blastoise", null, null],
  [10, "Caterpie", 11, 7], [11, "Metapod", 12, 10], [12, "Butterfree", null, null],
  [13, "Weedle", 14, 7], [14, "Kakuna", 15, 10], [15, "Beedrill", null, null],
  [16, "Pidgey", 17, 18], [17, "Pidgeotto", 18, 36], [18, "Pidgeot", null, null],
  [19, "Rattata", 20, 20], [20, "Raticate", null, null],
  [21, "Spearow", 22, 20], [22, "Fearow", null, null],
  [23, "Ekans", 24, 22], [24, "Arbok", null, null],
  [25, "Pikachu", 26, 36], [26, "Raichu", null, null],
  [27, "Sandshrew", 28, 22], [28, "Sandslash", null, null],
  [29, "Nidoran-F", 30, 16], [30, "Nidorina", 31, 36], [31, "Nidoqueen", null, null],
  [32, "Nidoran-M", 33, 16], [33, "Nidorino", 34, 36], [34, "Nidoking", null, null],
  [35, "Clefairy", 36, 36], [36, "Clefable", null, null],
  [37, "Vulpix", 38, 36], [38, "Ninetales", null, null],
  [39, "Jigglypuff", 40, 36], [40, "Wigglytuff", null, null],
  [41, "Zubat", 42, 22], [42, "Golbat", null, null],
  [43, "Oddish", 44, 21], [44, "Gloom", 45, 36], [45, "Vileplume", null, null],
  [46, "Paras", 47, 24], [47, "Parasect", null, null],
  [48, "Venonat", 49, 31], [49, "Venomoth", null, null],
  [50, "Diglett", 51, 26], [51, "Dugtrio", null, null],
  [52, "Meowth", 53, 28], [53, "Persian", null, null],
  [54, "Psyduck", 55, 33], [55, "Golduck", null, null],
  [56, "Mankey", 57, 28], [57, "Primeape", null, null],
  [58, "Growlithe", 59, 36], [59, "Arcanine", null, null],
  [60, "Poliwag", 61, 25], [61, "Poliwhirl", 62, 40], [62, "Poliwrath", null, null],
  [63, "Abra", 64, 16], [64, "Kadabra", 65, 36], [65, "Alakazam", null, null],
  [66, "Machop", 67, 28], [67, "Machoke", 68, 48], [68, "Machamp", null, null],
  [69, "Bellsprout", 70, 21], [70, "Weepinbell", 71, 36], [71, "Victreebel", null, null],
  [72, "Tentacool", 73, 30], [73, "Tentacruel", null, null],
  [74, "Geodude", 75, 25], [75, "Graveler", 76, 48], [76, "Golem", null, null],
  [77, "Ponyta", 78, 40], [78, "Rapidash", null, null],
  [79, "Slowpoke", 80, 37], [80, "Slowbro", null, null],
  [81, "Magnemite", 82, 30], [82, "Magneton", null, null],
  [83, "Farfetch'd", null, null],
  [84, "Doduo", 85, 31], [85, "Dodrio", null, null],
  [86, "Seel", 87, 34], [87, "Dewgong", null, null],
  [88, "Grimer", 89, 38], [89, "Muk", null, null],
  [90, "Shellder", 91, 36], [91, "Cloyster", null, null],
  [92, "Gastly", 93, 25], [93, "Haunter", 94, 48], [94, "Gengar", null, null],
  [95, "Onix", null, null],
  [96, "Drowzee", 97, 26], [97, "Hypno", null, null],
  [98, "Krabby", 99, 28], [99, "Kingler", null, null],
  [100, "Voltorb", 101, 30], [101, "Electrode", null, null],
  [102, "Exeggcute", 103, 36], [103, "Exeggutor", null, null],
  [104, "Cubone", 105, 28], [105, "Marowak", null, null],
  [106, "Hitmonlee", null, null], [107, "Hitmonchan", null, null], [108, "Lickitung", null, null],
  [109, "Koffing", 110, 35], [110, "Weezing", null, null],
  [111, "Rhyhorn", 112, 42], [112, "Rhydon", null, null],
  [113, "Chansey", null, null], [114, "Tangela", null, null], [115, "Kangaskhan", null, null],
  [116, "Horsea", 117, 32], [117, "Seadra", null, null],
  [118, "Goldeen", 119, 33], [119, "Seaking", null, null],
  [120, "Staryu", 121, 36], [121, "Starmie", null, null],
  [122, "Mr. Mime", null, null], [123, "Scyther", null, null], [124, "Jynx", null, null],
  [125, "Electabuzz", null, null], [126, "Magmar", null, null], [127, "Pinsir", null, null], [128, "Tauros", null, null],
  [129, "Magikarp", 130, 20], [130, "Gyarados", null, null],
  [131, "Lapras", null, null], [132, "Ditto", null, null],
  [133, "Eevee", 134, 36], [134, "Vaporeon", null, null], [135, "Jolteon", null, null], [136, "Flareon", null, null],
  [137, "Porygon", null, null],
  [138, "Omanyte", 139, 40], [139, "Omastar", null, null],
  [140, "Kabuto", 141, 40], [141, "Kabutops", null, null],
  [142, "Aerodactyl", null, null], [143, "Snorlax", null, null],
  [144, "Articuno", null, null], [145, "Zapdos", null, null], [146, "Moltres", null, null],
  [147, "Dratini", 148, 30], [148, "Dragonair", 149, 55], [149, "Dragonite", null, null],
  [150, "Mewtwo", null, null], [151, "Mew", null, null],
];

// Tier assignment: Tier 4 = legendaries, Tier 3 = stage-2 final evolutions
// (Pokemon that ARE evolved-into and have nothing further), Tier 1 = unevolved
// basics that DO evolve (incl. starters) + early route, Tier 2 = the rest.
const LEGENDARIES = new Set([144, 145, 146, 150, 151]);
const FINAL_STAGE_2 = new Set([
  3, 6, 9, 12, 15, 18, 31, 34, 36, 38, 40, 45, 59, 62, 65, 68, 71, 76, 94, 103, 121, 130, 139, 141, 149,
]);
// Find which IDs are "evolved into" (someone evolves to them)
const EVOLVED_INTO = new Set(SPECIES.filter((s) => s[2] !== null).map((s) => s[2]));
// Stage-1 mid-evolutions: are evolved into AND evolve further.
const STAGE_1 = new Set(
  SPECIES.filter((s) => EVOLVED_INTO.has(s[0]) && s[2] !== null).map((s) => s[0]),
);

function tierFor(id) {
  if (LEGENDARIES.has(id)) return 4;
  if (FINAL_STAGE_2.has(id)) return 3;
  if (STAGE_1.has(id)) return 2;
  // Single-stage Pokemon (no evolution either way): default tier 2 (mid).
  // Basic Pokemon that evolve OR very common starters: tier 1.
  const sp = SPECIES.find((s) => s[0] === id);
  const evolves = sp[2] !== null;
  if (evolves) return 1; // unevolved basic that evolves
  // Single-stage Pokemon — split: pseudo-legendary-ish strong → tier 3, rest → tier 2.
  const SINGLE_STRONG = new Set([113, 115, 131, 142, 143]); // Chansey, Kangaskhan, Lapras, Aerodactyl, Snorlax
  if (SINGLE_STRONG.has(id)) return 3;
  return 2;
}

// A species is "evolution-only" if it is the evolves_to target of some other
// species — i.e. it can never appear as a wild encounter, only via evolution.
const EVOLUTION_ONLY = EVOLVED_INTO;

const out = SPECIES.map(([id, name, evolves_to, evolve_level]) => ({
  id,
  name,
  tier: tierFor(id),
  evolves_to,
  evolve_level,
  evolution_only: EVOLUTION_ONLY.has(id),
  sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
  sprite_pixel: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
}));

writeFileSync(
  join(__dirname, "..", "data", "pokemon.json"),
  JSON.stringify(out, null, 2) + "\n",
);

const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
for (const p of out) counts[p.tier]++;
console.log(`Wrote ${out.length} Pokemon. Tiers:`, counts);
