import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken } from '../utils/token.js';

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  avatar: user.avatar,
  bio: user.bio,
  role: user.role,
  providerStatus: user.providerStatus,
  createdAt: user.createdAt,
});

export async function register(req, res) {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password || password.length < 8) {
    return res
      .status(400)
      .json({ message: 'Name, email and password (8+ characters) are required.' });
  }
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists)
    return res.status(409).json({ message: 'An account with this email already exists.' });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, phone, passwordHash });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }
  if (user.status !== 'active') return res.status(403).json({ message: 'Account suspended.' });
  res.json({ token: signToken(user), user: publicUser(user) });
}

export async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

export async function updateProfile(req, res) {
  const allowed = ['name', 'phone', 'avatar', 'bio'];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) req.user[key] = req.body[key];
  });
  await req.user.save();
  res.json({ user: publicUser(req.user) });
}
