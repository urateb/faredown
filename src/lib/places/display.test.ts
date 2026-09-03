import { describe, expect, it } from 'vitest';

import { displayAirport } from './display';

describe('displayAirport', () => {
  it('labels a known IATA code with its city', () => {
    expect(displayAirport('LHR')).toBe('London (LHR)');
  });

  it('is a no-op when the field is already labelled', () => {
    expect(displayAirport('London (LHR)')).toBe('London (LHR)');
  });

  it('labels Pristina and Tirana from the local airport index', () => {
    expect(displayAirport('PRN')).toBe('Pristina (PRN)');
    expect(displayAirport('TIA')).toBe('Tirana (TIA)');
  });

  it('leaves free text that is not a code alone', () => {
    expect(displayAirport('London')).toBe('London');
  });
});
