import { Route$12 } from "./router-ZeX44smn.mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
// node_modules/.nitro/vite/services/ssr/assets/app-BcCng_Qa.js
var import_jsx_runtime = require_jsx_runtime();
function Dashboard() {
	const data = Route$12.useLoaderData();
	const { session } = Route$12.useRouteContext();
	const location = data?.location ?? session.location;
	const orders = data?.orders ?? [];
	const today = new Intl.DateTimeFormat("fr-FR", {
		weekday: "long",
		day: "numeric",
		month: "long"
	}).format(/* @__PURE__ */ new Date());
	const firstName = session.user.name.split(" ")[0];
	const revenue = orders.reduce((sum, order) => sum + order.totalCents, 0);
	const steps = [
		{
			label: "Compte créé",
			detail: session.user.email,
			done: true
		},
		{
			label: "Établissement renseigné",
			detail: location?.address || "Adresse manquante",
			done: Boolean(location?.name && location?.address)
		},
		{
			label: "Carte importée",
			detail: `${location?.menu.length ?? 0} produit${(location?.menu.length ?? 0) > 1 ? "s" : ""}`,
			done: (location?.menu.length ?? 0) > 0
		},
		{
			label: "Horaires et livraison",
			detail: location?.delivery.enabled ? "Livraison active" : "À emporter seulement",
			done: Boolean(location?.hours.length)
		},
		{
			label: "Téléphone connecté",
			detail: location?.status === "active" ? "Transfert expliqué" : "À faire",
			done: location?.status === "active"
		}
	];
	const doneCount = steps.filter((step) => step.done).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "page-head",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
				"Bonjour ",
				firstName,
				"."
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				style: { textTransform: "capitalize" },
				children: today
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "page-actions",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					className: "btn btn-secondary btn-sm",
					to: "/app/menu",
					children: "Modifier le menu"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					className: "btn btn-primary btn-sm",
					to: "/app/reglages",
					children: "Réglages de l'agent"
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "stat-grid",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "stat",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "label",
							children: "Commandes du jour"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "value",
							children: orders.length
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "delta",
							children: "depuis minuit"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "stat",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "label",
							children: "Chiffre d'affaires"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "value",
							children: [new Intl.NumberFormat("fr-FR").format(revenue / 100), " €"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "delta",
							children: "commandes encaissées"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "stat",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "label",
							children: "Appels traités"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "value",
							children: "0"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "delta",
							children: "en attente du transfert"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "stat",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "label",
							children: "Produits au menu"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "value",
							children: location?.menu.length ?? 0
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "delta",
							children: [location?.menu.filter((item) => item.available).length ?? 0, " disponibles"]
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "dashboard-grid",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				"aria-labelledby": "recent-orders",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "app-section-head",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "recent-orders",
						children: "Dernières commandes"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Les appels arrivent ici dès que le transfert est actif." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						className: "btn btn-ghost btn-sm",
						to: "/app/commandes",
						children: "Tout voir"
					})]
				}), orders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "empty-state",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Aucune commande pour l'instant." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Le standard est prêt. Testez l'agent avec le numéro de test." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							className: "btn btn-secondary btn-sm",
							to: "/app/reglages",
							children: "Voir le numéro de test"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "order-table",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Heure" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Commande" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Total" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Statut" })
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: orders.slice(0, 5).map((order) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "mono",
							children: new Date(order.createdAt).toLocaleTimeString("fr-FR", {
								hour: "2-digit",
								minute: "2-digit"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "items",
							children: [order.lines.map((line) => `${line.quantity} ${line.name}`).join(", "), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: order.address })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "total",
							children: [new Intl.NumberFormat("fr-FR").format(order.totalCents / 100), " €"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "badge badge-new",
							children: "Nouvelle"
						}) })
					] }, order.id)) })]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				"aria-labelledby": "setup-title",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "app-section-head",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "setup-title",
						children: "Mise en route"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						doneCount,
						" sur ",
						steps.length,
						" étapes terminées"
					] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mono",
						children: [Math.round(doneCount / steps.length * 100), " %"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "checklist",
					children: steps.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						"data-done": step.done,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "check",
								children: step.done ? "✓" : ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: step.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: step.detail })] }),
							!step.done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								className: "btn btn-ghost btn-sm",
								to: "/onboarding",
								children: "Reprendre"
							}) : null
						]
					}, step.label))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				"aria-labelledby": "agent-title",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "app-section-head",
						style: { marginBottom: 6 },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "agent-title",
							children: "Votre agent"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: location?.twilioNumber ? "Numéro Twilio" : "Numéro de test" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `badge ${location?.status === "active" ? "badge-success" : "badge-outline"}`,
							children: location?.status === "active" ? "Actif" : "Brouillon"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mono",
						style: {
							fontSize: 18,
							letterSpacing: "0.04em"
						},
						children: location?.twilioNumber || location?.testNumber || "01 89 71 33 56"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "small-note",
						style: { marginTop: 8 },
						children: "Appelez ce numéro pour simuler une commande, ou testez directement depuis le navigateur."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						className: "btn btn-secondary btn-sm",
						to: "/app/telephone",
						style: { marginTop: 12 },
						children: "Tester dans le navigateur"
					})
				]
			})] })]
		})
	] });
}
export { Dashboard as component };
