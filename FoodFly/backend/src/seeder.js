const Food = require('./models/Food');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const sampleFoods = [
  // Pizza
  {
    name: "LPU Margherita Pizza",
    title: "LPU Margherita Pizza",
    description: "Classic tomato sauce, fresh mozzarella, and extra virgin olive oil. A standard study group staple.",
    price: 249,
    rating: 4.8,
    category: "Pizza",
    isPopular: true,
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "BH9 Butter Chicken Pizza",
    title: "BH9 Butter Chicken Pizza",
    description: "Tandoori chicken pieces cooked in butter gravy, topped with mozzarella on fresh hand-tossed crust. Spicy & rich.",
    price: 299,
    rating: 4.9,
    category: "Pizza",
    isBHSnackSpecial: true,
    isPopular: true,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "UniMall Midnight Waffle & Pizza Combo",
    title: "UniMall Midnight Waffle & Pizza Combo",
    description: "One 7-inch personal veg pizza + one hot chocolate waffle. Save up to 30% during midnight prep.",
    price: 349,
    rating: 4.7,
    category: "Pizza",
    isHostelMidnightCombo: true,
    isStudentCombo: true,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80"
  },
  // Burgers
  {
    name: "Classic Student Cheeseburger",
    title: "Classic Student Cheeseburger",
    description: "Juicy flame-grilled patty, double cheddar cheese, lettuce, and special burger sauce. Very budget-friendly.",
    price: 179,
    rating: 4.6,
    category: "Burgers",
    isPopular: true,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "GH3 Diet Paneer Burger",
    title: "GH3 Diet Paneer Burger",
    description: "Grilled low-fat paneer patty, multigrain bun, fresh cucumbers, tomatoes, and hung-curd spread.",
    price: 199,
    rating: 4.7,
    category: "Burgers",
    isGHHealthyMeal: true,
    image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "BH7 Midnight Spicy Double Patty Burger",
    title: "BH7 Midnight Spicy Double Patty Burger",
    description: "Double crispy veg patty loaded with cheese, jalapenos, and direct hot chilli sauce. Ultimate late-night fuel.",
    price: 229,
    rating: 4.8,
    category: "Burgers",
    isBHSnackSpecial: true,
    isMidnightCravings: true,
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80"
  },
  // Salads
  {
    name: "GH2 Fruit & Nut Super Salad",
    title: "GH2 Fruit & Nut Super Salad",
    description: "Fresh apples, pomegranate seeds, walnuts, chia seeds, tossed in low-fat honey yogurt dressing.",
    price: 169,
    rating: 4.6,
    category: "Salads",
    isGHHealthyMeal: true,
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "LPU Central Library Caesar Salad",
    title: "LPU Central Library Caesar Salad",
    description: "Crisp lettuce, oven-baked croutons, and grated parmesan cheese. Healthy fuel for quiet research days.",
    price: 149,
    rating: 4.5,
    category: "Salads",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Sprouts Protein Bowl",
    title: "Sprouts Protein Bowl",
    description: "Mixed steamed sprouts, chopped onions, tomatoes, coriander, green chillies, and a squeeze of fresh lemon juice.",
    price: 129,
    rating: 4.4,
    category: "Salads",
    isGHHealthyMeal: true,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80"
  },
  // Noodles
  {
    name: "LPU Block 34 Spicy Schezwan Noodles",
    title: "LPU Block 34 Spicy Schezwan Noodles",
    description: "Wok-tossed noodles cooked in hot Schezwan sauce with bell peppers, carrots, and spring onions.",
    price: 189,
    rating: 4.7,
    category: "Noodles",
    isBHSnackSpecial: true,
    image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "BH5 Double Cheese Chicken Noodles",
    title: "BH5 Double Cheese Chicken Noodles",
    description: "Stir-fried noodles with spiced chicken chunks, topped with a double layer of melted cheddar cheese.",
    price: 219,
    rating: 4.8,
    category: "Noodles",
    isMidnightCravings: true,
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80"
  },
  // Ramen
  {
    name: "Library Silent Veg Ramen",
    title: "Library Silent Veg Ramen",
    description: "Clear vegetable broth, noodles, silken tofu, nori sheet, and baby corn. Perfectly silent meal for the study table.",
    price: 269,
    rating: 4.8,
    category: "Ramen",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Exam Night Hot & Sour Chicken Ramen",
    title: "Exam Night Hot & Sour Chicken Ramen",
    description: "Rich spicy broth, instant ramen noodles, chicken cubes, soft egg, chili oil, and crushed peanuts.",
    price: 299,
    rating: 4.9,
    category: "Ramen",
    isHostelMidnightCombo: true,
    isStudentCombo: true,
    image: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?auto=format&fit=crop&w=600&q=80"
  },
  // Desserts
  {
    name: "GH4 Midnight Fudge Brownie",
    title: "GH4 Midnight Fudge Brownie",
    description: "Warm, fudgy chocolate brownie topped with pure chocolate fudge syrup. Best ordered at 1 AM.",
    price: 129,
    rating: 4.9,
    category: "Desserts",
    isMidnightCravings: true,
    isPopular: true,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "UniMall Strawberry Waffle",
    title: "UniMall Strawberry Waffle",
    description: "Crispy freshly-baked waffle topped with whipped cream, fresh strawberries, and strawberry syrup.",
    price: 149,
    rating: 4.6,
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Central Library Red Velvet Jar",
    title: "Central Library Red Velvet Jar",
    description: "Layers of red velvet cake and cream cheese frosting in a student-friendly travel jar.",
    price: 159,
    rating: 4.8,
    category: "Desserts",
    isPopular: true,
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80"
  },
  // Drinks
  {
    name: "Iced Caramel Macchiato",
    title: "Iced Caramel Macchiato",
    description: "Double shot espresso, steamed milk, vanilla syrup, poured over ice, drizzled with sweet caramel.",
    price: 119,
    rating: 4.7,
    category: "Drinks",
    isPopular: true,
    image: "https://images.unsplash.com/photo-1595434061149-86575bc895fc?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Fresh Avocado Milkshake",
    title: "Fresh Avocado Milkshake",
    description: "Creamy healthy shake made with fresh avocado pulp, cold milk, and honey. Energizing booster.",
    price: 139,
    rating: 4.5,
    category: "Drinks",
    isGHHealthyMeal: true,
    image: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "BH1 Special Ginger Chai Combo",
    title: "BH1 Special Ginger Chai Combo",
    description: "Two cups of piping hot ginger-infused tea + two samosas. The ultimate campus group snack combo.",
    price: 79,
    rating: 4.9,
    category: "Drinks",
    isBHSnackSpecial: true,
    isStudentCombo: true,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80"
  },
  // Maggi
  {
    name: "BH3 Double Cheese Maggi",
    title: "BH3 Double Cheese Maggi",
    description: "LPU's most popular hostel dish: Instant Maggi noodles cooked with double processed cheese, green chillies, and hostel spices.",
    price: 89,
    rating: 4.9,
    category: "Maggi",
    isExamNightMaggi: true,
    isMidnightCravings: true,
    isPopular: true,
    image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "BH2 Butter Egg Maggi",
    title: "BH2 Butter Egg Maggi",
    description: "Two packs of Maggi cooked with a large dollop of butter and topped with two scrambled eggs. Late-night energy.",
    price: 99,
    rating: 4.8,
    category: "Maggi",
    isExamNightMaggi: true,
    isMidnightCravings: true,
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "GH5 Veggie Maggi Special",
    title: "GH5 Veggie Maggi Special",
    description: "Instant Maggi noodles cooked with finely chopped green peas, corn, carrots, and low oil. A lighter choice.",
    price: 79,
    rating: 4.7,
    category: "Maggi",
    isExamNightMaggi: true,
    isGHHealthyMeal: true,
    image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=600&q=80"
  }
];

const seedDatabase = async () => {
  try {
    const existingFoods = await Food.find({ name: { $in: sampleFoods.map(f => f.name) } });
    
    // Validate if prices and LPU student tags of existing foods match the current seeder
    const settingsMatch = existingFoods.every(ef => {
      const sf = sampleFoods.find(f => f.name === ef.name);
      return sf && 
             sf.price === ef.price &&
             !!sf.isMidnightCravings === !!ef.isMidnightCravings &&
             !!sf.isStudentCombo === !!ef.isStudentCombo &&
             !!sf.isPopular === !!ef.isPopular &&
             !!sf.isHostelMidnightCombo === !!ef.isHostelMidnightCombo &&
             !!sf.isBHSnackSpecial === !!ef.isBHSnackSpecial &&
             !!sf.isGHHealthyMeal === !!ef.isGHHealthyMeal &&
             !!sf.isExamNightMaggi === !!ef.isExamNightMaggi;
    });

    if (existingFoods.length < sampleFoods.length || !settingsMatch) {
      console.log(`Database has ${existingFoods.length}/${sampleFoods.length} sample foods, and settingsMatch=${settingsMatch}. Re-seeding database...`);
      
      const totalCount = await Food.countDocuments();
      console.log(`Clearing ${totalCount} existing foods to perform a clean seed...`);
      await Food.deleteMany({});

      // Find an existing seller, or create a default one
      let seller = await User.findOne({ role: 'seller' });
      if (!seller) {
        seller = await User.findOne({ role: 'admin' });
      }

      if (!seller) {
        console.log('No seller found in database. Creating default seller...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        seller = new User({
          name: 'Default Seller',
          email: 'seller@foodfly.com',
          password: hashedPassword,
          role: 'seller'
        });
        await seller.save();
        console.log('Default seller created:', seller.email);
      }

      // Prepare food items with the seller ID
      const foodsToSeed = sampleFoods.map(food => ({
        ...food,
        seller: seller._id
      }));

      await Food.insertMany(foodsToSeed);
      console.log(`Successfully seeded ${foodsToSeed.length} food items!`);
    } else {
      console.log(`Database already contains all ${sampleFoods.length} sample foods with correct prices and flags. Skipping seeding to prevent duplicate seeding.`);
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

module.exports = seedDatabase;
