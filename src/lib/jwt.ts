/**
 * JWT utility for Coinbase Developer Platform API authentication
 * Implements EdDSA (Ed25519) signing for API requests
 */

import { createHash } from 'crypto';

/**
 * Base64 URL encode a string or Uint8Array
 */
function base64UrlEncode(data: string | Uint8Array): string {
  let base64: string;
  
  if (typeof data === 'string') {
    base64 = Buffer.from(data, 'utf-8').toString('base64');
  } else {
    base64 = Buffer.from(data).toString('base64');
  }
  
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Generate JWT token for CDP API authentication
 */
export async function generateJWT(
  method: string,
  path: string,
  keyName: string,
  privateKeyBase64: string
): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000);
  
  // Create JWT header
  const header = {
    alg: 'EdDSA',
    typ: 'JWT',
    kid: keyName,
    nonce: timestamp.toString()
  };
  
  // Create URI for the request
  const uri = `${method} business.coinbase.com${path}`;
  
  // Create JWT payload
  const payload = {
    iss: 'coinbase-cloud',
    nbf: timestamp,
    exp: timestamp + 120,
    sub: keyName,
    uri: uri
  };
  
  // Encode header and payload
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const message = `${encodedHeader}.${encodedPayload}`;
  
  // Use @noble/ed25519 for EdDSA signing
  try {
    // Import the signing library
    const ed25519 = await import('@noble/ed25519');
    
    // Decode the private key from base64 (handle URL-safe base64)
    const standardBase64 = privateKeyBase64.replace(/-/g, '+').replace(/_/g, '/');
    const privateKeyBuffer = Buffer.from(standardBase64, 'base64');
    
    // Ed25519 private keys are 32 bytes
    const privateKey = privateKeyBuffer.length > 32 
      ? privateKeyBuffer.slice(0, 32) 
      : privateKeyBuffer;
    
    // Sign the message
    const messageBytes = new TextEncoder().encode(message);
    const signature = await ed25519.sign(messageBytes, privateKey);
    
    // Create final JWT
    const jwt = `${message}.${base64UrlEncode(new Uint8Array(signature))}`;
    
    return jwt;
  } catch (error) {
    console.error('Error generating JWT:', error);
    throw new Error('Failed to generate JWT token: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

