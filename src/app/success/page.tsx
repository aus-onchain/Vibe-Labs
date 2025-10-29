'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Payment success page
 */
export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to home after 5 seconds
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="shop">
      <main className="shop-main">
        <div className="payment-result-page">
          <div className="success-icon-large">✓</div>
          <h1 className="result-title">Payment Successful!</h1>
          <p className="result-message">
            Thank you for your purchase. Your VibePay Monitor order has been confirmed.
          </p>
          <p className="result-submessage">
            You'll receive a confirmation email shortly with shipping details.
          </p>
          
          <button 
            className="btn-return-home"
            onClick={() => router.push('/')}
          >
            Return to Shop
          </button>

          <p className="auto-redirect-text">
            Redirecting in 5 seconds...
          </p>
        </div>
      </main>
    </div>
  );
}

