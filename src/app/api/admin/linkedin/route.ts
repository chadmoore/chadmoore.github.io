/**
 * LinkedIn Import API — POST /api/admin/linkedin
 *
 * Accepts a LinkedIn data export zip file (multipart/form-data, field "file"),
 * extracts the relevant CSVs, and returns a ContentData-shaped JSON object
 * that can be previewed in the admin UI before the user applies it.
 *
 * This route intentionally does NOT write to disk — it returns the parsed
 * result and lets the admin UI apply it via PUT /api/admin/content.
 *
 * Only works in development (next dev).
 * The CI pipeline removes src/app/api/ before static export.
 *
 * // If you're seeing this in production, something went very wrong.
 */
import { NextResponse } from "next/server";
import AdmZip from "adm-zip";
import { parseCSVText, buildContentFromLinkedIn } from "@/lib/linkedin";
import { readContentData } from "@/lib/admin";

/**
 * Find a zip entry by filename regardless of directory nesting.
 * LinkedIn puts files at the root or inside a single folder.
 */
function extractCSV(zip: AdmZip, filename: string): string {
  const entry = zip
    .getEntries()
    .find(
      (e) =>
        e.entryName === filename ||
        e.entryName.endsWith(`/${filename}`),
    );
  return entry ? zip.readAsText(entry) : "";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded. Send the zip as multipart/form-data with field name 'file'." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let zip: AdmZip;
    try {
      zip = new AdmZip(buffer);
    } catch {
      return NextResponse.json(
        { error: "Could not read the uploaded file as a ZIP archive." },
        { status: 400 },
      );
    }

    const profileText = extractCSV(zip, "Profile.csv");
    if (!profileText) {
      return NextResponse.json(
        {
          error:
            "Profile.csv not found in the ZIP. " +
            "Make sure you uploaded a LinkedIn data export (Settings → Data Privacy → Get a copy of your data).",
        },
        { status: 422 },
      );
    }

    const positionsText = extractCSV(zip, "Positions.csv");
    const educationText = extractCSV(zip, "Education.csv");
    const skillsText = extractCSV(zip, "Skills.csv");

    const profileRows = parseCSVText(profileText);
    if (profileRows.length === 0) {
      return NextResponse.json(
        { error: "Profile.csv appears to be empty or has only headers." },
        { status: 422 },
      );
    }

    const liData = {
      profile: profileRows[0],
      positions: parseCSVText(positionsText),
      education: parseCSVText(educationText),
      skills: parseCSVText(skillsText),
    };

    // Merge with existing content.json so non-CV sections are preserved.
    let existing;
    try {
      existing = readContentData();
    } catch {
      // No content.json yet — start from blank defaults.
    }

    const result = buildContentFromLinkedIn(liData, existing);

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while parsing the LinkedIn export.",
      },
      { status: 500 },
    );
  }
}
