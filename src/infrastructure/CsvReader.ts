import * as fs from 'fs';

export class CsvReader {
  read(path: string): string[][] {
    const content = fs.readFileSync(path, 'utf-8');
    return content
      .split('\n')
      .filter(l => l.trim())
      .map(l => l.split(','));
  }
}