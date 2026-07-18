# Для фронтенд-разработчика

Что нужно знать, чтобы реализовать клиентскую часть приложения «Список
задач» на Nuxt/Vue. Соответствует обязательной и дополнительной части
[TASK.md](./TASK.md).

## Запуск backend локально

```bash
# из корня проекта
docker compose up -d --build
```

- API: `http://localhost/api`
- Swagger UI (рекомендуется смотреть сначала): `http://localhost/api/documentation`

## Авторизация

Bearer-токен. Поток:

1. `POST /api/auth/login` с `{email, password}` → `{token, user}`.
2. Сохранить `token` (localStorage / pinia / cookie на стороне клиента).
3. Дальше любой запрос к защищённому эндпойнту — с заголовком:
   ```
   Authorization: Bearer <token>
   ```
4. На `401` — очищать токен и редиректить на страницу входа.
5. `POST /api/auth/logout` — отзывать токен на сервере (требует
   `Authorization`).

**Аккаунты по умолчанию** (см. `DatabaseSeeder`):

| Email                | Пароль   | Роль  |
|---------------------|----------|-------|
| `admin@example.com` | `password` | admin |
| `user@example.com`  | `password` | user  |

## Роли

На бэке есть два типа пользователей: `is_admin == true` и `false`.
Поле приходит в ответе `GET /api/user` и в каждой задаче ресурса
(через `user_id`, но сам `is_admin` — в профиле).

Важно:
- **Обычный пользователь** видит **только свои** задачи (`GET /api/tasks`
  отдаёт только его `user_id`).
- **Админ** видит **все** задачи всех пользователей.

## Сущность «Задача»

```ts
interface Task {
  id: number
  user_id: number
  title: string                 // 3–255 символов
  description: string | null
  due_date: string | null       // 'YYYY-MM-DD'
  status: 'pending' | 'in_progress' | 'completed'
  created_at: string            // ISO 8601
  updated_at: string
  can_update: boolean           // фронтенд: показывать ли кнопку Edit
  can_delete: boolean           // фронтенд: показывать ли кнопку Delete
}
```

`can_update` и `can_delete` — это **явные подсказки** от бэка для
сокрытия UI-кнопок. Не нужно повторять логику `owner || admin` на
фронта — просто читай эти поля.

## Эндпойнты задач

### `GET /api/tasks`

Query-параметры (все опциональны):
- `status` — `pending` | `in_progress` | `completed`. Фильтр по точному
  значению.
- `search` — подстрока в `title`. **Реализуй debounce** (~300ms), как
  требует TASK.md.
- `sort` — `due_date` | `status` | `created_at`. По умолчанию
  `created_at`.
- `order` — `asc` | `desc`. По умолчанию `desc`.
- `page` — номер страницы.
- `per_page` — размер (по умолчанию 15).

Ответ (пагинированный, Laravel-default):
```json
{
  "data": [ /* Task[] */ ],
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." },
  "meta": {
    "current_page": 1,
    "from": 1,
    "to": 15,
    "last_page": 3,
    "per_page": 15,
    "total": 35
  }
}
```

**Синхронизация с URL**: TASK.md требует, чтобы состояние фильтров/сортировки/поиска
отражалось в query-параметрах URL. Используй `useRoute`/`useRouter` в Nuxt:
один источник правды — URL, а state — его проекция.

### `POST /api/tasks`

Body (все поля опциональны, кроме `title`):
```json
{
  "title": "Купить молоко",
  "description": "2 литра овсяного",
  "due_date": "2026-08-01",
  "status": "pending"
}
```

Возвращает `201` с `{data: Task}`.

Валидация (на бэке):
- `title` — обязательно, 3–255 символов.
- `description` — строка или null.
- `due_date` — дата сегодня или позже.
- `status` — enum.

На фронте стоит повторить эти правила для мгновенной обратной связи,
но бэк всё равно валидирует.

### `GET /api/tasks/{id}`, `PUT /api/tasks/{id}`, `DELETE /api/tasks/{id}`

- `GET` — `{data: Task}` или `403`/`404`.
- `PUT` — `{data: Task}` или `403`/`404`/`422`.
- `DELETE` — `204` или `403`/`404`.

Для `PUT` можно слать **любое подмножество полей** (правило `sometimes`
в `UpdateTaskRequest`):

```json
{ "status": "completed" }
```

## Формат ошибок

Все ошибки (кроме 500) в одном формате:

```json
{
  "message": "Краткое описание",
  "errors": {
    "field_name": ["Сообщение об ошибке"]
  }
}
```

- `401` — не авторизован. Очищай токен, редиректь на `/login`.
- `403` — доступ запрещён. Стоит показывать общее сообщение.
- `404` — не найдено. Стоит показывать либо «задача не найдена», либо
  редиректить на список.
- `422` — валидация. Читай `errors` и подсвечивай поля в форме.
- `500` — не ожидается в норме; лови и показывай «что-то пошло не так».

## Что требует TASK.md (обязательная + доп. часть)

Грубый чеклист, чтобы фронтенд закрывал требование:

**Обязательно:**
- [ ] Страница входа с email/password, обработкой ошибок.
- [ ] Хранение токена в localStorage/cookie.
- [ ] На `401` — редирект на `/login`.
- [ ] Список задач с сортировкой по дедлайну и статусу.
- [ ] Фильтрация по статусу.
- [ ] Форма добавления (title + description + due_date + status).
- [ ] Редактирование и удаление (модалка / отдельная форма / inline).
- [ ] Состояния загрузки, пустое состояние, ошибки API.
- [ ] Базовая клиентская валидация (title 3-255, корректная дата,
  валидный статус).

**Дополнительно ( Tasks.md explicitly asks ):**
- [ ] Роли admin/user: фронт показывает разный UI (админ видит все
  задачи, юзер — свои). Источник: `user.is_admin` из `/api/user`.
- [ ] Скрывать кнопки редактирования/удаления, если `can_update` /
  `can_delete` false.
- [ ] Поиск с debounce + синхронизация с query URL.
- [ ] Пагинация (используй `meta.last_page`, `meta.current_page`).
- [ ] Хотя бы несколько frontend-тестов для критичных сценариев.

## Рекомендации по стеку

- **Nuxt 3/4**, Composition API, `<script setup>`.
- Стор: `pinia` или `nuxt/store` через composables.
- HTTP: `$fetch`/`useFetch` ( встроенный в Nuxt ) или `axios` — что
  уже есть в фронта.
- Формы: `vee-validate` или нативная валидация в composables.
- Routing: `vue-router` (в Nuxt — файлы в `pages/`).
- Middleware route guard: `middleware/auth.ts`, который при отсутствии
  токена редиректит на `/login`.

## Пример composables

```ts
// composables/useApi.ts
export function useApi() {
  const token = useCookie('token')
  return {
    $api: $fetch.create({
      baseURL: 'http://localhost/api',
      headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
      onResponseError({ response }) {
        if (response.status === 401) {
          token.value = null
          navigateTo('/login')
        }
      },
    }),
  }
}
```

## OpenAPI-генерация типов (опционально)

В Swagger UI открой `http://localhost/api/documentation`, там же
есть ссылка на скачивание `api-docs.json` или `api-docs.yaml`. Можно
скормить его кодогенератору вроде `openapi-typescript` и получить
готовые TypeScript-типы для всех запросов/ответов.

## Что **не** делает backend (ответственность frontend)

- Клиентскую валидацию (кроме как дублирует серверную для UX).
- debounce-поиск.
- Скрытие UI-элементов по `can_*` — бэк только сообщает флаги.
- route guards — бэк только отвечает `401`/`403`.
- CSRF, cookie-сессии — не используются, потому что Bearer.

## Контакты

Если по контракту есть вопросы — смотри `README.md` backend'а или
тейкни Swagger UI. Лучше один раз посмотреть интерактивную докау, чем
читать этот файл.