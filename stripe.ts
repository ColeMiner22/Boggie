import Stripe from 'stripe';
import { db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.REACT_APP_STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export const createCheckoutSession = async (req: any, res: any) => {
  const { planId, userId } = req.body;

  try {
    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: planId === 'monthly' 
            ? process.env.REACT_APP_STRIPE_MONTHLY_PRICE_ID 
            : process.env.REACT_APP_STRIPE_YEARLY_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.REACT_APP_BASE_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.REACT_APP_BASE_URL}/subscription`,
      client_reference_id: userId,
    });

    // Store the session ID in Firestore
    await setDoc(doc(db, 'checkout_sessions', session.id), {
      userId,
      planId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

export const handleWebhook = async (req: any, res: any) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.REACT_APP_STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      
      // Update the user's subscription status in Firestore
      await setDoc(doc(db, 'subscriptions', session.client_reference_id), {
        status: 'active',
        planId: session.metadata.planId,
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        createdAt: new Date().toISOString(),
      });
      
      break;
    }
    
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      
      // Update the subscription status in Firestore
      await setDoc(doc(db, 'subscriptions', subscription.metadata.userId), {
        status: subscription.status,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      
      break;
    }
  }

  res.json({ received: true });
}; 