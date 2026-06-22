import { NextResponse } from 'next/server';
import type { CharacterCardModel } from '../../../types/potter';
import { createSelectedCharactersCsv } from '../../../utils/csv';

const isCharacterCardModel = (value: unknown): value is CharacterCardModel => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === 'string' &&
    typeof record.name === 'string' &&
    typeof record.description === 'string'
  );
};

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const selectedCharacters = Array.isArray(body)
    ? body.filter(isCharacterCardModel)
    : [];
  const csv = createSelectedCharactersCsv(
    selectedCharacters,
    new URL(request.url).origin
  );

  return new NextResponse(csv, {
    headers: {
      'Content-Disposition': `attachment; filename="${selectedCharacters.length}_items.csv"`,
      'Content-Type': 'text/csv;charset=utf-8',
    },
  });
}
