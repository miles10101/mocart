// controllers/userController.js
const supabase = require('../config/supabase');

// Example function to get all users
const getAllUsers = async (req, res) => {
  const { data, error } = await supabase.from('users').select('*');

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({ users: data });
};

// Example function to create a new user
const createUser = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({ user: data });
};

module.exports = { getAllUsers, createUser }; // Ensure both functions are exported
