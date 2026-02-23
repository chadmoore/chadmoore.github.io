/**
 * Admin helpers — read and write cv.json from disk.
 *
 * Server-side only (used by Route Handlers). These functions
 * give the admin API a clean interface to the CV data without
 * scattering fs calls around the codebase.
 *
 * // Note to future self: this file touches the filesystem.
 * // Don't import it from client components or you'll have a bad time.
 */
import fs from "fs";
import path from "path";

const CV_PATH = path.resolve(process.cwd(), "content/cv.json");

/** Read and parse cv.json. Throws if the file is missing or corrupt. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function readCvData(): Record<string, any> {
  const raw = fs.readFileSync(CV_PATH, "utf-8");
  return JSON.parse(raw);
}

/** Write data back to cv.json with pretty-printing. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function writeCvData(data: Record<string, any>): void {
  fs.writeFileSync(CV_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
}
