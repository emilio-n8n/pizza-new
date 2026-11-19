import { __toESM } from "../_runtime.mjs";
import { Route$11, updateOrderStatusFn } from "./router-ZeX44smn.mjs";
import { require_react } from "../_libs/react.mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
// node_modules/.nitro/vite/services/ssr/assets/commandes-BjUqbtpd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var LABELS = {
	new: "Nouvelle",
	preparing: "En préparation",
	ready: "Prête",
	delivering: "En livraison",
	delivered: "Livrée",
	cancelled: "Annulée"
};
var BADGES = {
	new: "badge-new",
	preparing: "badge-preparing",
	ready: "badge-ready",
	delivering: "badge-delivering",
	delivered: "badge-delivered",
	cancelled: "badge-outline"
};
var FILTERS = [
	{
		key: "all",
		label: "Toutes"
	},
	{
		key: "new",
		label: "Nouvelles"
	},
	{
		key: "preparing",
		label: "En cuisine"
	},
	{
		key: "ready",
		label: "Prêtes"
	},
	{
		key: "delivering",
		label: "En livraison"
	},
	{
		key: "delivered",
		label: "Livrées"
	}
];
function euro(cents) {
	return `${new Intl.NumberFormat("fr-FR", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(cents / 100)} €`;
}
function nextAction(order) {
	if (order.status === "new") return {
		label: "Accepter",
		status: "preparing"
	};
	if (order.status === "preparing") return {
		label: "Prête",
		status: "ready"
	};
	if (order.status === "ready" && order.mode !== "delivery") return {
		label: "Terminée",
		status: "delivered"
	};
	if (order.status === "delivering") return {
		label: "Livrée",
		status: "delivered"
	};
	return null;
}
function OrdersPage() {
	const orders = Route$11.useLoaderData()?.orders ?? [];
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [busy, setBusy] = (0, import_react.useState)(null);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		const timer = setInterval(() => {
			router.invalidate();
		}, 1e4);
		return () => clearInterval(timer);
	}, [router]);
	const visible = filter === "all" ? orders : orders.filter((order) => order.status === filter);
	async function move(order, status) {
		setBusy(order.id);
		const result = await updateOrderStatusFn({ data: {
			orderId: order.id,
			status
		} });
		setBusy(null);
		if (result.ok) await router.invalidate();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "page-head",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Commandes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Chaque appel transformé en commande, avec son ticket et son lien de suivi." })] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "tabs",
			role: "tablist",
			"aria-label": "Filtrer les commandes",
			children: FILTERS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: `tab${filter === item.key ? " active" : ""}`,
				type: "button",
				role: "tab",
				"aria-selected": filter === item.key,
				onClick: () => setFilter(item.key),
				children: [
					item.label,
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "count",
						children: item.key === "all" ? orders.length : orders.filter((order) => order.status === item.key).length
					})
				]
			}, item.key))
		}),
		visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "empty-state",
			style: { marginTop: 20 },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Aucune commande dans ce filtre." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Le standard est prêt. Les commandes arrivent ici dès le premier appel." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					className: "btn btn-secondary btn-sm",
					to: "/app/reglages",
					children: "Voir le numéro de test"
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "order-table",
			style: { marginTop: 20 },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Heure" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Commande" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Articles / adresse" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Total" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Statut" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { "aria-label": "Actions" })
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: visible.map((order) => {
				const action = nextAction(order);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "mono",
						children: new Date(order.createdAt).toLocaleTimeString("fr-FR", {
							hour: "2-digit",
							minute: "2-digit"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "id",
							children: order.reference
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono",
							style: {
								fontSize: 9,
								color: "var(--muted-foreground)"
							},
							children: order.mode === "delivery" ? "Livraison" : order.mode === "dine-in" ? "Sur place" : "À emporter"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "items",
						children: [order.lines.map((line) => `${line.quantity} ${line.name}`).join(", "), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: order.address ? `${order.address} · ${order.phone}` : order.phone })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "total",
						children: euro(order.totalCents)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `badge ${BADGES[order.status]}`,
						children: LABELS[order.status]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "action",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: 6,
								justifyContent: "flex-end"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								className: "btn btn-ghost btn-sm",
								to: "/suivi/$token",
								params: { token: order.token },
								target: "_blank",
								children: "Suivi"
							}), action ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-primary btn-sm",
								type: "button",
								disabled: busy === order.id,
								onClick: () => void move(order, action.status),
								children: busy === order.id ? "…" : action.label
							}) : null]
						})
					})
				] }, order.id);
			}) })]
		})
	] });
}
export { OrdersPage as component };
