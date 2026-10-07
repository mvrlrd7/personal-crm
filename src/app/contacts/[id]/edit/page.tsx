import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateContactAction } from "@/app/actions";
import { BackLink } from "@/components/back-link";
import { ContactForm } from "@/components/contact-form";
import { getContactWithNotes, parseContactId } from "@/lib/contacts";

async function loadContact(params: PageProps<"/contacts/[id]/edit">["params"]) {
  const id = parseContactId((await params).id);
  const contact = id === null ? null : await getContactWithNotes(id);
  if (!contact) {
    notFound();
  }
  return contact;
}

export async function generateMetadata({
  params,
}: PageProps<"/contacts/[id]/edit">): Promise<Metadata> {
  const contact = await loadContact(params);
  return { title: `${contact.name}: изменение` };
}

export default async function EditContactPage({
  params,
}: PageProps<"/contacts/[id]/edit">) {
  const contact = await loadContact(params);
  const cardHref = `/contacts/${contact.id}`;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BackLink href={cardHref}>{contact.name}</BackLink>
      <div className="rounded-xl border bg-background p-5 sm:p-8">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">
          Изменить контакт
        </h1>
        <ContactForm
          action={updateContactAction.bind(null, contact.id)}
          defaultValues={{
            name: contact.name,
            howWeMet: contact.howWeMet ?? "",
            phone: contact.phone ?? "",
            email: contact.email ?? "",
          }}
          submitLabel="Сохранить"
          cancelHref={cardHref}
        />
      </div>
    </div>
  );
}
