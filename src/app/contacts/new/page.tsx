import type { Metadata } from "next";

import { createContactAction } from "@/app/actions";
import { BackLink } from "@/components/back-link";
import { ContactForm } from "@/components/contact-form";
import { MondrianCard } from "@/components/mondrian";
import { PAGE_TITLE } from "@/lib/typography";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Новый контакт",
};

export default async function NewContactPage({
  searchParams,
}: PageProps<"/contacts/new">) {
  // Prefills the name when coming from an empty search result.
  const { name } = await searchParams;

  return (
    <div className="max-w-3xl">
      <BackLink href="/">Все контакты</BackLink>
      <h1 className={cn(PAGE_TITLE, "mt-6 lg:mt-8")}>Новый контакт</h1>
      <MondrianCard accent="blue" className="mt-7 lg:mt-10">
        <ContactForm
          action={createContactAction}
          defaultValues={{ name: typeof name === "string" ? name : "" }}
          submitLabel="Добавить контакт"
          cancelHref="/"
        />
      </MondrianCard>
    </div>
  );
}
