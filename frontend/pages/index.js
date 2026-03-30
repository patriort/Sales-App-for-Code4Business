import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Home() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    customer: '',
    product: '',
    amount: '',
  });

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/sales`);
      if (!res.ok) {
        throw new Error('No se pudo cargar ventas');
      }
      const data = await res.json();
      setSales(data);
    } catch (err) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSale = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const res = await fetch(`${API_URL}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form.customer,
          product: form.product,
          amount: Number(form.amount),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'No se pudo crear la venta');
      }

      setForm({ customer: '', product: '', amount: '' });
      await fetchSales();
    } catch (err) {
      setError(err.message || 'Error inesperado');
    }
  };

  const handleScore = async (saleId, score) => {
    try {
      setError('');
      const res = await fetch(`${API_URL}/sales/${saleId}/score`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: Number(score) }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'No se pudo evaluar la venta');
      }

      const updatedSale = await res.json();
      setSales((prev) => prev.map((sale) => (sale.id === updatedSale.id ? updatedSale : sale)));
    } catch (err) {
      setError(err.message || 'Error inesperado');
    }
  };

  return (
    <main className="container">
      <h1>Sistema de Ventas</h1>

      <section className="card">
        <h2>Nueva venta</h2>
        <form onSubmit={handleCreateSale} className="form">
          <input
            name="customer"
            placeholder="Cliente"
            value={form.customer}
            onChange={handleChange}
            required
          />
          <input
            name="product"
            placeholder="Producto"
            value={form.product}
            onChange={handleChange}
            required
          />
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Monto"
            value={form.amount}
            onChange={handleChange}
            required
          />
          <button type="submit">Crear venta</button>
        </form>
      </section>

      <section className="card">
        <h2>Ventas</h2>

        {loading ? <p>Cargando...</p> : null}
        {!loading && sales.length === 0 ? <p>No hay ventas registradas.</p> : null}

        {sales.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Producto</th>
                  <th>Monto</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.customer}</td>
                    <td>{sale.product}</td>
                    <td>${Number(sale.amount).toFixed(2)}</td>
                    <td>
                      <select
                        value={sale.score ?? ''}
                        onChange={(e) => handleScore(sale.id, e.target.value)}
                      >
                        <option value="">Sin score</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                      {sale.score == null ? ' (sin score)' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {error ? <p className="error">{error}</p> : null}
      </section>
    </main>
  );
}
