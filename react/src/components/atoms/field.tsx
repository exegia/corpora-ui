import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import type { IInputFieldProps, TInputFieldSize } from "./types";
import { Input } from "@/components/ui/input";

const inputFieldSizeClasses: TInputFieldSize = {
  label: {
    sm: "text-sm",
    default: "text-base",
    lg: "text-lg",
  },
  input: {
    sm: "w-64",
    default: "w-full",
    lg: "w-96"
  },
  description: {
    sm: "w-64",
    default: "w-full",
    lg: "w-96",
  },
  icon: {
    sm: "w-64",
    default: "w-full",
    lg: "w-96"
  },
};

export function InputField({ invalid, label, description, error, size = "default", ...props }: IInputFieldProps) {

  const renderDescription = () => {
    if (!description || !error) return
    if (error) return <FieldError match={Boolean(invalid)}>{error}</FieldError>
    return <FieldDescription className={inputFieldSizeClasses.description[size]}>{description}</FieldDescription>
  }

  return (
    <Field>
      <FieldLabel className={inputFieldSizeClasses.label[size]}>{label}</FieldLabel>
      <Input {...props} className={inputFieldSizeClasses.input[size]} />
      {renderDescription()}
    </Field>
  );
}
