import { afterEach, describe, expect, it, vi } from 'vitest';
import { characters } from '../test/testData';
import {
  buildCharacterDetailsUrl,
  createSelectedCharactersCsv,
  downloadSelectedCharactersCsv,
} from './csv';

describe('csv utilities', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates CSV rows with useful selected item info', () => {
    const csv = createSelectedCharactersCsv([
      {
        id: 'quote-test',
        name: 'Comma, Character',
        description: 'Known as "quoted"',
      },
    ]);

    expect(csv).toContain('id,name,description,detailsUrl');
    expect(csv).toContain(
      'quote-test,"Comma, Character","Known as ""quoted"""'
    );
    expect(csv).toContain(buildCharacterDetailsUrl('quote-test'));
  });

  it('downloads selected items with native browser APIs and count-based filename', async () => {
    const createObjectUrl = vi.fn((nextBlob: Blob) => {
      void nextBlob;
      return 'blob:selection-csv';
    });
    const revokeObjectUrl = vi.fn();
    let downloadedFileName = '';
    let blob: Blob | undefined;
    const fetchMock = vi.fn(() =>
      Promise.resolve(
        new Response('id,name,description,detailsUrl', {
          headers: { 'Content-Type': 'text/csv;charset=utf-8' },
        })
      )
    );

    globalThis.fetch = fetchMock as typeof fetch;
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: (nextBlob: Blob) => {
        blob = nextBlob;
        return createObjectUrl(nextBlob);
      },
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectUrl,
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      downloadedFileName = this.download;
    });

    await downloadSelectedCharactersCsv(characters);

    expect(fetchMock).toHaveBeenCalledWith('/api/selected-characters-csv', {
      body: JSON.stringify(characters),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    expect(createObjectUrl).toHaveBeenCalledOnce();
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:selection-csv');
    expect(downloadedFileName).toBe('2_items.csv');
    expect(blob).toBeInstanceOf(Blob);
    expect(blob?.type).toBe('text/csv;charset=utf-8');
  });
});
