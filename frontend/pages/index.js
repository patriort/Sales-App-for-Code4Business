import { useEffect, useMemo, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Home() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [scoringSaleId, setScoringSaleId] = useState(null);

  const [form, setForm] = useState({
    customer: '',
    product: '',
    amount: '',
  });

  const [formError, setFormError] = useState('');

  const scoredSales = useMemo(() => sales.filter((sale) => sale.score != null), [sales]);
  const averageScore = useMemo(() => {
    if (scoredSales.length === 0) {
      return null;
    }

    const sum = scoredSales.reduce((acc, sale) => acc + Number(sale.score), 0);
    return (sum / scoredSales.length).toFixed(2);
  }, [scoredSales]);

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
    setFormError('');
  };

  const validateForm = () => {
    const customer = form.customer.trim();
    const product = form.product.trim();
    const amount = Number(form.amount);

    if (!customer || !product || form.amount === '') {
      return 'Completa cliente, producto y monto';
    }

    if (customer.length < 2 || product.length < 2) {
      return 'Cliente y producto deben tener al menos 2 caracteres';
    }

    if (Number.isNaN(amount) || amount <= 0) {
      return 'El monto debe ser mayor a 0';
    }

    return '';
  };

  const handleCreateSale = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const res = await fetch(`${API_URL}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form.customer.trim(),
          product: form.product.trim(),
          amount: Number(form.amount),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'No se pudo crear la venta');
      }

      setForm({ customer: '', product: '', amount: '' });
      setSuccess('Venta creada correctamente');
      await fetchSales();
    } catch (err) {
      setError(err.message || 'Error inesperado');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScore = async (saleId, score) => {
    if (!score) {
      return;
    }

    try {
      setScoringSaleId(saleId);
      setError('');
      setSuccess('');

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
      setSuccess('Score actualizado');
    } catch (err) {
      setError(err.message || 'Error inesperado');
    } finally {
      setScoringSaleId(null);
    }
  };

  return (
    <main className="container">
      <h1>Sistema de Ventas</h1>

      <section className="card">
        <div className="section-head">
          <h2>Listado de ventas</h2>
          <span className="summary">
            Promedio score: {averageScore ?? 'Sin evaluaciones'}
          </span>
        </div>

        {loading ? <p>Cargando ventas...</p> : null}
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
                        disabled={scoringSaleId === sale.id}
                      >
                        <option value="">Sin score</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                      {scoringSaleId === sale.id ? ' Actualizando...' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="card">
        <h2>Formulario para crear venta</h2>
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
          <button type="submit" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Crear venta'}
          </button>
        </form>

        {formError ? <p className="error">{formError}</p> : null}
        {error ? <p className="error">{error}</p> : null}
        {success ? <p className="success">{success}</p> : null}
      </section>
    </main>
  );
}
