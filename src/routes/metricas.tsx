import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { formatCOP, getOrders, type Order } from "@/lib/shaks-store";

export const Route = createFileRoute("/metricas")({
  head: () => ({
    meta: [
      { title: "Métricas de Hoy — Shaks" },
      { name: "description", content: "Resumen del día: total de ventas en pesos y pedidos entregados." },
      { property: "og:title", content: "Métricas de Hoy — Shaks" },
      { property: "og:description", content: "Ventas del día y pedidos entregados de un vistazo." },
    ],
  }),
  component: MetricasPage,
});

function MetricasPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    const refresh = () => setOrders(getOrders());
    refresh();
    window.addEventListener("shaks-update", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("shaks-update", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const delivered = orders.filter((o) => o.status === "delivered");
  const ventasDia = orders.reduce((s, o) => s + o.total, 0);
  const ventasEntregadas = delivered.reduce((s, o) => s + o.total, 0);
  const activos = orders.filter((o) => o.status !== "delivered").length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="font-display text-3xl text-foreground sm:text-4xl">Métricas de Hoy</h1>
      <p className="mt-1 text-lg text-muted-foreground">
        {new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border-4 border-primary bg-card p-6 shadow-md">
          <p className="text-lg font-bold text-muted-foreground">💰 Ventas del día</p>
          <p className="mt-2 text-4xl font-extrabold text-primary">{formatCOP(ventasDia)}</p>
        </div>
        <div className="rounded-2xl border-4 border-accent bg-card p-6 shadow-md">
          <p className="text-lg font-bold text-muted-foreground">🤝 Pedidos entregados</p>
          <p className="mt-2 text-4xl font-extrabold text-accent">{delivered.length}</p>
        </div>
        <div className="rounded-2xl border-4 border-gold bg-card p-6 shadow-md">
          <p className="text-lg font-bold text-muted-foreground">🔥 Pedidos activos</p>
          <p className="mt-2 text-4xl font-extrabold text-gold">{activos}</p>
        </div>
        <div className="rounded-2xl border-4 border-border bg-card p-6 shadow-md">
          <p className="text-lg font-bold text-muted-foreground">🧾 Total de pedidos</p>
          <p className="mt-2 text-4xl font-extrabold text-foreground">{orders.length}</p>
        </div>
      </div>

      <section aria-label="Pedidos entregados" className="mt-8">
        <h2 className="mb-3 font-display text-2xl text-foreground">Entregados hoy</h2>
        {delivered.length === 0 ? (
          <p className="rounded-2xl bg-secondary p-6 text-xl font-semibold text-muted-foreground">
            Aún no se ha entregado ningún pedido hoy.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border-4 border-border bg-card shadow-sm">
            <table className="w-full text-left text-lg">
              <thead className="bg-secondary text-base font-bold text-secondary-foreground">
                <tr>
                  <th className="px-4 py-3">Beeper</th>
                  <th className="px-4 py-3">Detalle</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {delivered.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="px-4 py-3 font-extrabold text-primary">#{o.beeper}</td>
                    <td className="px-4 py-3">{o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</td>
                    <td className="px-4 py-3 text-right font-bold">{formatCOP(o.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-4 border-primary bg-secondary">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-xl font-extrabold">
                    Total entregado
                  </td>
                  <td className="px-4 py-3 text-right text-xl font-extrabold text-primary">{formatCOP(ventasEntregadas)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
