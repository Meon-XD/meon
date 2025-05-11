const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Buat database SQLite
const db = new sqlite3.Database('./iplog.db', (err) => {
  if (err) return console.error(err.message);
  console.log('Terhubung ke database SQLite.');
});

// Buat tabel jika belum ada
db.run('CREATE TABLE IF NOT EXISTS visitors (id INTEGER PRIMARY KEY AUTOINCREMENT, ip TEXT, time TEXT)');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const time = new Date().toISOString();
  db.run('INSERT INTO visitors (ip, time) VALUES (?, ?)', [ip, time]);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/list', (req, res) => {
  db.all('SELECT * FROM visitors ORDER BY id DESC LIMIT 50', [], (err, rows) => {
    if (err) {
      res.status(500).send("Gagal mengambil data.");
    } else {
      res.json(rows);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server aktif di http://localhost:${PORT}`);
});
