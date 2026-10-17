import { PencilIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { addNoteAction } from "@/app/actions";
import { BackLink } from "@/components/back-link";
import { MondrianCard, accentFor } from "@/components/mondrian";
import { NoteForm } from "@/components/note-form";
import { Button } from "@/components/ui/button";
import { getContactWithNotes, parseContactId } from "@/lib/contacts";
import { formatDate, formatDateTime, pluralize, toTelHref } from "@/lib/format";
import { LABEL, META } from "@/lib/typography";
import { cn } from "@/lib/utils";

// Note markers repeat the landing's order of colors.
const NOTE_MARKERS = ["bg-blue", "bg-yellow", "bg-red"];

const LINK =
  "underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue";

async function loadContact(params: PageProps<"/contacts/[id]">["params"]) {
  const id = parseContactId((await params).id);
  const contact = id === null ? null : await getContactWithNotes(id);
  if (!contact) {
    notFound();
  }
  return contact;
}

export async function generateMetadata({
  params,
}: PageProps<"/contacts/[id]">): Promise<Metadata> {
  const contact = await loadContact(params);
  return { title: contact.name };
}

export default async function ContactPage({
  params,
}: PageProps<"/contacts/[id]">) {
  const contact = await loadContact(params);
  const addNote = addNoteAction.bind(null, contact.id);

  return (
    <div>
      <BackLink href="/">Все контакты</BackLink>

      <div className="mt-6 grid items-start gap-x-16 gap-y-12 lg:mt-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section aria-label="Контакт" className="lg:sticky lg:top-6">
          <MondrianCard accent={accentFor(contact.name)}>
            <p className="text-11 leading-none font-medium tracking-date uppercase lg:text-12">
              Добавлен {formatDate(contact.createdAt)}
            </p>
            <h1 className="mt-4 text-27 leading-card-name font-medium tracking-name break-words lg:mt-5 lg:text-32">
              {contact.name}
            </h1>
            <p
              className={cn(
                META,
                "mt-2.5 break-words lg:mt-3",
                !contact.howWeMet && "text-ink-muted",
              )}
            >
              {contact.howWeMet ?? "Не указано, откуда знакомы"}
            </p>

            <dl className="mt-4.5 space-y-4 border-t border-ink pt-4.5 lg:mt-6 lg:pt-5">
              <Detail label="Телефон" emptyText="не указан">
                {contact.phone ? (
                  <a href={toTelHref(contact.phone)} className={LINK}>
                    {contact.phone}
                  </a>
                ) : null}
              </Detail>
              <Detail label="Почта" emptyText="не указана">
                {contact.email ? (
                  <a
                    href={`mailto:${contact.email}`}
                    className={cn(LINK, "break-all")}
                  >
                    {contact.email}
                  </a>
                ) : null}
              </Detail>
            </dl>

            <Button asChild variant="outline" className="mt-6 lg:mt-7">
              <Link href={`/contacts/${contact.id}/edit`}>
                <PencilIcon data-icon="inline-start" />
                Изменить
              </Link>
            </Button>
          </MondrianCard>
        </section>

        <section aria-labelledby="notes-heading">
          <div className="flex items-baseline justify-between gap-3">
            <h2
              id="notes-heading"
              className="text-28 leading-heading font-bold tracking-heading lg:text-36"
            >
              Заметки
            </h2>
            {contact.notes.length > 0 && (
              <span className={LABEL}>
                {pluralize(contact.notes.length, ["заметка", "заметки", "заметок"])}
              </span>
            )}
          </div>

          <div className="mt-5 lg:mt-6">
            <NoteForm action={addNote} />
          </div>

          {contact.notes.length === 0 ? (
            <p className="mt-8 border-y border-ink py-4.5 text-16 leading-body lg:text-17">
              Заметок пока нет. Запишите после разговора, что обсудили и о чём
              договорились.
            </p>
          ) : (
            <ol className="mt-8 border-b border-ink">
              {contact.notes.map((note, index) => (
                <li
                  key={note.id}
                  className="grid grid-cols-[--spacing(3.5)_minmax(0,1fr)] gap-x-4 gap-y-2 border-t border-ink py-4.5 sm:grid-cols-[--spacing(44)_--spacing(3.5)_minmax(0,1fr)] lg:py-5"
                >
                  <time
                    dateTime={note.createdAt.toISOString()}
                    className={cn(LABEL, "col-start-2 sm:col-start-1 sm:row-start-1 sm:pt-1")}
                  >
                    {formatDateTime(note.createdAt)}
                  </time>
                  <span
                    aria-hidden
                    className={cn(
                      "col-start-1 row-start-1 size-3.5 sm:col-start-2 sm:mt-1.25",
                      NOTE_MARKERS[index % NOTE_MARKERS.length],
                    )}
                  />
                  <p className="col-start-2 text-16 leading-body break-words whitespace-pre-wrap sm:col-start-3 sm:row-start-1 lg:text-17">
                    {note.body}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}

function Detail({
  label,
  emptyText,
  children,
}: {
  label: string;
  emptyText: string;
  children: ReactNode;
}) {
  return (
    <div>
      <dt className={LABEL}>{label}</dt>
      <dd className="mt-1 text-16 lg:text-18">
        {children ?? <span className="text-ink-muted">{emptyText}</span>}
      </dd>
    </div>
  );
}
