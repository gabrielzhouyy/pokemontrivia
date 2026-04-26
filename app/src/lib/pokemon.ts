import pokemonData from "../../data/pokemon.json";

export type Pokemon = {
  id: number;
  name: string;
  tier: 1 | 2 | 3 | 4;
  evolves_to: number | null;
  evolve_level: number | null;
  // True when this species is the target of some other species' evolution
  // (e.g. Ivysaur, Charmeleon). Such Pokemon can never appear as wild
  // encounters — they can only be obtained by evolving the previous form.
  evolution_only: boolean;
  sprite: string;
  sprite_pixel: string;
};

export const POKEMON: Pokemon[] = pokemonData as Pokemon[];

const BY_ID = new Map(POKEMON.map((p) => [p.id, p]));

export function getPokemon(id: number): Pokemon {
  const p = BY_ID.get(id);
  if (!p) throw new Error(`Unknown Pokemon id ${id}`);
  return p;
}

export const STARTERS = [1, 4, 7]; // Bulbasaur, Charmander, Squirtle
