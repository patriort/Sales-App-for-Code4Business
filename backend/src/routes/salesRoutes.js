const express = require('express');

function createSalesRouter(saleController) {
  const router = express.Router();

  router.get('/', saleController.listSales);
  router.post('/', saleController.createSale);
  router.patch('/:id/score', saleController.scoreSale);

  return router;
}

module.exports = createSalesRouter;
