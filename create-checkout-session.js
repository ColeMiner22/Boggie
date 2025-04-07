const stripe = require('stripe')(process.env.REACT_APP_STRIPE_SECRET_KEY);
const { db } = require('../../src/config/firebase');
const { doc, setDoc } = require('firebase/firestore');

exports.handler = async function(event, context) {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { planId, userId } = JSON.parse(event.body);

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

    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id }),
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create checkout session' }),
    };
  }
}; 