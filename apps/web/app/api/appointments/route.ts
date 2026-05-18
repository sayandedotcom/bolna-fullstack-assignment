import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const response = await fetch(`${API_URL}/api/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Backend error", backend: "unreachable" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json(
      {
        error: "Backend unreachable. Is the FastAPI server running?",
        hint: "Run: cd apps/api && python -m uvicorn main:app --reload --port 8000",
      },
      { status: 503 }
    );
  }
}

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/api/appointments`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json(
      { error: "Backend unreachable" },
      { status: 503 }
    );
  }
}
