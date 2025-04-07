const stripe = require('stripe')(process.env.REACT_APP_STRIPE_SECRET_KEY);
const { db } = require('../../src/config/firebase');
const { doc, setDoc } = require('firebase/firestore');

exports.handler = async function(event, context) {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const sig = event.headers['stripe-signature'];
  const endpointSecret = process.env.REACT_APP_STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      endpointSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }

  // Handle the event
  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object;
        
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
        const subscription = stripeEvent.data.object;
        
        // Update the subscription status in Firestore
        await setDoc(doc(db, 'subscriptions', subscription.metadata.userId), {
          status: subscription.status,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        
        break;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Error handling webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook handler failed' }),
    };
  }
}; 