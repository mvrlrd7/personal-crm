import type { Metadata } from "next";

import { createContactAction } from "@/app/actions";
import { BackLink } from "@/components/back-link";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Новый контакт",
};

export default async function NewContactPage({
  searchParams,
}: PageProps<"/contacts/new">) {
  // Prefills the name when coming from an empty search result.
  const { name } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BackLink href="/">Все контакты</BackLink>
      <div className="rounded-xl border bg-background p-5 sm:p-8">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">
          Новый контакт
        </h1>
        <ContactForm
          action={createContactAction}
          defaultValues={{ name: typeof name === "string" ? name : "" }}
          submitLabel="Добавить контакт"
          cancelHref="/"
        />
      </div>
    </div>
  );
}
