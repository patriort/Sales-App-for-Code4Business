class SaleController {
  constructor(saleService) {
    this.saleService = saleService;
  }

  listSales = (_req, res) => {
    const sales = this.saleService.listSales();
    res.json(sales);
  };

  createSale = (req, res) => {
    try {
      const sale = this.saleService.createSale(req.body);
      res.status(201).json(sale);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message || 'Error interno' });
    }
  };

  scoreSale = (req, res) => {
    try {
      const sale = this.saleService.scoreSale(req.params.id, req.body.score);
      res.json(sale);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message || 'Error interno' });
    }
  };
}

module.exports = SaleController;
