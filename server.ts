import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use absolute path for database to ensure consistency across environments
const dbPath = path.resolve(__dirname, 'attendance.db');
console.log('Database path:', dbPath);

let db: Database.Database;

try {
  db = new Database(dbPath);
  console.log('Database connected successfully');
  
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
  console.log('Database schema initialized');
} catch (err) {
  console.error('Failed to initialize database:', err);
  process.exit(1);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    try {
      db.prepare('SELECT 1').get();
      res.json({ 
        status: 'ok', 
        database: 'connected',
        dbPath: dbPath,
        writable: fs.accessSync(path.dirname(dbPath), fs.constants.W_OK) === undefined
      });
    } catch (error: any) {
      res.status(500).json({ status: 'error', database: error.message });
    }
  });

  app.get('/api/students', (req, res) => {
    try {
      const students = db.prepare('SELECT * FROM students ORDER BY name ASC').all();
      res.json(students);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/students', (req, res) => {
    const { roll_no, name, course } = req.body;
    console.log('API: Registering student:', { roll_no, name, course });
    
    if (!roll_no || !name || !course) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      const info = db.prepare('INSERT INTO students (roll_no, name, course) VALUES (?, ?, ?)').run(roll_no, name, course);
      res.json({ id: info.lastInsertRowid });
    } catch (error: any) {
      console.error('API Error: Database error during registration:', error);
      if (error.message.includes('UNIQUE constraint failed: students.roll_no')) {
        return res.status(400).json({ error: 'A student with this Roll Number is already registered.' });
      }
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
    
    try {
      const records = db.prepare(query).all(...params);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      console.warn('Production build not found at:', distPath);
      app.get('*', (req, res) => {
        res.status(404).send('Production build not found. Please run build first.');
      });
    }
  }

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
