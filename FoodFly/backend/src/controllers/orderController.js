const Order = require('../models/Order');

// Place new order
exports.placeOrder = async (req, res) => {
  try {
    const { items, totalAmount, deliveryAddress, paymentMethod, paymentStatus } = req.body;

    const newOrder = new Order({
      customer: req.user.id,
      items,
      totalAmount,
      deliveryAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      paymentStatus: paymentStatus || 'Pending'
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id }).populate('items.food');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all orders (Admin/Seller)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email')
      .populate('items.food');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
