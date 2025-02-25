// controllers/authController.js
const supabase = require('../config/supabase');

const createUser = async (req, res) => {
  const { email, password } = req.body;

  const { user, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({ user });
};

module.exports = { createUser };
