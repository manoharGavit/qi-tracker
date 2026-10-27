import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
	PORT: z.coerce.number().int().min(1).max(65535).default(4000),
	DB_PATH: z.string().trim().min(1).default("./data/app.db"),
	JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
	JWT_EXPIRES_IN: z
		.string()
		.regex(/^\d+(ms|s|m|h|d|w|y)?$/, "JWT_EXPIRES_IN must look like 8h, 30m or 3600")
		.default("8h"),
	CORS_ORIGIN: z
		.string()
		.default("http://localhost:5173")
		.transform((value) =>
			value
				.split(",")
				.map((origin) => origin.trim())
				.filter(Boolean)
		),
	LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info")
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
	const result = envSchema.safeParse(source);
	if (!result.success) {
		throw new Error(`Invalid environment configuration:\n${z.prettifyError(result.error)}`);
	}
	return result.data;
}
