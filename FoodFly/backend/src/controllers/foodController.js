const Food = require('../models/Food');

// Get all foods
exports.getAllFood = async (req, res) => {
  try {
    const foods = await Food.find().populate('seller', 'name email');
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Add new food (Seller/Admin only)
exports.addFood = async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;
    
    const newFood = new Food({
      name,
      description,
      price,
      category,
      image,
      seller: req.user.id
    });

    const savedFood = await newFood.save();
    res.status(201).json(savedFood);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update food
exports.updateFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Check if user is the seller or admin
    if (food.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedFood = await Food.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedFood);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete food
exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    if (food.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: 'Food removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
