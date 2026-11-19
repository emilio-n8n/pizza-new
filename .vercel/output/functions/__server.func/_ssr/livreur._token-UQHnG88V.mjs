import { __toESM } from "../_runtime.mjs";
import { BrandMark, Route$14, completeDeliveryFn, takeDeliveryFn } from "./router-ZeX44smn.mjs";
import { require_react } from "../_libs/react.mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
// node_modules/.nitro/vite/services/ssr/assets/livreur._token-UQHnG88V.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function euro(cents) {
	return `${new Intl.NumberFormat("fr-FR", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(cents / 100)} €`;
}
function mapsUrl(address) {
	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
function OrderCard({ order, driverToken, action, pending, onTaken }) {
	const [busy, setBusy] = (0, import_react.useState)(false);
	const router = useRouter();
	async function run() {
		setBusy(true);
		const result = action === "take" ? await takeDeliveryFn({ data: {
			token: driverToken,
			orderId: order.id
		} }) : await completeDeliveryFn({ data: {
			token: driverToken,
			orderId: order.id
		} });
		setBusy(false);
		if (result.ok) {
			if (action === "take") onTaken?.();
			await router.invalidate();
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "driver-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "driver-card-head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mono",
					children: order.reference
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: order.mode === "delivery" ? "Livraison" : "Retrait" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `badge ${order.status === "delivering" ? "badge-delivering" : "badge-ready"}`,
					children: order.status === "delivering" ? "En cours" : "Disponible"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				className: "driver-address",
				href: mapsUrl(order.address),
				target: "_blank",
				rel: "noreferrer",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mono",
					children: "Adresse"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: order.address || "Adresse à confirmer" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "driver-meta",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: `tel:${order.phone}`,
					className: "btn-link",
					children: order.phone
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "mono",
					children: [euro(order.totalCents), " à encaisser"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "driver-lines",
				children: order.lines.map((line, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					line.quantity,
					" × ",
					line.name
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mono",
					children: euro(line.priceCents * line.quantity)
				})] }, `${line.name}-${index}`))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "driver-actions",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					className: "btn btn-secondary btn-sm",
					href: mapsUrl(order.address),
					target: "_blank",
					rel: "noreferrer",
					children: "Ouvrir l'itinéraire"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-primary btn-sm",
					type: "button",
					onClick: () => void run(),
					disabled: busy || pending,
					children: busy ? "…" : action === "take" ? "Prendre la course" : "Marquer livrée"
				})]
			})
		]
	});
}
function DriverPage() {
	const data = Route$14.useLoaderData();
	const { token } = Route$14.useParams();
	const [tab, setTab] = (0, import_react.useState)("available");
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		const timer = setInterval(() => {
			router.invalidate();
		}, 12e3);
		return () => clearInterval(timer);
	}, [router]);
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "public-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "public-top",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				className: "brand",
				to: "/",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, { className: "brand-mark" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "brand-word",
					children: "PizzaVoice"
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "public-card",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: "Livreur"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "h2",
					children: "Lien invalide ou désactivé."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "lede",
					style: { marginTop: 12 },
					children: "Demandez un nouveau lien à la pizzeria."
				})
			]
		})]
	});
	const orders = tab === "available" ? data.available : data.active;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "public-page driver-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "public-top",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					className: "brand",
					to: "/",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, { className: "brand-mark" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "brand-word",
						children: "PizzaVoice"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "badge badge-success",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "dot",
						"aria-hidden": "true"
					}), " En ligne"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "driver-header",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						style: { marginBottom: 6 },
						children: data.location?.name ?? "Livraisons"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "h2",
						children: [
							"Bonjour ",
							data.driver.name,
							"."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "lede",
						style: { marginTop: 8 },
						children: [
							data.available.length,
							" course",
							data.available.length > 1 ? "s" : "",
							" disponible",
							data.available.length > 1 ? "s" : "",
							" · ",
							data.active.length,
							" en cours"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "tabs",
				role: "tablist",
				"aria-label": "Courses",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: `tab${tab === "available" ? " active" : ""}`,
					type: "button",
					role: "tab",
					"aria-selected": tab === "available",
					onClick: () => setTab("available"),
					children: ["Disponibles ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "count",
						children: data.available.length
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: `tab${tab === "active" ? " active" : ""}`,
					type: "button",
					role: "tab",
					"aria-selected": tab === "active",
					onClick: () => setTab("active"),
					children: ["En cours ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "count",
						children: data.active.length
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "driver-list",
				children: orders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "empty-state",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: tab === "available" ? "Aucune course disponible." : "Aucune course en cours." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "La page se met à jour automatiquement." })]
				}) : orders.map((order) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderCard, {
					order,
					driverToken: token,
					action: tab === "available" ? "take" : "complete",
					pending: false,
					onTaken: () => setTab("active")
				}, order.id))
			})
		]
	});
}
export { DriverPage as component };
