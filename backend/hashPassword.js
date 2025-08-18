// backend/hashPassword.js
const bcrypt = require('bcryptjs');
const password = 'password123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) throw err;
  console.log('Password:', password);
  console.log('Hash:', hash);
});