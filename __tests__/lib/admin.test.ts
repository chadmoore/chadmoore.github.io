/**
 * Tests for src/lib/admin.ts — CV data read/write helpers.
 *
 * TDD: RED first. These test the server-side logic for the
 * admin interface that reads and writes cv.json.
 */
import { readCvData, writeCvData } from "../../src/lib/admin";
import fs from "fs";
import path from "path";

jest.mock("fs");

const CV_PATH = path.resolve(process.cwd(), "content/cv.json");

const sampleCv = {
  name: "Chad Moore",
  skills: {
    Frontend: [
      { name: "React", proficiency: "expert", preference: "preferred" },
    ],
  },
};

describe("readCvData", () => {
  it("reads and parses cv.json from the content directory", () => {
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(sampleCv));

    const data = readCvData();

    expect(fs.readFileSync).toHaveBeenCalledWith(CV_PATH, "utf-8");
    expect(data).toEqual(sampleCv);
  });

  it("throws if the file cannot be read", () => {
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error("ENOENT");
    });

    expect(() => readCvData()).toThrow("ENOENT");
  });
});

describe("writeCvData", () => {
  it("writes formatted JSON to cv.json", () => {
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});

    writeCvData(sampleCv);

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      CV_PATH,
      JSON.stringify(sampleCv, null, 2) + "\n",
      "utf-8"
    );
  });

  it("throws if the file cannot be written", () => {
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {
      throw new Error("EACCES");
    });

    expect(() => writeCvData(sampleCv)).toThrow("EACCES");
  });
});
