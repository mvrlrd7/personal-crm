import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateContactAction } from "@/app/actions";
import { BackLink } from "@/components/back-link";
import { ContactForm } from "@/components/contact-form";
import { MondrianCard, accentFor } from "@/components/mondrian";
import { getContactWithNotes, parseContactId } from "@/lib/contacts";
import { PAGE_TITLE } from "@/lib/typography";
import { cn } from "@/lib/utils";

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
    <div className="max-w-3xl">
      <BackLink href={cardHref}>{contact.name}</BackLink>
      <h1 className={cn(PAGE_TITLE, "mt-6 lg:mt-8")}>Изменить контакт</h1>
      {/* Same colors as the contact's card. */}
      <MondrianCard accent={accentFor(contact.name)} className="mt-7 lg:mt-10">
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
      </MondrianCard>
    </div>
  );
}
