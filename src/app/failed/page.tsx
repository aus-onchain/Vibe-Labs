'use client';

import { useRouter } from 'next/navigation';

/**
 * Payment failed page
 */
export default function PaymentFailed() {
  const router = useRouter();

  return (
    <div className="shop">
      <main className="shop-main">
        <div className="payment-result-page">
          <div className="error-icon-large">✗</div>
          <h1 className="result-title">Payment Not Completed</h1>
          <p className="result-message">
            Your payment was not completed. No charges were made.
          </p>
          <p className="result-submessage">
            Your cart items are still saved. You can try again or contact support if you need assistance.
          </p>
          
          <button 
            className="btn-return-home"
            onClick={() => router.push('/')}
          >
            Return to Shop
          </button>
        </div>
      </main>
    </div>
  );
}

