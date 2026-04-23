import { addNotification } from './NotificationCenter';

// Demo function to add sample notifications (for testing)
export function addDemoNotifications() {
  // Notification 1: Product Available
  addNotification({
    type: 'product_available',
    title: 'Requested Product Available! 🎉',
    message: 'Fresh Mangoes you requested is now available',
    product: {
      name: 'Fresh Mangoes',
      farmer: 'Perera Farm',
      location: 'Kandy',
      price: 200,
      unit: 'kg',
      emoji: '🥭'
    },
    actionUrl: '/products/123'
  });

  // Notification 2: Another product
  setTimeout(() => {
    addNotification({
      type: 'product_available',
      title: 'Product Now in Stock! 🌽',
      message: 'Organic Sweet Corn is available from Silva Farm',
      product: {
        name: 'Sweet Corn',
        farmer: 'Silva Farm',
        location: 'Matale',
        price: 120,
        unit: 'kg',
        emoji: '🌽'
      },
      actionUrl: '/products/456'
    });
  }, 1000);

  // Notification 3: Order update
  setTimeout(() => {
    addNotification({
      type: 'order_update',
      title: 'Order Shipped! 📦',
      message: 'Your order #1234 has been shipped and is on the way',
      actionUrl: '/orders/1234'
    });
  }, 2000);
}

// Function to simulate farmer adding requested product
export function simulateFarmerAddingProduct(productRequest) {
  addNotification({
    type: 'product_available',
    title: 'Your Request is Fulfilled! 🎉',
    message: `${productRequest.productName} is now available`,
    product: {
      name: productRequest.productName,
      farmer: 'Demo Farmer',
      location: 'Kandy',
      price: 150,
      unit: 'kg',
      emoji: '🌾'
    },
    actionUrl: '/products/new'
  });
}

// Example: Add notification when customer submits product request
export function onProductRequested(productName, description, quantity) {
  // Save to database/API here...
  
  // For demo, simulate farmer responding after 5 seconds
  setTimeout(() => {
    addNotification({
      type: 'product_available',
      title: 'Product Request Fulfilled! 🎉',
      message: `${productName} is now available from a local farmer`,
      product: {
        name: productName,
        farmer: 'Local Farm',
        location: 'Colombo',
        price: 180,
        unit: 'kg',
        emoji: '🌾'
      },
      actionUrl: '/products/browse'
    });
  }, 5000);
}
