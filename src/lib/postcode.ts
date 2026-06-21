const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

export function normalizePostcode(postcode: string): string {
  return postcode.replace(/\s+/g, " ").trim().toUpperCase();
}

export function isValidUkPostcode(postcode: string): boolean {
  return UK_POSTCODE_REGEX.test(normalizePostcode(postcode));
}

export function formatPostcodeInput(value: string): string {
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (cleaned.length <= 3) return cleaned;
  return `${cleaned.slice(0, -3)} ${cleaned.slice(-3)}`;
}
