import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "https://script.google.com/macros/s/AKfycbzB1FFxqvGXqDNbX80xfwmliSiQpRvr300yg8sK6uQMfrIQtbRwmZ5Re85QpsrRRWz-/exec";

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action") ?? "getPlayers";
  const res = await fetch(`${BASE_URL}?action=${action}`);
  const text = await res.text();
  try {
    return NextResponse.json(JSON.parse(text));
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const params = new URLSearchParams();
  body.forEach((v, k) => params.append(k, v.toString()));
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const text = await res.text();
  try {
    return NextResponse.json(JSON.parse(text));
  } catch {
    return NextResponse.json({ ok: true });
  }
}
