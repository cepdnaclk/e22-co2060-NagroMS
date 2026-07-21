// ============================================================
// NagroMS — controllers/networkController.js
// ============================================================

const { db } = require('../config/firebase');

exports.toggleConnection = async (req, res) => {
  try {
    const { targetId, currentlyConnected } = req.body;
    const requesterId = req.user.uid;

    if (!targetId) {
      return res.status(400).json({ success: false, message: 'Missing targetId' });
    }

    // Deterministic ID (must match the frontend logic)
    const connId = requesterId < targetId ? `${requesterId}_${targetId}` : `${targetId}_${requesterId}`;
    const connRef = db.collection('connections').doc(connId);

    if (currentlyConnected) {
      // Unfollow
      await connRef.delete();
      return res.status(200).json({ success: true, status: 'disconnected' });
    }

    // Follow
    await connRef.set({
      requesterId,
      targetId,
      status: 'connected',
      createdAt: new Date()
    });

    return res.status(200).json({ success: true, status: 'connected' });
  } catch (error) {
    console.error('Toggle connection error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error toggling connection' });
  }
};

exports.getConnections = async (req, res) => {
  try {
    const uid = req.user.uid;
    const connectionsRef = db.collection('connections');
    
    // Fetch all connections where user is either requester or target
    const [snap1, snap2] = await Promise.all([
      connectionsRef.where('requesterId', '==', uid).get(),
      connectionsRef.where('targetId', '==', uid).get()
    ]);

    const connectionsMap = new Map();
    snap1.forEach(doc => connectionsMap.set(doc.id, { id: doc.id, ...doc.data() }));
    snap2.forEach(doc => connectionsMap.set(doc.id, { id: doc.id, ...doc.data() }));

    const connections = Array.from(connectionsMap.values());
    res.status(200).json({ success: true, connections });
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.getFarmerProductRequests = async (req, res) => {
  try {
    const farmerId = req.user.uid;
    console.log(`[getFarmerProductRequests] Fetching requests for farmer: ${farmerId}`);
    
    const requestsRef = db.collection('product_requests');
    const snapshot = await requestsRef.get();
    
    const allRequests = [];
    snapshot.forEach(doc => {
      allRequests.push({ id: doc.id, ...doc.data() });
    });
    console.log(`[getFarmerProductRequests] Total requests in DB: ${allRequests.length}`);

    const filteredRequests = allRequests.filter(req => {
      const isAll = req.targetFarmers === 'all';
      const inArray = Array.isArray(req.targetFarmers) && req.targetFarmers.includes(farmerId);
      if (isAll || inArray) {
        return true;
      }
      return false;
    });
    
    console.log(`[getFarmerProductRequests] Filtered requests for farmer: ${filteredRequests.length}`);

    filteredRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ success: true, requests: filteredRequests });
  } catch (error) {
    console.error('Error fetching farmer requests:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.respondToProductRequest = async (req, res) => {
  try {
    const { requestId, farmerName, status, message } = req.body;
    const farmerId = req.user.uid;

    if (!requestId || !status) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const requestRef = db.collection('product_requests').doc(requestId);
    const docSnap = await requestRef.get();
    
    if (!docSnap.exists) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const data = docSnap.data();
    const currentResponses = data.responses || {};
    
    currentResponses[farmerId] = {
      farmerName,
      status, // 'accepted' or 'declined'
      message: message || '',
      updatedAt: new Date().toISOString()
    };

    let overallStatus = 'pending';
    const responseList = Object.values(currentResponses);
    if (responseList.some(r => r.status === 'accepted')) {
      overallStatus = 'accepted';
    } else if (responseList.every(r => r.status === 'declined')) {
      overallStatus = 'declined';
    }

    await requestRef.update({
      responses: currentResponses,
      status: overallStatus,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({ success: true, message: 'Response saved successfully' });
  } catch (error) {
    console.error('Error responding to request:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.createCustomerProductRequest = async (req, res) => {
  try {
    const { productName, description, quantity, targetFarmers, targetFarmerNames, customerName } = req.body;
    const customerId = req.user.uid;

    if (!productName || !targetFarmers) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const requestData = {
      customerId,
      customerName: customerName || 'Unknown Customer',
      productName,
      description: description || '',
      quantity: quantity || '',
      targetFarmers,
      targetFarmerNames,
      status: 'pending',
      responses: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('product_requests').add(requestData);
    res.status(201).json({ success: true, requestId: docRef.id });
  } catch (error) {
    console.error('Error creating product request:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.getCustomerProductRequests = async (req, res) => {
  try {
    const customerId = req.user.uid;
    const requestsRef = db.collection('product_requests');
    const snapshot = await requestsRef.where('customerId', '==', customerId).get();
    
    const requests = [];
    snapshot.forEach(doc => {
      requests.push({ id: doc.id, ...doc.data() });
    });

    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching customer requests:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.saveCustomerOrder = async (req, res) => {
  try {
    const orderData = req.body;
    const customerId = req.user.uid;

    const newOrder = {
      ...orderData,
      customerId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('orders').add(newOrder);
    res.status(201).json({ success: true, orderId: docRef.id });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.user.uid;
    const ordersRef = db.collection('orders');
    const snapshot = await ordersRef.where('customerId', '==', customerId).get();
    
    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
