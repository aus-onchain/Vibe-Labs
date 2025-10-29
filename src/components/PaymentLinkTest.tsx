"use client";

import { useState } from "react";

interface PaymentLinkResponse {
  success: boolean;
  paymentLink?: any;
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
    cancel_url: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const requestBody = {
        name: formData.name,
        description: formData.description,
        pricing_type: formData.pricing_type,
        ...(formData.pricing_type === "fixed_price" && {
          local_amount: {
            amount: formData.amount,
            currency: formData.currency
          }
        }),
        ...(formData.redirect_url && { redirect_url: formData.redirect_url }),
        ...(formData.cancel_url && { cancel_url: formData.cancel_url })
      };

      const response = await fetch("/api/payment-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      setResult(data);

    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setLoading(false);
    }
  };

  const testEndpoint = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/payment-links", {
        method: "GET",
      });
      const data = await response.json();
      setResult({ success: true, paymentLink: data });
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Coinbase Business API Test
        </h2>

        {/* Test Endpoint Button */}
        <div className="mb-6">
          <button
            onClick={testEndpoint}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test Endpoint (GET)"}
          </button>
        </div>

        {/* Payment Link Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment Link Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Pricing Type *
            </label>
            <select
              value={formData.pricing_type}
              onChange={(e) => setFormData({
                ...formData,
                pricing_type: e.target.value as "fixed_price" | "no_price"
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
            >
              <option value="fixed_price">Fixed Price</option>
              <option value="no_price">No Price</option>
            </select>
          </div>

          {formData.pricing_type === "fixed_price" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Currency *
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Redirect URL (optional)
            </label>
            <input
              type="url"
              value={formData.redirect_url}
              onChange={(e) => setFormData({ ...formData, redirect_url: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              placeholder="https://yoursite.com/success"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cancel URL (optional)
            </label>
            <input
              type="url"
              value={formData.cancel_url}
              onChange={(e) => setFormData({ ...formData, cancel_url: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              placeholder="https://yoursite.com/cancel"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Payment Link..." : "Create Payment Link"}
          </button>
        </form>

        {/* Results Display */}
        {result && (
          <div className="mt-6 p-4 rounded-md bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">
              {result.success ? "✅ Success" : "❌ Error"}
            </h3>
            <pre className="text-sm overflow-x-auto bg-gray-100 p-3 rounded text-gray-800">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* API Information */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          ⚠️ Setup Required
        </h3>
        <p className="text-yellow-700 text-sm">
          To use this API, you need to add your Coinbase Business API key to your environment variables:
        </p>
        <code className="block mt-2 p-2 bg-yellow-100 rounded text-sm">
          COINBASE_BUSINESS_API_KEY=your_api_key_here
        </code>
        <p className="text-yellow-700 text-sm mt-2">
          Add this to your <code>.env.local</code> file.
        </p>
      </div>
    </div>
  );
}