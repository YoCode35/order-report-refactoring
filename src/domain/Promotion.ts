export interface Promotion {
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: string;
  active: boolean;
}