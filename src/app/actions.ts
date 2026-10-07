"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  addNote,
  createContact,
  parseContactId,
  updateContact,
} from "@/lib/contacts";
import {
  contactSchema,
  firstFieldErrors,
  noteSchema,
  readContactForm,
  readString,
  type ContactField,
  type ContactFormValues,
} from "@/lib/validation";

export type ContactFormState = {
  errors?: Partial<Record<ContactField, string>>;
  /** Submitted values, so the form keeps what the user typed after an error. */
  values?: ContactFormValues;
  message?: string;
};

export type NoteFormState = {
  error?: string;
  body?: string;
  /** Changes on every successful save, so the form knows when to confirm it. */
  savedAt?: number;
};

const SAVE_FAILED = "Не удалось сохранить. Попробуйте ещё раз.";
const CONTACT_NOT_FOUND = "Контакт не найден — возможно, его удалили.";

export async function createContactAction(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const values = readContactForm(formData);
  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: firstFieldErrors(parsed.error), values };
  }

  let id: number;
  try {
    id = await createContact(parsed.data);
  } catch (error) {
    console.error("Failed to create contact", error);
    return { message: SAVE_FAILED, values };
  }

  revalidatePath("/");
  redirect(`/contacts/${id}`);
}

export async function updateContactAction(
  contactId: number,
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const id = parseContactId(contactId);
  const values = readContactForm(formData);
  if (id === null) {
    return { message: CONTACT_NOT_FOUND, values };
  }

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: firstFieldErrors(parsed.error), values };
  }

  let found: boolean;
  try {
    found = await updateContact(id, parsed.data);
  } catch (error) {
    console.error("Failed to update contact", error);
    return { message: SAVE_FAILED, values };
  }
  if (!found) {
    return { message: CONTACT_NOT_FOUND, values };
  }

  revalidatePath("/");
  revalidatePath(`/contacts/${id}`);
  redirect(`/contacts/${id}`);
}

export async function addNoteAction(
  contactId: number,
  _prevState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const id = parseContactId(contactId);
  const body = readString(formData, "body");
  if (id === null) {
    return { error: CONTACT_NOT_FOUND, body };
  }

  const parsed = noteSchema.safeParse({ body });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, body };
  }

  try {
    const found = await addNote(id, parsed.data.body);
    if (!found) {
      return { error: CONTACT_NOT_FOUND, body };
    }
  } catch (error) {
    console.error("Failed to add note", error);
    return { error: SAVE_FAILED, body };
  }

  revalidatePath(`/contacts/${id}`);
  return { savedAt: Date.now() };
}
