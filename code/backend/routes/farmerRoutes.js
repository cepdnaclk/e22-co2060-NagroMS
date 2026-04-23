// ============================================================
// NagroMS — routes/farmerRoutes.js
// ============================================================

const express = require('express');
const router = express.Router();

const {
  getFarmerProfile, updateFarmerProfile,
  getProducts, addProduct, updateProduct, deleteProduct,
  getOrders, updateOrderStatus, getSales,
  getEquipment, addEquipment, updateEquipment, deleteEquipment,
  getInventory, addInventory, updateInventory, deleteInventory,
  getLoans, addLoan, getExpenses, addExpense
} = require('../controllers/farmerController');

const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// All farmer routes require authentication and the 'farmer' role
router.use(verifyToken);
router.use(requireRole('farmer'));

// ── Profile routes ───────────────────────────────────────────
router.get('/profile', getFarmerProfile);
router.put('/profile', updateFarmerProfile);

// ── Product routes ───────────────────────────────────────────
router.get('/products', getProducts);
router.post('/products', addProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// ── Orders & Sales routes ────────────────────────────────────
router.get('/orders', getOrders);
router.put('/orders/:id', updateOrderStatus);
router.get('/sales', getSales);

// ── Equipment routes ──────────────────────────────────────────
router.get('/equipment', getEquipment);
router.post('/equipment', addEquipment);
router.put('/equipment/:id', updateEquipment);
router.delete('/equipment/:id', deleteEquipment);

// ── Inventory routes ──────────────────────────────────────────
router.get('/inventory', getInventory);
router.post('/inventory', addInventory);
router.put('/inventory/:id', updateInventory);
router.delete('/inventory/:id', deleteInventory);

// ── Loan routes ───────────────────────────────────────────────
router.get('/loans', getLoans);
router.post('/loans', addLoan);

// ── Expense routes ────────────────────────────────────────────
router.get('/expenses', getExpenses);
router.post('/expenses', addExpense);

module.exports = router;