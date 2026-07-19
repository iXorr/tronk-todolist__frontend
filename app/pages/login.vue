<script setup lang="ts">
import type { LoginInput } from "~/utils/schemas";
import { loginSchema } from "~/utils/schemas";

definePageMeta({
  middleware: "guest"
});

const { login } = useAuth();
const { toastError } = useToastNotification();

const formRef = useFormRef();

const state = reactive<LoginInput>({
  email: "",
  password: ""
});

async function onSubmit({ data }: { data: LoginInput }) {
  try {
    await login(data.email, data.password);
    await navigateTo("/tasks");
  } catch (err: unknown) {
    const fetchErr = err as { statusCode?: number; data?: { message?: string; errors?: Record<string, string[]> } };

    if (fetchErr.statusCode === 422 && fetchErr.data?.errors) {
      const formErrors = Object.entries(fetchErr.data.errors).flatMap(([name, messages]) =>
        messages.map(message => ({ name, message }))
      );
      formRef.value?.setErrors(formErrors);
    } else {
      toastError(fetchErr.data?.message ?? "Ошибка входа. Проверьте данные.");
    }
  }
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
        ref="formRef"
        :schema="loginSchema"
        :state="state"
        class="flex flex-col gap-4"
        @submit="onSubmit"
      >
        <UFormField
          name="email"
          label="Email"
        >
          <UInput
            v-model="state.email"
            type="text"
            placeholder="Email"
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
          />
        </UFormField>

        <UButton
          type="submit"
          block
        >
          Войти
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>
