"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import type { NoteFormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NOTE_MAX_LENGTH } from "@/lib/validation";

type NoteFormProps = {
  action: (state: NoteFormState, formData: FormData) => Promise<NoteFormState>;
};

export function NoteForm({ action }: NoteFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  useEffect(() => {
    if (state.savedAt) {
      toast.success("Заметка сохранена");
    }
  }, [state.savedAt]);

  return (
    <form action={formAction} className="space-y-2">
      <Label htmlFor="note-body" className="sr-only">
        Новая заметка
      </Label>
      <Textarea
        id="note-body"
        name="body"
        rows={3}
        required
        maxLength={NOTE_MAX_LENGTH}
        // React clears the form after saving; after an error, keep the text.
        defaultValue={state.body}
        placeholder="О чём поговорили, о чём договорились…"
        aria-invalid={state.error ? true : undefined}
        aria-describedby={state.error ? "note-body-error" : undefined}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
        className="min-h-24 bg-background md:text-base"
      />
      {state.error && (
        <p id="note-body-error" role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <div className="flex items-center justify-end gap-3">
        <span className="hidden text-xs text-muted-foreground sm:inline">
          Ctrl + Enter — сохранить
        </span>
        <Button type="submit" disabled={pending}>
          {pending ? "Сохраняю…" : "Сохранить заметку"}
        </Button>
      </div>
    </form>
  );
}
