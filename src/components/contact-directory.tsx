"use client";

import {
  PlusIcon,
  SearchIcon,
  SearchXIcon,
  UsersRoundIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useDeferredValue, useMemo, useState, type ReactNode } from "react";

import { ContactAvatar } from "@/components/contact-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ContactListItem } from "@/lib/contacts";
import { normalizeForSearch, pluralize } from "@/lib/format";

const CONTACT_FORMS: [string, string, string] = ["контакт", "контакта", "контактов"];
// After "из": "из 1 001 контакта", "из 1 000 контактов".
const CONTACT_FORMS_GENITIVE: [string, string, string] = ["контакта", "контактов", "контактов"];

const ROW_GRID =
  "grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 md:grid-cols-[auto_minmax(0,1.1fr)_minmax(0,1.3fr)_10.5rem_minmax(0,1fr)]";

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
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Контакты</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSearching
              ? `Найдено ${visibleContacts.length} из ${pluralize(contacts.length, CONTACT_FORMS_GENITIVE)}`
              : pluralize(contacts.length, CONTACT_FORMS)}
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/contacts/new">
            <PlusIcon data-icon="inline-start" />
            Добавить контакт
          </Link>
        </Button>
      </div>

      <div className="relative">
        <SearchIcon
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
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
          className="h-10 bg-background pr-10 pl-9 md:text-base [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => updateQuery("")}
            aria-label="Очистить поиск"
            className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground"
          >
            <XIcon />
          </Button>
        )}
      </div>

      {contacts.length === 0 ? (
        <EmptyState
          icon={UsersRoundIcon}
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
          icon={SearchXIcon}
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
        <div className="overflow-hidden rounded-xl border bg-background">
          <div
            className={`${ROW_GRID} hidden border-b bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground md:grid`}
          >
            <span className="size-8" />
            <span>Имя</span>
            <span>Откуда знакомы</span>
            <span>Телефон</span>
            <span>Почта</span>
          </div>
          <ul className="divide-y">
            {visibleContacts.map((contact) => (
              <ContactRow key={contact.id} contact={contact} words={words} />
            ))}
          </ul>
        </div>
      )}
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
    <li className="[contain-intrinsic-size:auto_3.5rem] [content-visibility:auto]">
      <Link
        href={`/contacts/${contact.id}`}
        prefetch={false}
        className={`${ROW_GRID} px-4 py-2.5 outline-none hover:bg-muted/60 focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset`}
      >
        <ContactAvatar name={contact.name} className="size-8 text-xs" />
        <span className="min-w-0">
          <span className="block truncate font-medium">
            {highlight(contact.name, words)}
          </span>
          {contact.howWeMet && (
            <span className="block truncate text-sm text-muted-foreground md:hidden">
              {contact.howWeMet}
            </span>
          )}
        </span>
        <span className="hidden truncate text-sm text-muted-foreground md:block">
          {contact.howWeMet}
        </span>
        <span className="hidden text-sm whitespace-nowrap tabular-nums md:block">
          {contact.phone}
        </span>
        <span className="hidden truncate text-sm md:block">{contact.email}</span>
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
          <mark key={start} className="rounded-sm bg-yellow-200/80 text-inherit">
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

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed bg-background px-6 py-14 text-center">
      <Icon aria-hidden className="mb-3 size-8 text-muted-foreground" />
      <p className="font-medium">{title}</p>
      <p className="mt-1 mb-5 text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
