const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = async (req, res, next) => {
  try {
    const { userId, items, total, currency, paymentIntentId } = req.body;

    // basic stock check and decrement
    for (const it of items) {
      const prod = await Product.findById(it.product);
      if (!prod) return res.status(400).json({ message: 'Product not found' });
      if (prod.stock < it.quantity) return res.status(400).json({ message: `Insufficient stock for ${prod.title}` });
    }

    // decrement stock
    for (const it of items) {
      await Product.findByIdAndUpdate(it.product, { $inc: { stock: -it.quantity } });
    }

    const order = await Order.create({ user: userId, products: items, total, currency, paymentIntentId, status: paymentIntentId ? 'paid' : 'pending' });
    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ order });
  } catch (err) {
    next(err);
  }
};
