const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { signToken } = require('../auth');

const router = express.Router();

router.post('/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email.toLowerCase());
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = signToken({ role: 'admin', adminId: admin.id, email: admin.email });
  res.json({ token, role: 'admin', email: admin.email });
});

router.post('/employee/login', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const employee = db
    .prepare('SELECT * FROM employees WHERE email = ? AND is_active = 1')
    .get(email.toLowerCase().trim());
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found or inactive' });
  }
  const token = signToken({
    role: 'employee',
    employeeId: employee.id,
    email: employee.email,
  });
  res.json({
    token,
    role: 'employee',
    employee: {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      hourly_rate: employee.hourly_rate,
    },
  });
});

module.exports = router;
