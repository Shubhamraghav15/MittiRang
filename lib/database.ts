import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import { mkdir } from 'fs/promises';

const dbPath = path.join(process.cwd(), 'data', 'mittirang.db');

let db: sqlite3.Database;
let dbInitialized = false;
let initPromise: Promise<void> | null = null;

async function ensureDataDirectory() {
  const dataDir = path.dirname(dbPath);
  try {
    await mkdir(dataDir, { recursive: true });
  } catch (error) {
    // Directory might already exist, ignore error
  }
}

function initializeDatabase(): Promise<void> {
  if (initPromise) {
    return initPromise;
  }

  initPromise = new Promise(async (resolve, reject) => {
    try {
      await ensureDataDirectory();
      
      db = new sqlite3.Database(dbPath, async (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
          return;
        }
        
        console.log('Connected to SQLite database');
        
        // Create products table
        db.run(`
          CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            short_description TEXT,
            images TEXT, -- JSON array of image paths
            flipkart_link TEXT,
            amazon_link TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            console.error('Error creating products table:', err);
            reject(err);
            return;
          }
          
          // Create admin users table
          db.run(`
            CREATE TABLE IF NOT EXISTS admin_users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              email TEXT UNIQUE NOT NULL,
              password TEXT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `, (err) => {
            if (err) {
              console.error('Error creating admin_users table:', err);
              reject(err);
              return;
            }
            
            // Create default admin user (email: admin@mittirang.com, password: admin123)
            const hashedPassword = bcrypt.hashSync('admin123', 10);
            
            db.run(
              'INSERT OR IGNORE INTO admin_users (email, password) VALUES (?, ?)',
              ['admin@mittirang.com', hashedPassword],
              (err) => {
                if (err) {
                  console.error('Error creating default admin user:', err);
                  reject(err);
                  return;
                }
                
                dbInitialized = true;
                console.log('Database initialized successfully');
                resolve();
              }
            );
          });
        });
      });
    } catch (error) {
      console.error('Error during database initialization:', error);
      reject(error);
    }
  });

  return initPromise;
}

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initializeDatabase();
  }
}

export async function runQuery(query: string, params: any[] = []): Promise<any> {
  await ensureDbInitialized();
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

export async function getQuery(query: string, params: any[] = []): Promise<any> {
  await ensureDbInitialized();
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export async function allQuery(query: string, params: any[] = []): Promise<any[]> {
  await ensureDbInitialized();
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Initialize database on module load
initializeDatabase().catch(console.error);

export { db };