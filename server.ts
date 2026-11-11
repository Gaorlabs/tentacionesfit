import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const ORDERS_FILE = path.resolve(DATA_DIR, 'orders.json');

// Ensure database directory and file exist
function ensureDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readOrdersFromDb(): any[] {
  ensureDatabase();
  try {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading orders database:', error);
    return [];
  }
}

function saveOrdersToDb(orders: any[]): boolean {
  ensureDatabase();
  try {
    // Atomic write via temporary file to prevent corruption
    const tempFile = `${ORDERS_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(orders, null, 2), 'utf-8');
    fs.renameSync(tempFile, ORDERS_FILE);
    return true;
  } catch (error) {
    console.error('Error saving orders database:', error);
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));

  // PWA Service Worker & Manifest Static Routes
  app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.resolve(__dirname, 'public', 'sw.js'));
  });

  app.get('/manifest.webmanifest', (req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json');
    res.sendFile(path.resolve(__dirname, 'public', 'manifest.webmanifest'));
  });
  // 1. Get all saved orders
  app.get('/api/orders', (req, res) => {
    const orders = readOrdersFromDb();
    res.json(orders);
  });

  // 2. Save a newly confirmed order
  app.post('/api/orders', (req, res) => {
    const newOrder = req.body;
    if (!newOrder || !newOrder.id) {
      return res.status(400).json({ error: 'Pedido inválido o datos incompletos' });
    }

    const orders = readOrdersFromDb();
    const existingIndex = orders.findIndex((o) => o.id === newOrder.id);
    if (existingIndex >= 0) {
      orders[existingIndex] = newOrder;
    } else {
      orders.unshift(newOrder); // Most recent first
    }

    const saved = saveOrdersToDb(orders);
    if (!saved) {
      return res.status(500).json({ error: 'Error guardando en la base de datos' });
    }

    console.log(`[DB] Pedido #${newOrder.orderNumber} guardado permanentemente en backend.`);
    res.status(201).json({ success: true, order: newOrder });
  });

  // 3. Update order status or payment status
  app.patch('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const orders = readOrdersFromDb();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const current = orders[index];
    if (updates.status && updates.status !== current.status) {
      if (!current.statusHistory) {
        current.statusHistory = [];
      }
      current.statusHistory.push({
        status: updates.status,
        timestamp: updates.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    orders[index] = { ...current, ...updates };
    saveOrdersToDb(orders);
    res.json({ success: true, order: orders[index] });
  });

  app.patch('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, paymentStatus, timestamp } = req.body;

    const orders = readOrdersFromDb();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    if (status) {
      orders[index].status = status;
      if (!orders[index].statusHistory) {
        orders[index].statusHistory = [];
      }
      orders[index].statusHistory.push({
        status,
        timestamp: timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    if (paymentStatus) {
      orders[index].paymentStatus = paymentStatus;
    }

    saveOrdersToDb(orders);
    res.json({ success: true, order: orders[index] });
  });

  // 4. Delete an order (Admin)
  app.delete('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    const orders = readOrdersFromDb();
    const filtered = orders.filter((o) => o.id !== id);
    saveOrdersToDb(filtered);
    res.json({ success: true });
  });

  // 5. Health check
  app.get('/api/health', (req, res) => {
    const orders = readOrdersFromDb();
    res.json({
      status: 'ok',
      service: 'Tentaciones Fit Orders Backend API',
      database: 'persistent-file-storage',
      ordersCount: orders.length,
      timestamp: Date.now(),
    });
  });

  // Mounting Vite middlewares or static files
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Tentaciones Fit Server] running on http://0.0.0.0:${PORT} (Production: ${isProduction})`);
  });
}

startServer();
