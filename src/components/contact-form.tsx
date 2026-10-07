"use client";

import Link from "next/link";
import { useActionState, type ComponentProps } from "react";

import type { ContactFormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CONTACT_LIMITS,
  type ContactField,
  type ContactFormValues,
} from "@/lib/validation";

type ContactFormProps = {
  action: (
    state: ContactFormState,
    formData: FormData,
  ) => Promise<ContactFormState>;
  defaultValues?: Partial<ContactFormValues>;
  submitLabel: string;
  cancelHref: string;
};

export function ContactForm({
  action,
  defaultValues,
  submitLabel,
  cancelHref,
}: ContactFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  // After a failed save, React resets the form; show what the user typed again.
  const values = state.values ?? defaultValues ?? {};

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <Field
        name="name"
        label="Имя"
        required
        autoFocus
        placeholder="Например, Анна Смирнова"
        maxLength={CONTACT_LIMITS.name}
        defaultValue={values.name}
        error={state.errors?.name}
      />
      <Field
        name="howWeMet"
        label="Откуда знакомы"
        placeholder="Например, учились вместе в университете"
        maxLength={CONTACT_LIMITS.howWeMet}
        defaultValue={values.howWeMet}
        error={state.errors?.howWeMet}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          name="phone"
          label="Телефон"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          placeholder="+7 900 000-00-00"
          maxLength={CONTACT_LIMITS.phone}
          defaultValue={values.phone}
          error={state.errors?.phone}
        />
        <Field
          name="email"
          label="Почта"
          type="email"
          autoComplete="off"
          placeholder="name@mail.ru"
          maxLength={CONTACT_LIMITS.email}
          defaultValue={values.email}
          error={state.errors?.email}
        />
      </div>

      {state.message && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Сохраняю…" : submitLabel}
        </Button>
        <Button asChild type="button" variant="ghost" size="lg">
          <Link href={cancelHref}>Отмена</Link>
        </Button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  error,
  required,
  ...inputProps
}: {
  name: ContactField;
  label: string;
  error?: string;
} & Omit<ComponentProps<typeof Input>, "name">) {
  const id = `contact-${name}`;
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-muted-foreground" aria-hidden>
            *
          </span>
        )}
      </Label>
      <Input
        id={id}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="h-10 bg-background md:text-base"
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
