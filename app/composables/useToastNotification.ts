export function useToastNotification() {
  const toast = useToast();

  function toastSuccess(title: string, description?: string) {
    toast.add({
      title,
      description,
      icon: "i-lucide-circle-check",
      color: "success",
      duration: 5000
    });
  }

  function toastError(title: string, description?: string) {
    toast.add({
      title,
      description,
      icon: "i-lucide-circle-x",
      color: "error",
      duration: 7000
    });
  }

  function toastValidationErrors(errors: Record<string, string[]>) {
    const messages = Object.entries(errors)
      .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
      .join("\n");

    toast.add({
      title: "Ошибка валидации",
      description: messages,
      icon: "i-lucide-triangle-alert",
      color: "warning",
      duration: 7000
    });
  }

  return {
    toastSuccess,
    toastError,
    toastValidationErrors
  };
}
