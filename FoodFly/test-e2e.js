// FoodFly DevOps E2E Verification Script
// This script runs on Node 20 and tests the full user and order flows via Nginx reverse proxy.

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080/api';

async function runTests() {
  console.log(`🚀 Starting End-to-End DevOps Verification for FoodFly at ${BASE_URL}...`);
  
  const timestamp = Date.now();
  const customerEmail = `customer_${timestamp}@test.com`;
  const sellerEmail = `seller_${timestamp}@test.com`;
  const password = 'testpassword123';
  
  let customerToken = '';
  let sellerToken = '';
  let testFoodId = '';
  
  try {
    // ----------------------------------------------------
    // TEST 1: Register Customer & Seller
    // ----------------------------------------------------
    console.log('\n--- Test 1: User Registration ---');
    
    // Register customer
    const resRegCust = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Customer',
        email: customerEmail,
        password: password,
        role: 'customer'
      })
    });
    const regCustData = await resRegCust.json();
    if (resRegCust.status === 201) {
      console.log(`✅ Customer registered successfully: ${customerEmail}`);
    } else {
      throw new Error(`❌ Customer registration failed: ${JSON.stringify(regCustData)}`);
    }

    // Register seller
    const resRegSel = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Seller',
        email: sellerEmail,
        password: password,
        role: 'seller'
      })
    });
    const regSelData = await resRegSel.json();
    if (resRegSel.status === 201) {
      console.log(`✅ Seller registered successfully: ${sellerEmail}`);
    } else {
      throw new Error(`❌ Seller registration failed: ${JSON.stringify(regSelData)}`);
    }

    // ----------------------------------------------------
    // TEST 2: User Login
    // ----------------------------------------------------
    console.log('\n--- Test 2: User Login ---');
    
    // Login customer
    const resLogCust = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: customerEmail, password: password })
    });
    const logCustData = await resLogCust.json();
    if (resLogCust.status === 200) {
      customerToken = logCustData.token;
      console.log('✅ Customer logged in successfully.');
    } else {
      throw new Error(`❌ Customer login failed: ${JSON.stringify(logCustData)}`);
    }

    // Login seller
    const resLogSel = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: sellerEmail, password: password })
    });
    const logSelData = await resLogSel.json();
    if (resLogSel.status === 200) {
      sellerToken = logSelData.token;
      console.log('✅ Seller logged in successfully.');
    } else {
      throw new Error(`❌ Seller login failed: ${JSON.stringify(logSelData)}`);
    }

    // ----------------------------------------------------
    // TEST 3: Add Food Menu Item (Seller Only)
    // ----------------------------------------------------
    console.log('\n--- Test 3: Add Food Item ---');
    
    const resAddFood = await fetch(`${BASE_URL}/food`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        name: 'DevOps Delicious Pizza',
        description: 'Baked inside a Docker container with extra hot prometheus metrics.',
        price: 249,
        category: 'Pizza',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591'
      })
    });
    const addFoodData = await resAddFood.json();
    if (resAddFood.status === 201) {
      testFoodId = addFoodData._id;
      console.log(`✅ Food item added successfully. ID: ${testFoodId}`);
    } else {
      throw new Error(`❌ Adding food item failed: ${JSON.stringify(addFoodData)}`);
    }

    // ----------------------------------------------------
    // TEST 4: Fetch Food Menu
    // ----------------------------------------------------
    console.log('\n--- Test 4: Fetch Food Menu ---');
    
    const resGetFood = await fetch(`${BASE_URL}/food`);
    const getFoodData = await resGetFood.json();
    if (resGetFood.status === 200) {
      console.log(`✅ Menu fetched successfully. Menu items count: ${getFoodData.length}`);
      const found = getFoodData.some(item => item._id === testFoodId);
      if (found) {
        console.log('✅ Newly added food item is present in the public menu.');
      } else {
        throw new Error('❌ Newly added food item NOT found in public menu!');
      }
    } else {
      throw new Error(`❌ Fetching menu failed: ${JSON.stringify(getFoodData)}`);
    }

    // ----------------------------------------------------
    // TEST 5: Place an Order (Customer)
    // ----------------------------------------------------
    console.log('\n--- Test 5: Place Order ---');
    
    const resPlaceOrder = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        items: [
          {
            food: testFoodId,
            quantity: 2,
            price: 249
          }
        ],
        totalAmount: 498,
        deliveryAddress: 'Container 4, Docker Network Bridge, FoodFly City'
      })
    });
    const orderData = await resPlaceOrder.json();
    if (resPlaceOrder.status === 201) {
      console.log(`✅ Order placed successfully. Order ID: ${orderData._id}`);
    } else {
      throw new Error(`❌ Placing order failed: ${JSON.stringify(orderData)}`);
    }

    // ----------------------------------------------------
    // TEST 6: Get User Orders
    // ----------------------------------------------------
    console.log('\n--- Test 6: Retrieve User Orders ---');
    
    const resGetOrders = await fetch(`${BASE_URL}/orders/myorders`, {
      headers: {
        'Authorization': `Bearer ${customerToken}`
      }
    });
    const getOrdersData = await resGetOrders.json();
    if (resGetOrders.status === 200) {
      console.log(`✅ Customer orders retrieved. Orders count: ${getOrdersData.length}`);
      const foundOrder = getOrdersData.some(order => order._id === orderData._id);
      if (foundOrder) {
        console.log('✅ Placed order successfully matched in history list.');
      } else {
        throw new Error('❌ Placed order NOT found in history list!');
      }
    } else {
      throw new Error(`❌ Retrieving orders failed: ${JSON.stringify(getOrdersData)}`);
    }

    console.log('\n🏆 E2E DEVOPS VERIFICATION COMPLETED: ALL TESTS PASSED SUCCESSFULLY! 🎉');
    process.exit(0);

  } catch (error) {
    console.error(`\n❌ Verification script failed: ${error.message}`);
    process.exit(1);
  }
}

runTests();
