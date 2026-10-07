import { MailIcon, PencilIcon, PhoneIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { addNoteAction } from "@/app/actions";
import { BackLink } from "@/components/back-link";
import { ContactAvatar } from "@/components/contact-avatar";
import { NoteForm } from "@/components/note-form";
import { Button } from "@/components/ui/button";
import { getContactWithNotes, parseContactId } from "@/lib/contacts";
import { formatDate, formatDateTime, pluralize, toTelHref } from "@/lib/format";

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
    <div className="space-y-6">
      <BackLink href="/">Все контакты</BackLink>

      <div className="grid items-start gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <section
          aria-label="Контакт"
          className="rounded-xl border bg-background p-5 sm:p-6 lg:sticky lg:top-6"
        >
          <div className="flex items-start gap-4">
            <ContactAvatar name={contact.name} className="size-14 text-lg" />
            <div className="min-w-0 flex-1 pt-1">
              <h1 className="text-xl font-semibold tracking-tight break-words">
                {contact.name}
              </h1>
              <p className="mt-1 text-sm break-words text-muted-foreground">
                {contact.howWeMet ?? "Не указано, откуда знакомы"}
              </p>
            </div>
          </div>

          <dl className="mt-5 space-y-4 border-t pt-5">
            <Detail icon={<PhoneIcon />} label="Телефон" emptyText="не указан">
              {contact.phone ? (
                <a
                  href={toTelHref(contact.phone)}
                  className="underline-offset-4 hover:underline"
                >
                  {contact.phone}
                </a>
              ) : null}
            </Detail>
            <Detail icon={<MailIcon />} label="Почта" emptyText="не указана">
              {contact.email ? (
                <a
                  href={`mailto:${contact.email}`}
                  className="break-all underline-offset-4 hover:underline"
                >
                  {contact.email}
                </a>
              ) : null}
            </Detail>
          </dl>

          <div className="mt-6 flex items-center justify-between gap-3 border-t pt-5">
            <p className="text-xs text-muted-foreground">
              Добавлен {formatDate(contact.createdAt)}
            </p>
            <Button asChild variant="outline">
              <Link href={`/contacts/${contact.id}/edit`}>
                <PencilIcon data-icon="inline-start" />
                Изменить
              </Link>
            </Button>
          </div>
        </section>

        <section
          aria-labelledby="notes-heading"
          className="rounded-xl border bg-background p-5 sm:p-6"
        >
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 id="notes-heading" className="text-lg font-semibold tracking-tight">
              Заметки
            </h2>
            {contact.notes.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {pluralize(contact.notes.length, ["заметка", "заметки", "заметок"])}
              </span>
            )}
          </div>

          <NoteForm action={addNote} />

          {contact.notes.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Заметок пока нет. Запишите после разговора, что обсудили и о чём
              договорились.
            </p>
          ) : (
            <ol className="mt-6 space-y-3">
              {contact.notes.map((note) => (
                <li key={note.id} className="rounded-lg border bg-muted/30 p-4">
                  <time
                    dateTime={note.createdAt.toISOString()}
                    className="text-xs font-medium text-muted-foreground"
                  >
                    {formatDateTime(note.createdAt)}
                  </time>
                  <p className="mt-1.5 break-words whitespace-pre-wrap">
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
  icon,
  label,
  emptyText,
  children,
}: {
  icon: ReactNode;
  label: string;
  emptyText: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span
        aria-hidden
        className="mt-0.5 text-muted-foreground [&_svg]:size-4"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="mt-0.5">
          {children ?? <span className="text-muted-foreground">{emptyText}</span>}
        </dd>
      </div>
    </div>
  );
}
