class SaleService {
  constructor(saleRepository) {
    this.saleRepository = saleRepository;
  }

  listSales() {
    return this.saleRepository.list();
  }

  createSale(payload) {
    const customer = payload.customer ?? payload.cliente;
    const product = payload.product ?? payload.producto;
    const amount = payload.amount ?? payload.monto;

    if (!customer || !product || amount === undefined) {
      const err = new Error('customer/cliente, product/producto y amount/monto son obligatorios');
      err.status = 400;
      throw err;
    }

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      const err = new Error('amount/monto debe ser un numero mayor a 0');
      err.status = 400;
      throw err;
    }

    return this.saleRepository.create({
      customer: String(customer).trim(),
      product: String(product).trim(),
      amount: parsedAmount,
    });
  }

  scoreSale(idParam, scoreParam) {
    const id = Number(idParam);
    if (Number.isNaN(id)) {
      const err = new Error('id invalido');
      err.status = 400;
      throw err;
    }

    const score = Number(scoreParam);
    if (Number.isNaN(score) || score < 1 || score > 5) {
      const err = new Error('score debe estar entre 1 y 5');
      err.status = 400;
      throw err;
    }

    const updatedSale = this.saleRepository.updateScore(id, score);
    if (!updatedSale) {
      const err = new Error('venta no encontrada');
      err.status = 404;
      throw err;
    }

    return updatedSale;
  }
}

module.exports = SaleService;
