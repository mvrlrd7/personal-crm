"use client";

import { Trash2Icon } from "lucide-react";
import { useActionState, useState } from "react";

import type { DeleteContactState } from "@/app/actions";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { pluralize } from "@/lib/format";

type DeleteContactButtonProps = {
  action: (state: DeleteContactState) => Promise<DeleteContactState>;
  name: string;
  noteCount: number;
};

export function DeleteContactButton(props: DeleteContactButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost">
          <Trash2Icon data-icon="inline-start" />
          Удалить
        </Button>
      </AlertDialogTrigger>
      {/* Mounted only while open, so an error from a past attempt is gone next time. */}
      {open && <DeleteContactContent {...props} />}
    </AlertDialog>
  );
}

function DeleteContactContent({
  action,
  name,
  noteCount,
}: DeleteContactButtonProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <AlertDialogContent
      onEscapeKeyDown={(event) => {
        if (pending) {
          event.preventDefault();
        }
      }}
    >
      <form action={formAction} className="grid gap-6">
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить контакт?</AlertDialogTitle>
          <AlertDialogDescription>
            {noteCount > 0
              ? `${name} и ${pluralize(noteCount, ["заметка", "заметки", "заметок"])} удалятся насовсем.`
              : `${name} удалится насовсем.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {state.error && (
          <p role="alert" className="text-14 text-red">
            {state.error}
          </p>
        )}

        <AlertDialogFooter>
          <Button type="submit" variant="destructive" disabled={pending}>
            {pending ? "Удаляю…" : "Удалить"}
          </Button>
          <AlertDialogCancel disabled={pending}>Отмена</AlertDialogCancel>
        </AlertDialogFooter>
      </form>
    </AlertDialogContent>
  );
}
