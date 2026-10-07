import "server-only";

import { desc, eq, sql } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import { contacts, notes } from "@/db/schema";
import type { ContactInput } from "@/lib/validation";

export type ContactListItem = {
  id: number;
  name: string;
  howWeMet: string | null;
  phone: string | null;
  email: string | null;
};

// Russian alphabetical order: "Ё" next to "Е", case-insensitive.
const byNameRu = sql`${contacts.name} collate "ru-x-icu"`;

export async function listContacts(): Promise<ContactListItem[]> {
  return db
    .select({
      id: contacts.id,
      name: contacts.name,
      howWeMet: contacts.howWeMet,
      phone: contacts.phone,
      email: contacts.email,
    })
    .from(contacts)
    .orderBy(byNameRu, contacts.id);
}

/** Cached per request so that the page and its metadata share one query. */
export const getContactWithNotes = cache(async (id: number) => {
  const [contact] = await db
    .select()
    .from(contacts)
    .where(eq(contacts.id, id));

  if (!contact) {
    return null;
  }

  const contactNotes = await db
    .select()
    .from(notes)
    .where(eq(notes.contactId, id))
    .orderBy(desc(notes.createdAt), desc(notes.id));

  return { ...contact, notes: contactNotes };
});

export async function createContact(input: ContactInput): Promise<number> {
  const [created] = await db
    .insert(contacts)
    .values(input)
    .returning({ id: contacts.id });
  return created.id;
}

/** Returns false when the contact does not exist. */
export async function updateContact(
  id: number,
  input: ContactInput,
): Promise<boolean> {
  const updated = await db
    .update(contacts)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(contacts.id, id))
    .returning({ id: contacts.id });
  return updated.length > 0;
}

/** Returns false when the contact does not exist. */
export async function addNote(contactId: number, body: string): Promise<boolean> {
  return db.transaction(async (tx) => {
    const touched = await tx
      .update(contacts)
      .set({ updatedAt: new Date() })
      .where(eq(contacts.id, contactId))
      .returning({ id: contacts.id });

    if (touched.length === 0) {
      return false;
    }

    await tx.insert(notes).values({ contactId, body });
    return true;
  });
}

const MAX_ID = 2_147_483_647; // PostgreSQL integer

/** Parses a route or action id; returns null for anything but a positive integer. */
export function parseContactId(value: unknown): number | null {
  if (typeof value === "string" && !/^[1-9]\d{0,9}$/.test(value)) {
    return null;
  }
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 && id <= MAX_ID ? id : null;
}
