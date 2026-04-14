import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('attendance.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    roll_no TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    course TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id),
    UNIQUE(student_id, date)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    try {
      db.prepare('SELECT 1').get();
      res.json({ status: 'ok', database: 'connected' });
    } catch (error: any) {
      res.status(500).json({ status: 'error', database: error.message });
    }
  });

  app.get('/api/students', (req, res) => {
    const students = db.prepare('SELECT * FROM students ORDER BY name ASC').all();
    res.json(students);
  });

  app.post('/api/students', (req, res) => {
    const { roll_no, name, course } = req.body;
    console.log('Registering student:', { roll_no, name, course });
    
    if (!roll_no || !name || !course) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      const info = db.prepare('INSERT INTO students (roll_no, name, course) VALUES (?, ?, ?)').run(roll_no, name, course);
      res.json({ id: info.lastInsertRowid });
    } catch (error: any) {
      console.error('Database error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete('/api/students/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/attendance', (req, res) => {
    const { roll_no } = req.body;
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];

    try {
      const student = db.prepare('SELECT id, name FROM students WHERE roll_no = ?').get(roll_no) as any;
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      db.prepare('INSERT INTO attendance (student_id, date, time) VALUES (?, ?, ?)').run(student.id, date, time);
      res.json({ success: true, name: student.name, time });
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Attendance already marked for today' });
      }
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/attendance', (req, res) => {
    const { date } = req.query;
    let query = `
      SELECT a.*, s.name, s.roll_no, s.course 
      FROM attendance a 
      JOIN students s ON a.student_id = s.id
    `;
    const params: any[] = [];

    if (date) {
      query += ' WHERE a.date = ?';
      params.push(date);
    }

    query += ' ORDER BY a.date DESC, a.time DESC';
    
    const records = db.prepare(query).all(...params);
    res.json(records);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
