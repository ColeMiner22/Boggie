import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from 'react-firebase-hooks/auth';
import { auth } from '../../config/firebase';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || '');

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly Premium',
    price: 9.99,
    interval: 'month',
    features: [
      'Personalized product recommendations',
      'Unlimited dog profiles',
      'Priority customer support',
      'Ad-free experience',
      'Exclusive premium content',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly Premium',
    price: 99.99,
    interval: 'year',
    features: [
      'All monthly features',
      '2 months free',
      'Early access to new features',
      'Premium dog care guides',
      'Exclusive member community',
    ],
  },
];

const CheckoutForm: React.FC<{ plan: SubscriptionPlan }> = ({ plan }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [user] = useAuth(auth);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !user) {
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          userId: user.uid,
        }),
      });

      const session = await response.json();

      if (session.error) {
        setError(session.error);
        setProcessing(false);
        return;
      }

      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        setError(result.error.message || 'An error occurred');
        setProcessing(false);
      }
    } catch (err) {
      setError('An error occurred while processing your payment');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-md">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || processing}
        className="btn btn-primary w-full"
      >
        {processing ? 'Processing...' : `Subscribe for $${plan.price}/${plan.interval}`}
      </button>
    </form>
  );
};

const PremiumSubscription: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(subscriptionPlans[0]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8">Premium Subscription</h2>
      
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {subscriptionPlans.map((plan) => (
          <div
            key={plan.id}
            className={`card cursor-pointer transition-all duration-300 ${
              selectedPlan.id === plan.id
                ? 'ring-2 ring-primary-500'
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedPlan(plan)}
          >
            <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
            <div className="text-3xl font-bold text-primary-600 mb-4">
              ${plan.price}
              <span className="text-base font-normal text-gray-500">/{plan.interval}</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg
                    className="w-5 h-5 text-primary-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Complete Your Subscription</h3>
        <Elements stripe={stripePromise}>
          <CheckoutForm plan={selectedPlan} />
        </Elements>
      </div>
    </div>
  );
};

export default PremiumSubscription; 