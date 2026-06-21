import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

const APK_FILENAME = "sparkride.apk";

export async function GET() {
  const externalUrl = process.env.NEXT_PUBLIC_APK_URL;

  if (externalUrl) {
    return NextResponse.redirect(externalUrl, 302);
  }

  const apkPath = path.join(process.cwd(), "public", "downloads", APK_FILENAME);

  try {
    const fileStat = await stat(apkPath);
    if (!fileStat.isFile()) {
      return NextResponse.json(
        { error: "APK not found", available: false },
        { status: 404 }
      );
    }

    const buffer = await readFile(apkPath);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.android.package-archive",
        "Content-Disposition": `attachment; filename="${APK_FILENAME}"`,
        "Content-Length": String(fileStat.size),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "APK not uploaded yet",
        available: false,
        hint: "Build the app with EAS and add public/downloads/sparkride.apk",
      },
      { status: 404 }
    );
  }
}

export async function HEAD() {
  const externalUrl = process.env.NEXT_PUBLIC_APK_URL;
  if (externalUrl) {
    return new NextResponse(null, { status: 200 });
  }

  const apkPath = path.join(process.cwd(), "public", "downloads", APK_FILENAME);
  try {
    const fileStat = await stat(apkPath);
    if (!fileStat.isFile()) {
      return new NextResponse(null, { status: 404 });
    }
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.android.package-archive",
        "Content-Length": String(fileStat.size),
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
