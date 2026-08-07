import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });
(async () => {
  try {
    const account = await stripe.accounts.retrieve();
    console.log('account id:', account.id);
    const webhooks = await stripe.webhookEndpoints.list({ limit: 50 });
    console.log('webhook count:', webhooks.data.length);
    webhooks.data.forEach((wh) => {
      console.log('---');
      console.log('id:', wh.id);
      console.log('url:', wh.url);
      console.log('status:', wh.status);
      console.log('api version:', wh.api_version);
      console.log('events:', wh.enabled_events.join(', '));
      console.log('livemode:', wh.livemode);
    });
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
})();
