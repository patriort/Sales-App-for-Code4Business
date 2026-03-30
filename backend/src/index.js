const express = require('express');
const cors = require('cors');

const DatabaseConnection = require('./db/connection');
const SaleRepository = require('./repositories/SaleRepository');
const SaleService = require('./services/SaleService');
const SaleController = require('./controllers/SaleController');
const createSalesRouter = require('./routes/salesRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

const dbConnection = new DatabaseConnection(process.env.DB_PATH);
dbConnection.init();

const saleRepository = new SaleRepository(dbConnection.getDb());
const saleService = new SaleService(saleRepository);
const saleController = new SaleController(saleService);

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/sales', createSalesRouter(saleController));

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
