import type { FormError } from "@nuxt/ui";

export function useFormRef() {
  return ref<{ setErrors: (errors: FormError[], name?: string) => void; clear: () => void } | null>(null);
}
