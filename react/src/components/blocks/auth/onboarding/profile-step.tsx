"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  OnboardingFieldConfig,
  OnboardingStepConfig,
  OnboardingValue,
} from "../onboarding-block";

export interface ProfileStepProps {
  step: OnboardingStepConfig;
  /** Seed values, so drafts survive back/forward navigation. */
  values: Record<string, OnboardingValue>;
  submitting?: boolean;
  submitLabel: string;
  onSubmit: (values: Record<string, OnboardingValue>) => void | Promise<void>;
  onBack?: () => void;
  /** Reports every edit so the flow can restore drafts across navigation. */
  onDraftChange?: (name: string, value: OnboardingValue) => void;
}

function initialValue(
  field: OnboardingFieldConfig,
  saved: OnboardingValue | undefined,
): OnboardingValue {
  if (field.kind === "checkbox") return typeof saved === "boolean" ? saved : false;
  return typeof saved === "string" ? saved : "";
}

/** Built-in validation, mirroring the declared `FieldConfig` contract. */
function validateField(
  field: OnboardingFieldConfig,
  value: OnboardingValue,
): string | null {
  const required = field.required === true;

  if (field.kind === "checkbox") {
    if (required && value !== true) return `${field.label} is required`;
    return null;
  }

  const text = typeof value === "string" ? value.trim() : "";
  if (required && text.length === 0) return `${field.label} is required`;

  if (field.kind === "url" && text.length > 0) {
    try {
      new URL(text);
    } catch {
      return "Enter a valid URL";
    }
  }

  if (field.kind === "select" && text.length > 0) {
    const allowed = field.options.map((option) => option.value);
    if (!allowed.includes(text)) {
      return `Choose a valid option for ${field.label}`;
    }
  }

  return field.validate?.(text) ?? null;
}

/**
 * Renders one declared profile step: `OnboardingFieldConfig[]` → labeled
 * controls, validated locally before anything is handed to `onSubmit`. Mounted
 * keyed by `step.id` so drafts re-seed per step.
 */
export function ProfileStep({
  step,
  values,
  submitting = false,
  submitLabel,
  onSubmit,
  onBack,
  onDraftChange,
}: ProfileStepProps) {
  const idPrefix = React.useId();
  const [draft, setDraft] = React.useState<Record<string, OnboardingValue>>(
    () =>
      Object.fromEntries(
        step.fields.map((field) => [
          field.name,
          initialValue(field, values[field.name]),
        ]),
      ),
  );
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  function setValue(name: string, value: OnboardingValue) {
    setDraft((current) => ({ ...current, [name]: value }));
    onDraftChange?.(name, value);
    // Clear a field's error as soon as it is edited; re-validation happens on
    // the next submit rather than on every keystroke.
    setErrors((current) =>
      current[name] ? { ...current, [name]: "" } : current,
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const next: Record<string, string> = {};
    for (const field of step.fields) {
      const message = validateField(field, draft[field.name]);
      if (message) next[field.name] = message;
    }
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    setErrors({});

    const submitted: Record<string, OnboardingValue> = {};
    for (const field of step.fields) {
      const value = draft[field.name];
      submitted[field.name] = typeof value === "string" ? value.trim() : value;
    }
    await onSubmit(submitted);
  }

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
      {step.fields.map((field) => {
        const error = errors[field.name] || undefined;
        const controlId = `${idPrefix}-${field.name}`;
        const value = draft[field.name];

        if (field.kind === "checkbox") {
          return (
            <Field
              key={field.name}
              name={field.name}
              invalid={Boolean(error)}
              className="gap-1.5"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  id={controlId}
                  checked={value === true}
                  disabled={submitting}
                  onCheckedChange={(checked) => setValue(field.name, checked)}
                />
                <Label htmlFor={controlId} className="font-normal">
                  {field.label}
                </Label>
              </div>
              {error && <FieldError match>{error}</FieldError>}
            </Field>
          );
        }

        return (
          <Field key={field.name} name={field.name} invalid={Boolean(error)}>
            <FieldLabel htmlFor={controlId}>{field.label}</FieldLabel>
            {field.kind === "textarea" ? (
              <Textarea
                id={controlId}
                aria-invalid={error ? true : undefined}
                disabled={submitting}
                placeholder={field.placeholder}
                value={String(value ?? "")}
                onChange={(event) => setValue(field.name, event.target.value)}
              />
            ) : field.kind === "select" ? (
              // No select atom exists in the library yet; a native control
              // styled to match Input keeps the flow self-contained without
              // inventing one here.
              <select
                id={controlId}
                aria-invalid={error ? true : undefined}
                className={cn(
                  "h-8.5 w-full rounded-lg border border-input bg-background px-[calc(--spacing(3)-1px)] text-base text-foreground shadow-xs/5 outline-none transition-[box-shadow,border-color] duration-150 ease-smooth-out focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/24 disabled:opacity-64 aria-invalid:border-destructive/36 sm:h-7.5 sm:text-sm dark:bg-input/32",
                )}
                disabled={submitting}
                value={String(value ?? "")}
                onChange={(event) => setValue(field.name, event.target.value)}
              >
                <option value="">{field.placeholder ?? "Choose an option"}</option>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id={controlId}
                aria-invalid={error ? true : undefined}
                disabled={submitting}
                placeholder={field.placeholder}
                type={field.kind === "url" ? "url" : "text"}
                value={String(value ?? "")}
                onChange={(event) => setValue(field.name, event.target.value)}
              />
            )}
            {error && <FieldError match>{error}</FieldError>}
          </Field>
        );
      })}

      <div className="flex gap-2">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={onBack}
          >
            Back
          </Button>
        )}
        <Button className="flex-1" type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
