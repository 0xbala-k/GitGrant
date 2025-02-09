import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasClientId: !!process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
    hasClientSecret: !!process.env.GITHUB_CLIENT_SECRET,
    clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID?.substring(0, 4) + '...',
    redirectUri: process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI,
  });
}