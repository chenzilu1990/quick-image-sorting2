import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/api/:path*',
    '/_next/static/:path*',
  ],
};
