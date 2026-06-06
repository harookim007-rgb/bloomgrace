// Map E.164 dial codes (longest-first match) to ISO country codes + names
const DIAL_CODES: Array<{ dial: string; iso: string; name: string }> = [
  { dial: "1", iso: "US", name: "United States" },
  { dial: "7", iso: "RU", name: "Russia" },
  { dial: "20", iso: "EG", name: "Egypt" },
  { dial: "27", iso: "ZA", name: "South Africa" },
  { dial: "30", iso: "GR", name: "Greece" },
  { dial: "31", iso: "NL", name: "Netherlands" },
  { dial: "32", iso: "BE", name: "Belgium" },
  { dial: "33", iso: "FR", name: "France" },
  { dial: "34", iso: "ES", name: "Spain" },
  { dial: "36", iso: "HU", name: "Hungary" },
  { dial: "39", iso: "IT", name: "Italy" },
  { dial: "40", iso: "RO", name: "Romania" },
  { dial: "41", iso: "CH", name: "Switzerland" },
  { dial: "43", iso: "AT", name: "Austria" },
  { dial: "44", iso: "GB", name: "United Kingdom" },
  { dial: "45", iso: "DK", name: "Denmark" },
  { dial: "46", iso: "SE", name: "Sweden" },
  { dial: "47", iso: "NO", name: "Norway" },
  { dial: "48", iso: "PL", name: "Poland" },
  { dial: "49", iso: "DE", name: "Germany" },
  { dial: "51", iso: "PE", name: "Peru" },
  { dial: "52", iso: "MX", name: "Mexico" },
  { dial: "54", iso: "AR", name: "Argentina" },
  { dial: "55", iso: "BR", name: "Brazil" },
  { dial: "56", iso: "CL", name: "Chile" },
  { dial: "57", iso: "CO", name: "Colombia" },
  { dial: "58", iso: "VE", name: "Venezuela" },
  { dial: "60", iso: "MY", name: "Malaysia" },
  { dial: "61", iso: "AU", name: "Australia" },
  { dial: "62", iso: "ID", name: "Indonesia" },
  { dial: "63", iso: "PH", name: "Philippines" },
  { dial: "64", iso: "NZ", name: "New Zealand" },
  { dial: "65", iso: "SG", name: "Singapore" },
  { dial: "66", iso: "TH", name: "Thailand" },
  { dial: "81", iso: "JP", name: "Japan" },
  { dial: "82", iso: "KR", name: "South Korea" },
  { dial: "84", iso: "VN", name: "Vietnam" },
  { dial: "86", iso: "CN", name: "China" },
  { dial: "90", iso: "TR", name: "Turkey" },
  { dial: "91", iso: "IN", name: "India" },
  { dial: "92", iso: "PK", name: "Pakistan" },
  { dial: "93", iso: "AF", name: "Afghanistan" },
  { dial: "94", iso: "LK", name: "Sri Lanka" },
  { dial: "95", iso: "MM", name: "Myanmar" },
  { dial: "98", iso: "IR", name: "Iran" },
  { dial: "212", iso: "MA", name: "Morocco" },
  { dial: "234", iso: "NG", name: "Nigeria" },
  { dial: "351", iso: "PT", name: "Portugal" },
  { dial: "352", iso: "LU", name: "Luxembourg" },
  { dial: "353", iso: "IE", name: "Ireland" },
  { dial: "354", iso: "IS", name: "Iceland" },
  { dial: "358", iso: "FI", name: "Finland" },
  { dial: "359", iso: "BG", name: "Bulgaria" },
  { dial: "370", iso: "LT", name: "Lithuania" },
  { dial: "371", iso: "LV", name: "Latvia" },
  { dial: "372", iso: "EE", name: "Estonia" },
  { dial: "380", iso: "UA", name: "Ukraine" },
  { dial: "420", iso: "CZ", name: "Czechia" },
  { dial: "421", iso: "SK", name: "Slovakia" },
  { dial: "852", iso: "HK", name: "Hong Kong" },
  { dial: "853", iso: "MO", name: "Macao" },
  { dial: "855", iso: "KH", name: "Cambodia" },
  { dial: "886", iso: "TW", name: "Taiwan" },
  { dial: "962", iso: "JO", name: "Jordan" },
  { dial: "966", iso: "SA", name: "Saudi Arabia" },
  { dial: "971", iso: "AE", name: "United Arab Emirates" },
  { dial: "972", iso: "IL", name: "Israel" },
];

// Sort longest first for greedy match
const SORTED = [...DIAL_CODES].sort((a, b) => b.dial.length - a.dial.length);

export function isoToFlag(iso?: string): string {
  if (!iso || iso.length !== 2) return "🌐";
  const base = 0x1f1e6;
  return String.fromCodePoint(
    base + (iso.charCodeAt(0) - 65),
    base + (iso.charCodeAt(1) - 65),
  );
}

export function parsePhone(phone?: string | null): { iso: string; name: string; dial: string; flag: string } | null {
  if (!phone) return null;
  const digits = phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
  if (!digits) return null;
  for (const c of SORTED) {
    if (digits.startsWith(c.dial)) {
      return { iso: c.iso, name: c.name, dial: c.dial, flag: isoToFlag(c.iso) };
    }
  }
  return null;
}
