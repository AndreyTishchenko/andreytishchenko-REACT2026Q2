export interface PotterCharacterAttributes {
  readonly name: string | null;
  readonly alias_names: readonly string[] | null;
  readonly house: string | null;
  readonly species: string | null;
  readonly gender: string | null;
  readonly born: string | null;
  readonly died: string | null;
  readonly jobs: readonly string[] | null;
}

export interface PotterCharacterResource {
  readonly id: string;
  readonly type: string;
  readonly attributes: PotterCharacterAttributes;
}

export interface PotterApiLinks {
  readonly self?: string;
  readonly current?: string;
  readonly first?: string;
  readonly prev?: string | null;
  readonly next?: string | null;
  readonly last?: string;
}

export interface PotterCharactersResponse {
  readonly data: readonly PotterCharacterResource[];
  readonly links?: PotterApiLinks;
}

export interface CharacterCardModel {
  readonly id: string;
  readonly name: string;
  readonly description: string;
}
