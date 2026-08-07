import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });
(async () => {
  try {
    const endpointId = 'we_1U1fpO2EMRclhMGtJzhmPmU6';
    const updated = await stripe.webhookEndpoints.update(endpointId, {
      url: 'https://creatormarket-server-flax.vercel.app/api/payment/stripe/webhook',
      enabled_events: ['checkout.session.completed'],
    });
    console.log('Updated webhook endpoint:');
    console.log('id:', updated.id);
    console.log('url:', updated.url);
    console.log('status:', updated.status);
    console.log('events:', updated.enabled_events.join(', '));
    console.log('livemode:', updated.livemode);
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
})();
