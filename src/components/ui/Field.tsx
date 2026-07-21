import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";

interface FieldWrapperProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  hint?: string;
}

export function FieldWrapper({
  label,
  required,
  error,
  hint,
  children,
}: FieldWrapperProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink-700">
        {label}
        {required && <span className="ml-0.5 text-brand-500">*</span>}
      </span>
      {children}
      {hint && !error && <span className="text-xs text-ink-500">{hint}</span>}
      {error && <span className="text-xs text-danger-500">{error}</span>}
    </label>
  );
}

const baseInputClasses =
  "h-11 w-full rounded-xl border border-ink-100 bg-cream-50 px-3.5 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-300 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-200";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ className = "", error, ...props }: InputProps) {
  return (
    <input
      className={`${baseInputClasses} ${
        error ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20" : ""
      } ${className}`}
      {...props}
    />
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`min-h-24 w-full resize-none rounded-xl border border-ink-100 bg-cream-50 px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-300 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-200 ${className}`}
      {...props}
    />
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export function Select({ className = "", error, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={`${baseInputClasses} appearance-none pr-9 ${
          error ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20" : ""
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
    </div>
  );
}
