import { atom, computed } from "nanostores";
import { DateTime } from "luxon";
import pino from "pino";

type LogEntry = {
  msg: string;
  level: number;
  time: string;
};

export const $logEntries = atom<LogEntry[]>([]);
export const $logs = computed($logEntries, (entries) =>
  entries.map(formatEntry)
);

function formatEntry({ msg, level, time }: LogEntry) {
  const parsedTs =
    typeof time === "string"
      ? DateTime.fromISO(time)
      : DateTime.fromMillis(time);
  const ts = parsedTs.toFormat("HH:mm:ss");
  const lvl = logger.levels.labels[level];
  return `[${ts}][${lvl}] > ${msg}`;
}

export const logger = pino({
  browser: {
    write: (logEntry) => {
      $logEntries.set([...$logEntries.get(), logEntry as LogEntry]);
    },
  },
  level: "debug",
});
