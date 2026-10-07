import { connection } from "next/server";

import { ContactDirectory } from "@/components/contact-directory";
import { listContacts } from "@/lib/contacts";

export default async function HomePage() {
  // Always read fresh data from the database, never a build-time snapshot.
  await connection();
  const contacts = await listContacts();

  return <ContactDirectory contacts={contacts} />;
}
