// ============================================================
// NagroMS — routes/networkRoutes.js
// ============================================================

const express = require('express');
const router = express.Router();
const { toggleConnection, getConnections, getFarmerProductRequests, respondToProductRequest, createCustomerProductRequest, getCustomerProductRequests, saveCustomerOrder, getCustomerOrders } = require('../controllers/networkController');
const { verifyToken } = require('../middleware/authMiddleware');

// ── Get Connections ─────────────────────────────────────────
// GET /api/network/connections
router.get('/connections', verifyToken, getConnections);

// ── Toggle Follow/Unfollow ──────────────────────────────────
// POST /api/network/toggle
router.post('/toggle', verifyToken, toggleConnection);

// ── Product Requests ────────────────────────────────────────
// GET /api/network/product-requests
router.get('/product-requests', verifyToken, getFarmerProductRequests);

// GET /api/network/product-requests/customer
router.get('/product-requests/customer', verifyToken, getCustomerProductRequests);

// POST /api/network/product-requests/create
router.post('/product-requests/create', verifyToken, createCustomerProductRequest);

// POST /api/network/product-requests/respond
router.post('/product-requests/respond', verifyToken, respondToProductRequest);

// ── Orders ──────────────────────────────────────────────────
// POST /api/network/orders/save
router.post('/orders/save', verifyToken, saveCustomerOrder);

// GET /api/network/orders/customer
router.get('/orders/customer', verifyToken, getCustomerOrders);

module.exports = router;
