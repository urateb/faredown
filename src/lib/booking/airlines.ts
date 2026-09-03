/**
 * Booking-site homepages for the carriers most likely to show up in results.
 *
 * Airlines do not publish stable deep-link formats, and the unofficial ones
 * rot constantly, so these intentionally point at the booking entry page rather
 * than a prefilled itinerary. The UI is worded to match.
 */
export const AIRLINE_BOOKING_SITES: Record<string, string> = {
  A3: 'https://en.aegeanair.com/',
  AA: 'https://www.aa.com/',
  AC: 'https://www.aircanada.com/',
  AF: 'https://www.airfrance.com/',
  AI: 'https://www.airindia.com/',
  AS: 'https://www.alaskaair.com/',
  AY: 'https://www.finnair.com/',
  AZ: 'https://www.ita-airways.com/',
  BA: 'https://www.britishairways.com/',
  CX: 'https://www.cathaypacific.com/',
  DL: 'https://www.delta.com/',
  EI: 'https://www.aerlingus.com/',
  EK: 'https://www.emirates.com/',
  ET: 'https://www.ethiopianairlines.com/',
  EW: 'https://www.eurowings.com/',
  EY: 'https://www.etihad.com/',
  FR: 'https://www.ryanair.com/',
  IB: 'https://www.iberia.com/',
  JL: 'https://www.jal.co.jp/',
  KL: 'https://www.klm.com/',
  LH: 'https://www.lufthansa.com/',
  LO: 'https://www.lot.com/',
  LX: 'https://www.swiss.com/',
  NH: 'https://www.ana.co.jp/',
  OS: 'https://www.austrian.com/',
  QF: 'https://www.qantas.com/',
  QR: 'https://www.qatarairways.com/',
  SK: 'https://www.flysas.com/',
  SN: 'https://www.brusselsairlines.com/',
  SQ: 'https://www.singaporeair.com/',
  TK: 'https://www.turkishairlines.com/',
  TP: 'https://www.flytap.com/',
  U2: 'https://www.easyjet.com/',
  UA: 'https://www.united.com/',
  VS: 'https://www.virginatlantic.com/',
  VY: 'https://www.vueling.com/',
  W6: 'https://wizzair.com/',
};

export function airlineBookingSite(carrierCode: string): string | null {
  return AIRLINE_BOOKING_SITES[carrierCode.toUpperCase()] ?? null;
}
