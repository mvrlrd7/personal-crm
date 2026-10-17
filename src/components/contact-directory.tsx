"use client";

import { PlusIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useDeferredValue, useMemo, useState, type ReactNode } from "react";

import { ContactAvatar } from "@/components/contact-avatar";
import { ACCENT_FILL, type Accent } from "@/components/mondrian";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ContactListItem } from "@/lib/contacts";
import { normalizeForSearch, pluralize } from "@/lib/format";
import { LABEL, META, PAGE_TITLE } from "@/lib/typography";
import { cn } from "@/lib/utils";

const CONTACT_FORMS: [string, string, string] = ["контакт", "контакта", "контактов"];
// After "из": "из 1 001 контакта", "из 1 000 контактов".
const CONTACT_FORMS_GENITIVE: [string, string, string] = ["контакта", "контактов", "контактов"];

// Each row of the list: a square color cell on the left, a white cell on the right.
const ROW_GRID =
  "grid grid-cols-[--spacing(14)_minmax(0,1fr)] gap-0.75 sm:grid-cols-[--spacing(18)_minmax(0,1fr)]";

const DETAILS_GRID =
  "md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)_10.5rem_minmax(0,1fr)] md:items-baseline md:gap-x-5";

export function ContactDirectory({ contacts }: { contacts: ContactListItem[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(urlQuery);
  const [syncedUrlQuery, setSyncedUrlQuery] = useState(urlQuery);

  // The URL changed from outside (e.g. the header link): show that search instead.
  if (urlQuery !== syncedUrlQuery) {
    setSyncedUrlQuery(urlQuery);
    if (urlQuery !== query.trim()) {
      setQuery(urlQuery);
    }
  }

  // Typing stays responsive even while a long list re-renders.
  const deferredQuery = useDeferredValue(query);
  const words = useMemo(
    () => normalizeForSearch(deferredQuery).split(/\s+/).filter(Boolean),
    [deferredQuery],
  );

  const searchIndex = useMemo(
    () => contacts.map((contact) => normalizeForSearch(contact.name)),
    [contacts],
  );

  const visibleContacts = useMemo(
    () =>
      words.length === 0
        ? contacts
        : contacts.filter((_, i) =>
            words.every((word) => searchIndex[i].includes(word)),
          ),
    [contacts, searchIndex, words],
  );

  function updateQuery(value: string) {
    setQuery(value);
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = value.trim();
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    const search = params.toString();
    // Keeps the search in the address bar without a server round trip,
    // so "Back" from a contact card returns to the same results.
    window.history.replaceState(null, "", search ? `?${search}` : pathname);
  }

  const trimmedQuery = query.trim();
  const isSearching = words.length > 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div>
          <p className={LABEL}>
            {isSearching
              ? `Найдено ${visibleContacts.length} из ${pluralize(contacts.length, CONTACT_FORMS_GENITIVE)}`
              : pluralize(contacts.length, CONTACT_FORMS)}
          </p>
          <h1 className={cn(PAGE_TITLE, "mt-3.5 lg:mt-5")}>Контакты</h1>
        </div>
        <Button asChild size="lg">
          <Link href="/contacts/new">
            <PlusIcon data-icon="inline-start" />
            Добавить контакт
          </Link>
        </Button>
      </div>

      <div className="mt-7 flex flex-col gap-0.75 border-3 border-ink bg-ink lg:mt-10">
        <div className={ROW_GRID}>
          <label
            htmlFor="contact-search"
            className="flex items-center justify-center bg-ink text-11 leading-none font-medium tracking-label text-paper uppercase"
          >
            Поиск
          </label>
          <div className="relative bg-paper">
            <Input
              id="contact-search"
              type="search"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  updateQuery("");
                }
              }}
              placeholder="Найти по имени"
              aria-label="Найти контакт по имени"
              autoComplete="off"
              spellCheck={false}
              className="h-16 border-0 pr-14 pl-4.5 text-20 font-medium caret-blue focus-visible:-outline-offset-3 sm:pl-5.5 lg:text-22 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => updateQuery("")}
                aria-label="Очистить поиск"
                className="absolute top-1/2 right-3 -translate-y-1/2"
              >
                <XIcon className="size-5" />
              </Button>
            )}
          </div>
        </div>

        {contacts.length === 0 ? (
          <EmptyState
            accent="yellow"
            title="Пока нет ни одного контакта"
            description="Добавьте первого человека — он появится в этом списке."
            action={
              <Button asChild>
                <Link href="/contacts/new">
                  <PlusIcon data-icon="inline-start" />
                  Добавить контакт
                </Link>
              </Button>
            }
          />
        ) : visibleContacts.length === 0 ? (
          <EmptyState
            accent="red"
            title={`По запросу «${trimmedQuery}» никого не нашли`}
            description="Проверьте написание или добавьте этого человека."
            action={
              <Button asChild variant="outline">
                <Link
                  href={`/contacts/new?name=${encodeURIComponent(trimmedQuery)}`}
                >
                  <PlusIcon data-icon="inline-start" />
                  Добавить «{trimmedQuery}»
                </Link>
              </Button>
            }
          />
        ) : (
          <ul className="flex flex-col gap-0.75">
            {visibleContacts.map((contact) => (
              <ContactRow key={contact.id} contact={contact} words={words} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ContactRow({
  contact,
  words,
}: {
  contact: ContactListItem;
  words: string[];
}) {
  return (
    <li className="[contain-intrinsic-size:auto_4.5rem] [content-visibility:auto]">
      <Link
        href={`/contacts/${contact.id}`}
        prefetch={false}
        className={cn(
          ROW_GRID,
          "group focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-blue",
        )}
      >
        <ContactAvatar name={contact.name} className="size-auto text-15 sm:text-17" />
        <span
          className={cn(
            "min-w-0 bg-paper px-4.5 py-4 transition-colors duration-150 group-hover:bg-page sm:px-5.5",
            DETAILS_GRID,
          )}
        >
          <span className="min-w-0">
            <span className="block truncate text-17 leading-title font-semibold lg:text-19">
              {highlight(contact.name, words)}
            </span>
            {contact.howWeMet && (
              <span className={cn(META, "mt-1.5 block truncate md:hidden")}>
                {contact.howWeMet}
              </span>
            )}
          </span>
          <span className={cn(META, "hidden truncate md:block")}>
            {contact.howWeMet}
          </span>
          <span className="hidden text-15 whitespace-nowrap tabular-nums md:block">
            {contact.phone}
          </span>
          <span className="hidden truncate text-15 md:block">{contact.email}</span>
        </span>
      </Link>
    </li>
  );
}

/** Wraps the parts of the name that match the search words in <mark>. */
function highlight(name: string, words: string[]): ReactNode {
  const normalized = normalizeForSearch(name);
  // Lowercasing can change the length of a few exotic letters; skip highlighting then.
  if (words.length === 0 || normalized.length !== name.length) {
    return name;
  }

  const marked = new Array<boolean>(name.length).fill(false);
  for (const word of words) {
    const start = normalized.indexOf(word);
    if (start !== -1) {
      marked.fill(true, start, start + word.length);
    }
  }

  const parts: ReactNode[] = [];
  let start = 0;
  for (let i = 1; i <= name.length; i++) {
    if (i === name.length || marked[i] !== marked[start]) {
      const text = name.slice(start, i);
      parts.push(
        marked[start] ? (
          <mark key={start} className="bg-yellow text-ink">
            {text}
          </mark>
        ) : (
          text
        ),
      );
      start = i;
    }
  }
  return parts;
}

/** A row of the list frame in place of contacts: color cell + message. */
function EmptyState({
  accent,
  title,
  description,
  action,
}: {
  accent: Accent;
  title: string;
  description: string;
  action: ReactNode;
}) {
  return (
    <div className={ROW_GRID}>
      <span aria-hidden className={ACCENT_FILL[accent]} />
      <div className="min-w-0 bg-paper px-4.5 py-7 sm:px-5.5 lg:py-9">
        <p className="text-18 leading-title font-semibold break-words lg:text-22">
          {title}
        </p>
        <p className="mt-2 text-15 leading-body lg:text-17">{description}</p>
        <div className="mt-5">{action}</div>
      </div>
    </div>
  );
}
