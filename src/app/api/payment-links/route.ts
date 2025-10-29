import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import crypto from 'crypto';

interface PaymentLinkData {
  amount: string;
  currency: string;
  network: string;
  description: string;
  expiresAt: string;
  metadata: Record<string, unknown>;
  successRedirectUrl?: string;
  failRedirectUrl?: string;
}

/**
 * Generate JWT using Coinbase's official method
 */
function generateCoinbaseJWT(
  keyName: string,
  keySecret: string,
  requestMethod: string,
  requestHost: string,
  requestPath: string
): string {
  const uri = `${requestMethod} ${requestHost}${requestPath}`;

  // Only replace literal \n if they exist (for local env files)
  // Vercel env vars might already have actual newlines
  const formattedKey = keySecret.includes('\\n') 
    ? keySecret.replace(/\\n/g, '\n')
    : keySecret;

  // @ts-expect-error - jsonwebtoken types don't support custom header properties but they work at runtime
  const token = sign(
    {
      iss: 'cdp',
      nbf: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 120,
      sub: keyName,
      uri,
    },
    formattedKey,
    {
      algorithm: 'ES256',
      header: {
        alg: 'ES256',
        kid: keyName,
        nonce: crypto.randomBytes(16).toString('hex'),
      },
    }
  );

  return token;
}

function generateUUIDv4(): string {
  return crypto.randomUUID();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency, network, description, metadata, successRedirectUrl, failRedirectUrl } = body;

    const keyName = process.env.CDP_API_KEY_NAME;
    const keySecret = process.env.CDP_API_KEY_PRIVATE_KEY;

    if (!keyName || !keySecret) {
      return NextResponse.json(
        { error: 'CDP API credentials not configured' },
        { status: 500 }
      );
    }

    const idempotencyKey = generateUUIDv4();
    const requestHost = 'business.coinbase.com';
    const requestPath = '/api/v1/payment-links';
    const url = `https://${requestHost}${requestPath}`;

    const token = generateCoinbaseJWT(
      keyName,
      keySecret,
      'POST',
      requestHost,
      requestPath
    );

    const paymentLinkData: PaymentLinkData = {
      amount: amount.toString(),
      currency: currency || 'USDC',
      network: network || 'base',
      description: description,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: metadata || {}
    };

    if (successRedirectUrl) {
      paymentLinkData.successRedirectUrl = successRedirectUrl;
    }
    if (failRedirectUrl) {
      paymentLinkData.failRedirectUrl = failRedirectUrl;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(paymentLinkData)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('CDP API error:', data);
      return NextResponse.json(
        { error: 'Failed to create payment link', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating payment link:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentLinkId = searchParams.get('id');

    if (!paymentLinkId) {
      return NextResponse.json(
        { error: 'Payment link ID required' },
        { status: 400 }
      );
    }

    const keyName = process.env.CDP_API_KEY_NAME;
    const keySecret = process.env.CDP_API_KEY_PRIVATE_KEY;

    if (!keyName || !keySecret) {
      return NextResponse.json(
        { error: 'CDP API credentials not configured' },
        { status: 500 }
      );
    }

    const requestHost = 'business.coinbase.com';
    const requestPath = `/api/v1/payment-links/${paymentLinkId}`;
    const url = `https://${requestHost}${requestPath}`;

    const token = generateCoinbaseJWT(
      keyName,
      keySecret,
      'GET',
      requestHost,
      requestPath
    );

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to get payment link', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting payment link:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
