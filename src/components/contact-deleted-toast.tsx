"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

/** Confirms a deletion: deleteContactAction sends the user to the list with "?deleted=1". */
export function ContactDeletedToast() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const deleted = searchParams.has("deleted");

  useEffect(() => {
    if (!deleted) {
      return;
    }
    // The id keeps the toast single if the effect runs twice.
    toast.success("Контакт успешно удалён", { id: "contact-deleted" });

    // Drop the flag, so a reload does not confirm the deletion again.
    const params = new URLSearchParams(window.location.search);
    params.delete("deleted");
    const search = params.toString();
    window.history.replaceState(null, "", search ? `?${search}` : pathname);
  }, [deleted, pathname]);

  return null;
}
