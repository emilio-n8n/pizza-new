import { BrandMark, Route$18 } from "./router-ZeX44smn.mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { Outlet } from "../_libs/@tanstack/react-router+[2...].mjs";
import { useNavigate } from "../_libs/@tanstack/react-router+[4...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
// node_modules/.nitro/vite/services/ssr/assets/app-BPb8emRY.js
var import_jsx_runtime = require_jsx_runtime();
var NAV = [
	{
		to: "/app",
		label: "Vue d'ensemble",
		exact: true
	},
	{
		to: "/app/commandes",
		label: "Commandes"
	},
	{
		to: "/app/menu",
		label: "Menu"
	},
	{
		to: "/app/telephone",
		label: "Téléphone"
	},
	{
		to: "/app/reglages",
		label: "Réglages"
	}
];
function AppLayout() {
	const { session } = Route$18.useRouteContext();
	const navigate = useNavigate();
	const location = session.location;
	async function signOut() {
		await fetch("/api/auth/logout", { method: "POST" });
		await navigate({ to: "/" });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "app-live",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "app-mobile-nav",
			"aria-label": "Navigation de l'application",
			children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: item.to,
				activeOptions: item.exact ? { exact: true } : void 0,
				activeProps: { "data-active": "true" },
				children: item.label
			}, item.to))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "app-shell",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "app-sidebar",
				"aria-label": "Navigation de l'application",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "app-brand",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, { className: "brand-mark" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PizzaVoice" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "org-switch",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "org-name",
							children: location?.name || "Mon établissement"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "org-meta",
							children: [
								location?.city || "Adresse à compléter",
								" ·",
								" ",
								location?.status === "active" ? "Agent actif" : "Brouillon"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "app-nav",
						children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: item.to,
							className: "nav-item",
							activeOptions: item.exact ? { exact: true } : void 0,
							activeProps: { className: "nav-item active" },
							children: item.label
						}, item.to))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "app-user",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "avatar",
							children: session.user.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: session.user.name }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: session.user.email }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "app-signout",
								type: "button",
								onClick: signOut,
								children: "Se déconnecter"
							})
						] })]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "app-main",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "app-topbar",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "breadcrumb",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: location?.name || "PizzaVoice" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "/" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: location?.city || "Mise en route" })
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "topbar-actions",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: `status-live${location?.status === "active" ? "" : " status-draft"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "dot",
									"aria-hidden": "true"
								}), location?.status === "active" ? "Standard actif" : "Brouillon"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								className: "btn btn-secondary btn-sm",
								to: "/",
								children: "Voir le site"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "avatar",
								children: session.user.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "app-content",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
				})]
			})]
		})]
	});
}
export { AppLayout as component };
