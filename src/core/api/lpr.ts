/** @see https://www.cups.org/doc/man-lpr.html */
/** @see https://www.cups.org/doc/options.html */

import { pageRangeRegex } from "../util/valid";

export type JobOptions = Partial<{
  "job-sheets":
    | "classified"
    | "confidential"
    | "secret"
    | "standard"
    | "topsecret"
    | "unclassified";
  media: "a4" | "letter" | "legal";
  "number-up": 2 | 4 | 6 | 9 | 16;
  "orientation-requested": 4 | 5 | 6;
  "print-quality": 3 | 4 | 5;
  sides: "one-sided" | "two-sided-long-edge" | "two-sided-short-edge";
  collate: boolean;
  "page-ranges": string;
}>;

export type LprOptions = Partial<{
  encryption: boolean;
  server: string;
  username: string;
  destination: string;
  copies: number;
  disableBanner: boolean;
  raw: boolean;
  emailOnCompletion: boolean;
  jobOptions: JobOptions;
  prettyPrint: boolean;
  holdJob: boolean;
  deleteAfterPrint: boolean;
  title: string;
}>;

export default function exec(filename: string, options: LprOptions): string {
  const cmdOptions: string[] = [];

  if (options.encryption) {
    cmdOptions.push("-E");
  }
  if (options.server) {
    cmdOptions.push(`-H ${options.server}`);
  }
  if (options.username) {
    cmdOptions.push(`-U ${options.username}`);
  }
  if (options.destination) {
    cmdOptions.push(`-P ${options.destination}`);
  }
  if (options.copies) {
    cmdOptions.push(`-# ${options.copies}`);
  }
  if (options.disableBanner) {
    cmdOptions.push("-h"); // -o job-sheets=none
  }
  if (options.raw) {
    cmdOptions.push("-l"); // -o raw
  }
  if (options.emailOnCompletion) {
    cmdOptions.push("-m");
  }
  if (options.jobOptions) {
    for (const [key, value] of Object.entries(options.jobOptions)) {
      if (key === "page-ranges" && !pageRangeRegex.test(value as string)) {
        /** @todo Need to notify invalid page range in some way */
        continue;
      }
      cmdOptions.push(`-o ${key}=${value}`);
    }
  }
  if (options.prettyPrint) {
    cmdOptions.push("-p"); // -o prettyprint
  }
  if (options.holdJob) {
    cmdOptions.push("-q");
  }
  if (options.deleteAfterPrint) {
    cmdOptions.push("-r");
  }
  if (options.title) {
    cmdOptions.push(`-T "${options.title}"`);
  }

  const command = `lpr ${cmdOptions.join(" ")} ${filename}`;
  return command;
}
