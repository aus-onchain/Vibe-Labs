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
  const formattedKey = keySecret.replace(/\\n/g, '\n');

  console.log('[JWT] Generating token for:', uri);
  console.log('[JWT] Key name:', keyName);
  console.log('[JWT] Key format check - starts with BEGIN:', formattedKey.startsWith('-----BEGIN'));
  console.log('[JWT] Key format check - contains newlines:', formattedKey.includes('\n'));

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

  console.log('[JWT] Token generated successfully, length:', token.length);
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

    console.log('[API] Environment check - Key name set:', !!keyName);
    console.log('[API] Environment check - Key secret set:', !!keySecret);
    console.log('[API] Environment check - Key secret length:', keySecret?.length);

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

    console.log('[API] Creating payment link for amount:', amount);

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

    console.log('[API] Sending request to Coinbase...');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(paymentLinkData)
    });

    console.log('[API] Coinbase response status:', response.status);
    console.log('[API] Coinbase response content-type:', response.headers.get('content-type'));

    // Get response as text first to handle non-JSON responses
    const responseText = await response.text();
    console.log('[API] Response body preview:', responseText.substring(0, 300));

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[API] Failed to parse response as JSON');
      console.error('[API] Full response:', responseText);
      return NextResponse.json(
        { 
          error: 'Invalid API response', 
          status: response.status,
          contentType: response.headers.get('content-type'),
          preview: responseText.substring(0, 500)
        },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error('[API] CDP API error:', data);
      return NextResponse.json(
        { error: 'Failed to create payment link', details: data },
        { status: response.status }
      );
    }

    console.log('[API] Payment link created successfully');
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Error creating payment link:', error);
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

    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[API] Failed to parse GET response as JSON:', responseText);
      return NextResponse.json(
        { error: 'Invalid API response', preview: responseText.substring(0, 500) },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to get payment link', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Error getting payment link:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
