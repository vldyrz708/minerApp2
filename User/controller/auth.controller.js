const User = require('../model/user.model');
const bcrypt = require('bcryptjs');

exports.showLogin = (req, res) => {
  return res.sendFile(require('path').join(__dirname, '..', 'views', 'login.html'));
};

exports.showRegister = (req, res) => {
  return res.sendFile(require('path').join(__dirname, '..', 'views', 'register.html'));
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Campos incompletos' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email ya registrado' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = new User({ name, email, passwordHash: hash });
    await user.save();
    return res.status(201).json({ message: 'Usuario creado' });
  } catch (err) {
    console.error('User register error', err);
    return res.status(500).json({ message: 'Error interno' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Credenciales incompletas' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

    // opcional: establecer sesión
    req.session.userId = user._id;
    return res.json({ message: 'Autenticado' });
  } catch (err) {
    console.error('User login error', err);
    return res.status(500).json({ message: 'Error interno' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    return res.json({ message: 'Sesión cerrada' });
  });
};
