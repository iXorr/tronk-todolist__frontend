<script setup lang="ts">
import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";
import type { LoginInput } from "~/utils/schemas";
import { loginSchema } from "~/utils/schemas";

definePageMeta({
  middleware: "guest"
});

const { login } = useAuth();
const { toastSuccess, toastError } = useToastNotification();

const form = useTemplateRef("form");

const state = reactive<LoginInput>({
  email: "",
  password: ""
});

const loading = ref(false);

async function onSubmit(event: FormSubmitEvent<LoginInput>) {
  loading.value = true;
  form.value?.clear();

  try {
    await login(event.data.email, event.data.password);
    toastSuccess("Добро пожаловать!");
    await navigateTo("/tasks");
  } catch (err: unknown) {
    const fetchErr = err as { statusCode?: number; data?: { message?: string; errors?: Record<string, string[]> } };

    if (fetchErr.statusCode === 422 && fetchErr.data?.errors) {
      form.value?.setErrors(
        Object.entries(fetchErr.data.errors).flatMap(([name, messages]) =>
          messages.map((message, index) => ({
            id: `${name}-${index}`,
            name,
            message
          }))
        )
      );
    } else {
      toastError(fetchErr.data?.message ?? "Ошибка входа. Проверьте данные.");
    }
  } finally {
    loading.value = false;
  }
}

function onError(event: FormErrorEvent) {
  console.log("Form validation errors:", event.errors);
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <h1 class="text-2xl font-bold text-center">
          Вход
        </h1>
      </template>

      <UForm
        ref="form"
        :schema="loginSchema"
        :state="state"
        class="flex flex-col gap-4"
        @submit="onSubmit"
        @error="onError"
      >
        <UFormField
          name="email"
          label="Email"
        >
          <UInput
            v-model="state.email"
            type="text"
            placeholder="your@email.com"
            icon="i-lucide-mail"
            :disabled="loading"
            autocomplete="email"
          />
        </UFormField>

        <UFormField
          name="password"
          label="Пароль"
        >
          <UInput
            v-model="state.password"
            type="password"
            placeholder="Пароль"
            icon="i-lucide-lock"
            :disabled="loading"
            autocomplete="current-password"
          />
        </UFormField>

        <UButton
          type="submit"
          block
          :loading="loading"
        >
          Войти
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>
