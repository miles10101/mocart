const express = require('express');
const app = express();
const supabase = require('./config/supabase');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const guestCartRoutes = require('./routes/guestCartRoutes');
const ordersRoutes = require('./routes/ordersRoutes'); // Import orders routes

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/guest-cart', guestCartRoutes);
app.use('/api/orders', ordersRoutes); // Use orders routes

module.exports = app;
