import { __toESM } from "../_runtime.mjs";
import { BrandMark, Route$13 } from "./router-ZeX44smn.mjs";
import { require_react } from "../_libs/react.mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
// node_modules/.nitro/vite/services/ssr/assets/suivi._token-Bc4BNxpl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STEPS = [
	{
		key: "new",
		label: "Confirmée",
		detail: "Commande reçue"
	},
	{
		key: "preparing",
		label: "En cuisine",
		detail: "Les pizzas sont au four"
	},
	{
		key: "ready",
		label: "Prête",
		detail: "En attente du livreur"
	},
	{
		key: "delivering",
		label: "En route",
		detail: "Le livreur est parti"
	},
	{
		key: "delivered",
		label: "Livrée",
		detail: "Bon appétit"
	}
];
var TITLES = {
	new: {
		title: "Commande reçue.",
		text: "La pizzeria a bien reçu votre commande."
	},
	preparing: {
		title: "En cuisine.",
		text: "Vos pizzas sont en préparation."
	},
	ready: {
		title: "Prête.",
		text: "Votre commande attend le livreur."
	},
	delivering: {
		title: "En route.",
		text: "Le livreur arrive."
	},
	delivered: {
		title: "Livrée.",
		text: "Bon appétit."
	},
	cancelled: {
		title: "Annulée.",
		text: "Cette commande a été annulée."
	}
};
function euro(cents) {
	return `${new Intl.NumberFormat("fr-FR", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(cents / 100)} €`;
}
function Tracking() {
	const data = Route$13.useLoaderData();
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		const timer = setInterval(() => {
			router.invalidate();
		}, 1e4);
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
					children: "Suivi"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "h2",
					children: "Cette commande est introuvable."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "lede",
					style: { marginTop: 12 },
					children: "Le lien est peut-être incomplet. Contactez directement la pizzeria."
				})
			]
		})]
	});
	const { order, location } = data;
	const visual = order.status === "ready" && order.mode !== "delivery" ? "ready" : order.status;
	const stepIndex = STEPS.findIndex((step) => step.key === visual);
	const info = TITLES[order.status] ?? TITLES.new;
	const timeline = order.mode === "delivery" ? STEPS : STEPS.filter((step) => step.key !== "delivering");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "public-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "public-top",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				className: "brand",
				to: "/",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, { className: "brand-mark" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "brand-word",
					children: "PizzaVoice"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mono",
				style: { color: "var(--muted-foreground)" },
				children: order.reference
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "public-card",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "tracking-head",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "eyebrow",
							style: { marginBottom: 8 },
							children: [location?.name ?? "Votre pizzeria", " · Suivi en direct"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "display",
							style: { fontSize: "clamp(38px, 5vw, 56px)" },
							children: info.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "lede",
							style: {
								fontSize: 16,
								marginTop: 10
							},
							children: info.text
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `badge ${order.status === "delivered" ? "badge-delivered" : order.status === "delivering" ? "badge-delivering" : order.status === "ready" ? "badge-ready" : order.status === "preparing" ? "badge-preparing" : "badge-new"}`,
							style: { marginTop: 14 },
							children: timeline.find((step) => step.key === visual)?.label ?? "Confirmée"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "tracking-timeline",
					children: timeline.map((step, index) => {
						const sourceIndex = STEPS.findIndex((item) => item.key === step.key);
						const done = sourceIndex < stepIndex || order.status === "delivered";
						const active = sourceIndex === stepIndex && order.status !== "delivered";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `tracking-step${done ? " is-done" : ""}${active ? " is-active" : ""}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tracking-dot",
								children: done ? "✓" : index + 1
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: step.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: step.detail })] })]
						}, step.key);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "tracking-lines",
					children: [
						order.lines.map((line, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "tracking-line",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								line.quantity,
								" × ",
								line.name
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mono",
								children: euro(line.priceCents * line.quantity)
							})]
						}, `${line.name}-${index}`)),
						order.deliveryFeeCents > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "tracking-line is-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Livraison" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mono",
								children: euro(order.deliveryFeeCents)
							})]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "tracking-total",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mono",
								children: euro(order.totalCents)
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "tracking-info",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mono",
						children: "Mode"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: order.mode === "delivery" ? `Livraison · ${order.address}` : order.mode === "dine-in" ? "Sur place" : "À emporter" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono",
							children: "Pizzeria"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [location?.address, location?.city ? `, ${location.city}` : ""] }),
						location?.phone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: `tel:${location.phone}`,
							className: "btn-link",
							style: { marginTop: 6 },
							children: "Appeler la pizzeria"
						}) : null
					] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "small-note",
					style: { marginTop: 20 },
					children: "Cette page se met à jour toute seule. Gardez ce lien pour suivre la commande."
				})
			]
		})]
	});
}
export { Tracking as component };
