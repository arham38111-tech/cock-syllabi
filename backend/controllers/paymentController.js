require('dotenv').config();
const stripeSecret = process.env.STRIPE_SECRET;
let stripe = null;
if (stripeSecret) {
  stripe = require('stripe')(stripeSecret);
}

exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;
    if (!stripe) return res.status(500).json({ message: 'Payment provider not configured. Set STRIPE_SECRET in env.' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata,
    });

    res.json({ clientSecret: paymentIntent.client_secret, id: paymentIntent.id });
  } catch (err) {
    next(err);
  }
};
