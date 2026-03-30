class Sale {
  constructor({ id, customer, product, amount, score }) {
    this.id = id;
    this.customer = customer;
    this.product = product;
    this.amount = amount;
    this.score = score;
  }

  static fromRow(row) {
    if (!row) {
      return null;
    }

    return new Sale({
      id: row.id,
      customer: row.customer,
      product: row.product,
      amount: row.amount,
      score: row.score,
    });
  }
}

module.exports = Sale;
