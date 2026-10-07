import { z } from "zod";

export const CONTACT_LIMITS = {
  name: 200,
  howWeMet: 500,
  phone: 50,
  email: 200,
} as const;

export const NOTE_MAX_LENGTH = 10_000;

/** Empty optional fields are stored as NULL. */
function optionalText(max: number, tooLongMessage: string) {
  return z
    .string()
    .trim()
    .max(max, tooLongMessage)
    .transform((value) => value || null);
}

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Укажите имя")
    .max(CONTACT_LIMITS.name, `Не больше ${CONTACT_LIMITS.name} символов`),
  howWeMet: optionalText(
    CONTACT_LIMITS.howWeMet,
    `Не больше ${CONTACT_LIMITS.howWeMet} символов`,
  ),
  phone: optionalText(
    CONTACT_LIMITS.phone,
    `Не больше ${CONTACT_LIMITS.phone} символов`,
  ),
  email: z
    .string()
    .trim()
    .max(CONTACT_LIMITS.email, `Не больше ${CONTACT_LIMITS.email} символов`)
    .refine(
      (value) => value === "" || z.email().safeParse(value).success,
      "Похоже, в адресе ошибка. Пример: name@mail.ru",
    )
    .transform((value) => value || null),
});

export type ContactInput = z.output<typeof contactSchema>;
export type ContactField = keyof z.input<typeof contactSchema>;
export type ContactFormValues = Record<ContactField, string>;

export const noteSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Напишите текст заметки")
    .max(NOTE_MAX_LENGTH, `Не больше ${NOTE_MAX_LENGTH} символов`),
});

export function readContactForm(formData: FormData): ContactFormValues {
  return {
    name: readString(formData, "name"),
    howWeMet: readString(formData, "howWeMet"),
    phone: readString(formData, "phone"),
    email: readString(formData, "email"),
  };
}

export function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

/** Maps zod issues to the first error message of each field. */
export function firstFieldErrors<Field extends string>(
  error: z.ZodError,
): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as Field;
    errors[field] ??= issue.message;
  }
  return errors;
}
