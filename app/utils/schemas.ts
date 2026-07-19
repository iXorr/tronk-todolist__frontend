import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email обязателен").email("Некорректный формат email"),
  password: z.string().min(1, "Пароль обязателен")
});

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Формат ГГГГ-ММ-ДД")
  .refine(
    (val) => {
      if (!val) return true;
      return new Date(val + "T00:00:00") >= new Date(new Date().toDateString());
    },
    { message: "Дата не может быть раньше сегодня" }
  );

export const taskCreateSchema = z.object({
  title: z.string().min(3, "Минимум 3 символа").max(255, "Максимум 255 символов"),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
  description: z.string().nullable().optional(),
  due_date: dateString.nullable().optional()
});

export const taskUpdateSchema = taskCreateSchema.partial();

export type LoginInput = z.infer<typeof loginSchema>;
export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
