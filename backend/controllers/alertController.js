const Alert = require('../models/Alert');

exports.getAlerts = async (req, res) => {
  try {
    const { severity } = req.query;
    let query = { user_id: req.user.id };
    if (severity && severity !== 'all') query.severity = severity;
    
    const alerts = await Alert.find(query).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createAlert = async (req, res) => {
  try {
    const { message, severity = 'critical', idempotencyKey, location, vitals } = req.body;
    if (idempotencyKey) {
      const existing = await Alert.findOne({ user_id: req.user.id, idempotencyKey });
      if (existing) {
        return res.status(200).json({ success: true, alert: existing, deduplicated: true });
      }
    }
    const alert = await Alert.create({
      user_id: req.user.id,
      message: message || 'EMERGENCY SOS BROADCAST TRIGGERED BY USER',
      severity,
      idempotencyKey,
      location,
      vitals,
      provenance: 'SENSOR'
    });
    res.status(201).json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      { resolved: true },
      { new: true }
    );
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
