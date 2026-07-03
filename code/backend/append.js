const fs = require('fs');
const content = `

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
`;
fs.appendFileSync('controllers/farmerController.js', content, 'utf8');
