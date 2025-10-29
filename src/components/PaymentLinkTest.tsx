"use client";

import { useState } from "react";

interface PaymentLinkResponse {
  success: boolean;
  paymentLink?: {
    id: string;
    hosted_url?: string;
    url?: string;
  };
  error?: string;
}

export default function PaymentLinkTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaymentLinkResponse | null>(null);
  const [formData, setFormData] = useState({
    name: "Test Payment Link",
    description: "Testing Coinbase Business API integration",
    pricing_type: "fixed_price" as const,
    amount: "10.00",
    currency: "USD",
    redirect_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/payment-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, paymentLink: data });
      } else {
        setResult({ success: false, error: data.error || "Failed to create payment link" });
      }
    } catch (error) {
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : "An error occurred" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Payment Link Test</h2>
      
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Amount (USD)</label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Payment Link"}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '2rem', width: '100%' }}>
          {result.success && result.paymentLink ? (
            <div>
              <p>✓ Payment link created!</p>
              <a 
                href={result.paymentLink.hosted_url || result.paymentLink.url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Open Payment Link
              </a>
            </div>
          ) : (
            <p>✗ Error: {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
