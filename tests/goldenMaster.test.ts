import * as fs from 'fs';
import * as path from 'path';
import { run as refactoredRun } from '../src/index';

describe('Golden Master', () => {
  it('should match stored reference output', () => {
    const expectedPath = path.join(
      __dirname,
      '../legacy/expected/report.txt'
    );

    const expected = fs.readFileSync(expectedPath, 'utf-8');
    const actual = refactoredRun();

    expect(actual).toBe(expected);
  });
});