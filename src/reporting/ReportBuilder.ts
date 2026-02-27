export class ReportBuilder {
  build(total: number): string {
    return `TOTAL=${total.toFixed(2)}`;
  }
}