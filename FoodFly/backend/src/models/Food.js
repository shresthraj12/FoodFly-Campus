const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String }, // To satisfy the "each food item should contain: title" requirement
  description: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, default: 4.5 },
  category: { type: String, required: true },
  image: { type: String, required: true },
  isMidnightCravings: { type: Boolean, default: false },
  isStudentCombo: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  isHostelMidnightCombo: { type: Boolean, default: false },
  isBHSnackSpecial: { type: Boolean, default: false },
  isGHHealthyMeal: { type: Boolean, default: false },
  isExamNightMaggi: { type: Boolean, default: false },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Food', foodSchema);
