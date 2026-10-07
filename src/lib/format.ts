const pluralRules = new Intl.PluralRules("ru-RU");
const numberFormat = new Intl.NumberFormat("ru-RU");

/** Picks the Russian plural form: [one, few, many], e.g. ["контакт", "контакта", "контактов"]. */
export function pluralize(
  count: number,
  [one, few, many]: [string, string, string],
): string {
  const form = pluralRules.select(count);
  const word = form === "one" ? one : form === "few" ? few : many;
  return `${numberFormat.format(count)} ${word}`;
}

const dateTimeFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDateTime(date: Date): string {
  return dateTimeFormat.format(date);
}

export function formatDate(date: Date): string {
  return dateFormat.format(date);
}

/** Lowercases and folds "ё" into "е" so that "Семён" is found by "семен". */
export function normalizeForSearch(value: string): string {
  return value.toLocaleLowerCase("ru-RU").replaceAll("ё", "е");
}

export function getInitials(name: string): string {
  const letters = name
    .split(/\s+/)
    .filter((word) => /^\p{L}/u.test(word))
    .slice(0, 2)
    .map((word) => word[0].toLocaleUpperCase("ru-RU"));
  return letters.join("") || "?";
}

/** Keeps only the characters a phone dialer understands. */
export function toTelHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
