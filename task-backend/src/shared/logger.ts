import { pino } from "pino";
import type { Logger, LevelWithSilent } from "pino";

export type { Logger };

export function createLogger(level: LevelWithSilent, pretty = false): Logger {
	return pino({
		level,
		...(pretty ? { transport: { target: "pino-pretty", options: { colorize: true } } } : {})
	});
}
