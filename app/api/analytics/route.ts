import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAnalyticsData } from "@/server/queries/analytics";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getAnalyticsData(session.user.id);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/analytics] GET error:", err);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
