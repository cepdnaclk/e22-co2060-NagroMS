// ============================================================
// NagroMS — controllers/farmerController.js
// ============================================================

const productModel = require('../models/productModel');
const userModel = require('../models/userModel');
const orderModel = require('../models/orderModel');
const saleModel = require('../models/saleModel');
const equipmentModel = require('../models/equipmentModel');
const inventoryModel = require('../models/inventoryModel');
const loanModel = require('../models/loanModel');
const expenseModel = require('../models/expenseModel');

/**
 * Get Farmer Profile
 */
exports.getFarmerProfile = async (req, res) => {
  try {
    const farmer = await userModel.getUserById(req.user.uid);
    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }
    res.status(200).json({ success: true, data: farmer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update Farmer Profile (NIC, Location, etc.)
 */
exports.updateFarmerProfile = async (req, res) => {
  try {
    const updates = {
      nic: req.body.nic,
      district: req.body.district || req.body.location,
      phone: req.body.phone,
      fullName: req.body.fullName,
      farmSize: req.body.farmSize,
    };
    const updatedUser = await userModel.updateUser(req.user.uid, updates);
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Products
 */
exports.getProducts = async (req, res) => {
  try {
    const products = await productModel.getProductsByFarmer(req.user.uid);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create Product
 */
exports.addProduct = async (req, res) => {
  try {
    const { name, price, quantity } = req.body;

    // ── Input validation ──────────────────────────────────────
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Product name is required.' });
    }
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ success: false, message: 'A valid price is required.' });
    }
    if (quantity === undefined || quantity === null || isNaN(Number(quantity)) || Number(quantity) < 0) {
      return res.status(400).json({ success: false, message: 'A valid quantity is required.' });
    }

    const user = await userModel.getUserById(req.user.uid);

    const productData = {
      ...req.body,
      name: name.trim(),
      farmerId: req.user.uid,
      farmer: user?.fullName || 'Farmer',
      location: user?.district || '',
      district: user?.district || '',
      farmerPhone: user?.phone || '',
    };
    const newProduct = await productModel.createProduct(productData);
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error('addProduct error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update Product
 */
exports.updateProduct = async (req, res) => {
  try {
    // Ownership check — farmer can only edit their own products
    const existing = await productModel.getProductById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    if (existing.farmerId !== req.user.uid) {
      return res.status(403).json({ success: false, message: 'Not authorised to edit this product.' });
    }
    const updatedProduct = await productModel.updateProduct(req.params.id, req.body);
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error('updateProduct error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete Product
 */
exports.deleteProduct = async (req, res) => {
  try {
    // Ownership check — farmer can only delete their own products
    const existing = await productModel.getProductById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    if (existing.farmerId !== req.user.uid) {
      return res.status(403).json({ success: false, message: 'Not authorised to delete this product.' });
    }
    await productModel.deleteProduct(req.params.id);
    res.status(200).json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('deleteProduct error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Orders
 */
exports.getOrders = async (req, res) => {
  try {
    const orders = await orderModel.getOrdersByFarmer(req.user.uid);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update Order Status
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    const farmerId = req.user.uid;

    const orderData = await orderModel.updateOrderStatus(orderId, status, farmerId);
    
    // Create notification for customer
    if (orderData && orderData.customerId) {
      const notificationModel = require('../models/notificationModel');
      await notificationModel.createNotification({
        userId: orderData.customerId,
        title: "Order status updated",
        message: `Your order has been ${status}`,
        type: "order"
      });
    }

    res.status(200).json({ success: true, message: 'Order status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Sales
 */
exports.getSales = async (req, res) => {
  try {
    const sales = await saleModel.getSalesByFarmer(req.user.uid);
    res.status(200).json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ── Equipment Methods ────────────────────────────────────────

exports.getEquipment = async (req, res) => {
  try {
    const equipment = await equipmentModel.getEquipmentByFarmerId(req.user.uid);
    res.status(200).json({ success: true, data: equipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addEquipment = async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Name and price are required.' });
    }
    const data = { ...req.body, farmerId: req.user.uid };
    const newEquipment = await equipmentModel.createEquipment(data);
    res.status(201).json({ success: true, data: newEquipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEquipment = async (req, res) => {
  try {
    const existing = await equipmentModel.getEquipmentById(req.params.id);
    if (!existing || existing.farmerId !== req.user.uid) {
      return res.status(403).json({ success: false, message: 'Not authorised.' });
    }
    const updated = await equipmentModel.updateEquipment(req.params.id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteEquipment = async (req, res) => {
  try {
    const existing = await equipmentModel.getEquipmentById(req.params.id);
    if (!existing || existing.farmerId !== req.user.uid) {
      return res.status(403).json({ success: false, message: 'Not authorised.' });
    }
    await equipmentModel.deleteEquipment(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Inventory Methods ────────────────────────────────────────

exports.getInventory = async (req, res) => {
  try {
    const inventory = await inventoryModel.getInventoryByFarmerId(req.user.uid);
    res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addInventory = async (req, res) => {
  try {
    const { resource, amount } = req.body;
    if (!resource || !amount) {
      return res.status(400).json({ success: false, message: 'Resource and amount are required.' });
    }
    const data = { ...req.body, farmerId: req.user.uid };
    const newInventory = await inventoryModel.createInventory(data);
    res.status(201).json({ success: true, data: newInventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const existing = await inventoryModel.getInventoryById(req.params.id);
    if (!existing || existing.farmerId !== req.user.uid) {
      return res.status(403).json({ success: false, message: 'Not authorised.' });
    }
    const updated = await inventoryModel.updateInventory(req.params.id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteInventory = async (req, res) => {
  try {
    const existing = await inventoryModel.getInventoryById(req.params.id);
    if (!existing || existing.farmerId !== req.user.uid) {
      return res.status(403).json({ success: false, message: 'Not authorised.' });
    }
    await inventoryModel.deleteInventory(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Loan Methods ─────────────────────────────────────────────

exports.getLoans = async (req, res) => {
  try {
    const loans = await loanModel.getLoansByFarmer(req.user.uid);
    res.status(200).json({ success: true, data: loans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addLoan = async (req, res) => {
  try {
    const loan = await loanModel.createLoan({ ...req.body, farmerId: req.user.uid });
    res.status(201).json({ success: true, data: loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Expense Methods ──────────────────────────────────────────

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await expenseModel.getExpensesByFarmer(req.user.uid);
    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addExpense = async (req, res) => {
  try {
    const expense = await expenseModel.createExpense({ ...req.body, farmerId: req.user.uid });
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Income Methods ──────────────────────────────────────────

const incomeModel = require('../models/incomeModel');

exports.getIncome = async (req, res) => {
  try {
    const income = await incomeModel.getIncomeByFarmer(req.user.uid);
    res.status(200).json({ success: true, data: income });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addIncome = async (req, res) => {
  try {
    const income = await incomeModel.createIncome({ ...req.body, farmerId: req.user.uid });
    res.status(201).json({ success: true, data: income });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Updates Methods ──────────────────────────────────────────

const updateModel = require('../models/farmerUpdateModel');
const subscriptionModel = require('../models/subscriptionModel');
const notificationModel = require('../models/notificationModel');

exports.addUpdate = async (req, res) => {
  try {
    const update = await updateModel.createUpdate({ ...req.body, farmerId: req.user.uid });
    
    // Notify subscribers
    const subscriptions = await subscriptionModel.getSubscriptionsByFarmer(req.user.uid);
    for (const sub of subscriptions) {
      await notificationModel.createNotification({
        userId: sub.customerId,
        title: "New Update from Farmer",
        message: req.body.title || "A farmer you follow has posted an update.",
        type: "update"
      });
    }
    
    res.status(201).json({ success: true, data: update });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Consultations Methods ────────────────────────────────────

const consultationModel = require('../models/consultationModel');

exports.getExperts = async (req, res) => {
  try {
    const { db } = require('../config/firebase');
    const snapshot = await db.collection('users').where('role', '==', 'expert').where('available', '==', true).get();
    const experts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ success: true, data: experts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.requestConsultation = async (req, res) => {
  try {
    const request = await consultationModel.createConsultationRequest({
      ...req.body,
      farmerId: req.user.uid
    });
    
    // Notify expert
    if (req.body.expertId) {
      await notificationModel.createNotification({
        userId: req.body.expertId,
        title: "New Consultation Request",
        message: "A farmer has requested a consultation.",
        type: "consultation"
      });
    }
    
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Notifications Methods ────────────────────────────────────

exports.markNotificationRead = async (req, res) => {
  try {
    await notificationModel.markAsRead(req.params.id);
    res.status(200).json({ success: true, message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Community Methods ────────────────────────────────────────

const communityModel = require('../models/communityModel');

exports.createCommunityPost = async (req, res) => {
  try {
    const post = await communityModel.createPost({
      ...req.body,
      authorId: req.user.uid,
      authorRole: 'farmer'
    });
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addCommunityComment = async (req, res) => {
  try {
    const comment = await communityModel.addComment(req.params.id, {
      ...req.body,
      authorId: req.user.uid,
      authorRole: 'farmer'
    });
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleCommunityLike = async (req, res) => {
  try {
    const count = await communityModel.toggleLike(req.params.id, req.user.uid);
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
