const VIETNAM_MOBILE_PATTERN = /^0(?:3[2-9]|5[25689]|7[06789]|8[1-9]|9\d)\d{7}$/;

export function normalizeVietnamMobilePhone(value: string): string | null {
  const compact = value.trim().replace(/[\s().-]/g, "");
  let normalized = compact;

  if (compact.startsWith("+84")) normalized = `0${compact.slice(3)}`;
  else if (compact.startsWith("84")) normalized = `0${compact.slice(2)}`;

  return VIETNAM_MOBILE_PATTERN.test(normalized) ? normalized : null;
}
