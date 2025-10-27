import { z } from 'zod';

export const AlertSchema = z.object({
    id: z.uuid(),
    subject: z.string().min(2).max(100),
    timestamp: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid ISO8601 date",
    }),
    severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    title: z.string().min(2).max(100),
    message: z.string().min(2).max(500),
    metadata: z.record(z.string(), z.any()),
});
export type Alert = z.infer<typeof AlertSchema>;