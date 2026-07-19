export function useFormRef() {
  return ref<{ setErrors: (errors: { name?: string; message: string }[]) => void } | null>(null);
}
