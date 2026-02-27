import * as fs from 'fs';

export class JsonExporter {
  export(path: string, data: any[]): void {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  }
}