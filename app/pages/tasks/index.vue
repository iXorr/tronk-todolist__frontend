<script setup lang="ts">
definePageMeta({
  middleware: "auth"
});

const route = useRoute();
const router = useRouter();
const { user, isAdmin, logout } = useAuth();
const { fetchTasks } = useApi();
const { toastError } = useToastNotification();

const tasks = ref<Task[]>([]);
const lastPage = ref(1);
const total = ref(0);
const currentPage = ref(1);
const pending = ref(false);

const perPage = 15;

const statusLabel: Record<TaskStatus, string> = {
  pending: "Ожидает",
  in_progress: "В работе",
  completed: "Завершено"
};

const statusColor: Record<TaskStatus, "warning" | "info" | "success"> = {
  pending: "warning",
  in_progress: "info",
  completed: "success"
};

function readPageFromQuery(): number {
  const p = Number(route.query.page);
  return p > 0 ? p : 1;
}

async function loadTasks() {
  pending.value = true;

  try {
    const response = await fetchTasks({
      page: currentPage.value,
      per_page: perPage
    });
    tasks.value = response.data;
    total.value = response.meta.total;
    lastPage.value = response.meta.last_page;
  } catch (err: unknown) {
    toastError((err as { data?: { message?: string } })?.data?.message ?? "Ошибка загрузки задач");
  } finally {
    pending.value = false;
  }
}

function onPageChange(page: number) {
  router.push({ query: { ...route.query, page } });
}

watch(
  () => route.query.page,
  () => {
    currentPage.value = readPageFromQuery();
    loadTasks();
  },
  { immediate: true }
);

function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("ru-RU");
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div class="mx-auto px-4 py-3 flex items-center justify-between max-w-5xl">
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-semibold">
            {{ user?.email }}
          </h2>
          <UBadge
            v-if="isAdmin"
            label="Admin"
            color="info"
            variant="soft"
            size="sm"
          />
          <UBadge
            v-else
            label="User"
            color="neutral"
            variant="soft"
            size="sm"
          />
        </div>
        <UButton
          color="neutral"
          variant="ghost"
          @click="logout()"
        >
          Выйти
        </UButton>
      </div>
    </header>

    <!-- Content -->
    <main class="mx-auto px-4 py-6 max-w-5xl">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">
          Задачи
        </h1>
      </div>

      <!-- Loading -->
      <div
        v-if="pending"
        class="flex justify-center py-12"
      >
        <USkeleton class="w-full max-w-2xl h-48" />
      </div>

      <!-- Empty -->
      <div
        v-else-if="total === 0"
        class="text-center py-12"
      >
        <UIcon
          name="i-lucide-clipboard-list"
          class="text-6xl text-gray-300 dark:text-gray-700 mx-auto mb-4"
        />
        <p class="text-lg text-gray-500 dark:text-gray-400 mb-2">
          Список задач пуст
        </p>
        <p class="text-sm text-gray-400 dark:text-gray-500">
          Создайте первую задачу, чтобы начать
        </p>
      </div>

      <!-- Task list -->
      <div
        v-else
        class="space-y-3"
      >
        <UCard
          v-for="task in tasks"
          :key="task.id"
          variant="subtle"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <h3 class="font-medium text-gray-900 dark:text-gray-100">
                  {{ task.title }}
                </h3>
                <UBadge
                  :label="statusLabel[task.status]"
                  :color="statusColor[task.status]"
                  variant="soft"
                  size="sm"
                />
              </div>
              <p
                v-if="task.description"
                class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2"
              >
                {{ task.description }}
              </p>
              <p
                v-if="task.due_date"
                class="text-xs text-gray-400 dark:text-gray-500 mt-1"
              >
                Срок: {{ formatDate(task.due_date) }}
              </p>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <UButton
                v-if="task.can_update"
                icon="i-lucide-pencil"
                color="neutral"
                variant="ghost"
                size="sm"
                aria-label="Редактировать"
              />
              <UButton
                v-if="task.can_delete"
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="sm"
                aria-label="Удалить"
              />
            </div>
          </div>
        </UCard>

        <!-- Pagination -->
        <div
          v-if="lastPage > 1"
          class="flex justify-center pt-4"
        >
          <UPagination
            :page="currentPage"
            :total="total"
            :items-per-page="perPage"
            @update:page="onPageChange"
          />
        </div>
      </div>
    </main>
  </div>
</template>
