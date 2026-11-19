import { TSS_SERVER_FUNCTION, createServerFn, deleteCookie, getCookie, getServerFnById, setCookie } from "./ssr.mjs";
import { createOrder, createSession, createUser, defaultDelivery, defaultHours, deleteSession, findLocationById, findUserByEmail, findUserById, hashPassword, listDrivers, listLocations, upsertLocation, verifyPassword } from "./auth.server-CflMbcf0.mjs";
import { HeadContent, Scripts, createFileRoute, createRootRoute, createRouter, lazyRouteComponent, useLocation } from "../_libs/@tanstack/react-router+[4...].mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { Outlet } from "../_libs/@tanstack/react-router+[2...].mjs";
import { redirect } from "../_libs/@tanstack/react-router+[...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
import { randomUUID } from "node:crypto";
// node_modules/.nitro/vite/services/ssr/assets/createSsrRpc-d_oSGH4g.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
// node_modules/.nitro/vite/services/ssr/assets/api-gfXNzOdB.js
var getSessionFn = createServerFn({ method: "GET" }).handler(createSsrRpc("1bf0614bbb2e4af5e748219a694c1b57b9f635ed84171bd9c223a0f9d9b38e95"));
createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("f2c779d3bc8b972db1d8f7e5ff0b9e3a9e8a9dcf17cfd7b3a70f4dee9f2fb0de"));
createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("a7078e7cf121c19443bab6ec059bad5c3f626b0349808d0282a47651389bea8b"));
createServerFn({ method: "POST" }).handler(createSsrRpc("b9049e4e75faa7cad4bb0cf1fc0401666a250174d97d5650d63d12597c623f0e"));
var saveEstablishmentFn = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("79ce39ae59c7e0814b3fcab6c8d76f4886bcc827bd4201707fa585be80e03afc"));
var saveMenuFn = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("10d4cc497aec497aa8dee92157198f3e774dcce63eb31a115029e13825b023f6"));
var saveServiceFn = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("7217a62fcf089e74bd904cc103f670970135bc91e3662b04e9bd3cf912ef43db"));
var activateFn = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("02dd9e49f3d1d3d78f47d1d071b847f9b8ff65dc435c913b374b9b6cf27a0752"));
var saveTelephonyFn = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("9961d8d256001c447f5e749910875b883264adde55cadf1b4c16e0c9e96cee9f"));
var updateMenuItemFn = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("2e263e65fe7e7cc8255c9e30a2bb2d84ad210e5156ffca866e8600225a31ce86"));
var addMenuItemFn = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("11b6118e4139de037fd7fd3ece78b39d06dbc0a39bade830738e4afa86cad335"));
var removeMenuItemFn = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("02943e86b7eac47cec9a9bd2b2a862d753dac46640310f753bb4fa1035e6d1b6"));
var getDashboardFn = createServerFn({ method: "GET" }).handler(createSsrRpc("3cda5b4262142790a17f14a6c29d70ecc608317af6dde237c9cad4cd24e78db1"));
var getMenuFn = createServerFn({ method: "GET" }).handler(createSsrRpc("d35f2014dd4a6766dd21ea0f74cb4f5914be9dc5f7b2f8f05004bcc918d59cf6"));
var getTrackingFn = createServerFn({ method: "GET" }).validator((data) => data).handler(createSsrRpc("a7ab0db4ff7e1412f496847b2e5cf6766262086295ccb46ca8cc0f3655f7bb28"));
var getDriverViewFn = createServerFn({ method: "GET" }).validator((data) => data).handler(createSsrRpc("e3dcee04d2c9f07b656be7c1fdc2f374c58dc8fb7bf9469d0cb1b6b154960893"));
var takeDeliveryFn = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("dfbe7cee8aec0625561e25d82ad313433d138f86efe9d3ee53d6939201ee8d0d"));
var completeDeliveryFn = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("9c7ff7e5835e4cdd771e6dcaf213871eca638cb80646eb2271996393b88fac7f"));
var listDriversFn = createServerFn({ method: "GET" }).handler(createSsrRpc("c62d4adcc7e40c52e9715fb10fe962930cbd87bdd92f43e1b084ca15318c0d8e"));
var createDriverFn = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("4918986a155e9f93b000b5b59e661e70759dd3a67aa99040c013434d9bc2ceac"));
var toggleDriverFn = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("f394ba91d4ee49e3a8fba046053375ac1e0c77664f61c5d301e84ea3418bd271"));
var updateOrderStatusFn = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("091c8d4512633807340786b9a8c840325fdae7daa52580cc0a287df2ba090670"));
// node_modules/.nitro/vite/services/ssr/assets/router-ZeX44smn.js
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
function BrandMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		className,
		viewBox: "0 0 32 32",
		fill: "none",
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M5.5 9.5A2.5 2.5 0 0 1 8 7h16a2.5 2.5 0 0 1 2.5 2.5v3.2a3.3 3.3 0 0 0 0 6.6v3.2A2.5 2.5 0 0 1 24 25H8a2.5 2.5 0 0 1-2.5-2.5v-3.2a3.3 3.3 0 0 0 0-6.6V9.5Z",
			stroke: "currentColor",
			strokeWidth: "1.5"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M13 12.5v1.4M13 16v1.4M13 19.5v1.4M18.5 13.5v1M18.5 16.5v1M18.5 19.5v1",
			stroke: "currentColor",
			strokeWidth: "1.5",
			strokeLinecap: "round"
		})]
	});
}
function Brand({ withTagline = true }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		className: "brand",
		to: "/",
		"aria-label": "PizzaVoice, accueil",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, { className: "brand-mark" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "brand-word",
			children: "PizzaVoice"
		}), withTagline ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "brand-sub",
			children: "Le standard des pizzerias"
		}) : null] })]
	});
}
function SiteFooter() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "site-footer",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "footer-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "footer-brand",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Le standard téléphonique qui transforme les appels en commandes, pour les pizzerias indépendantes et les petites chaînes." })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "footer-col",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Produit" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								hash: "product",
								children: "Fonctionnement"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								hash: "chains",
								children: "Chaînes"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/tarifs",
								children: "Tarifs"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								hash: "faq",
								children: "FAQ"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "footer-col",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Ressources" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								hash: "install",
								children: "Installation"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								children: "Aperçu produit"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/legal",
								hash: "privacy",
								children: "Confidentialité"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "/contact",
								children: "Nous contacter"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "footer-col",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Légal" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/legal",
								children: "Mentions légales"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/legal",
								hash: "privacy",
								children: "Confidentialité"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/legal",
								hash: "terms",
								children: "CGU"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/legal",
								hash: "cookies",
								children: "Cookies"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "footer-col",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Contact" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/signup",
								children: "Créer un compte"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "/contact",
								children: "Support"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/tarifs",
								children: "Tarifs"
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "footer-bottom",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"© ",
					(/* @__PURE__ */ new Date()).getFullYear(),
					" PizzaVoice. Tous droits réservés."
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "footer-lang",
					children: "FR"
				})]
			})]
		})
	});
}
var links = [
	{
		label: "Produit",
		to: "/",
		hash: "product"
	},
	{
		label: "Chaînes",
		to: "/",
		hash: "chains"
	},
	{
		label: "Tarifs",
		to: "/tarifs"
	},
	{
		label: "FAQ",
		to: "/",
		hash: "faq"
	}
];
function SiteHeader() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "site-header",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container nav-row",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "nav-links",
					"aria-label": "Navigation principale",
					children: links.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: link.to,
						hash: "hash" in link ? link.hash : void 0,
						children: link.label
					}, link.label))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "nav-actions",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						className: "btn btn-primary btn-sm",
						to: "/signup",
						children: "Créer mon compte"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
					className: "mobile-menu",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
						"aria-label": "Ouvrir le menu",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
							width: "18",
							height: "18",
							viewBox: "0 0 24 24",
							fill: "none",
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								d: "M4 7h16M4 12h16M4 17h16",
								stroke: "currentColor",
								strokeWidth: "1.5",
								strokeLinecap: "round"
							})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mobile-menu-panel",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								hash: "product",
								children: "Produit"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								hash: "chains",
								children: "Chaînes"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/tarifs",
								children: "Tarifs"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								hash: "faq",
								children: "FAQ"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								className: "btn btn-primary btn-sm",
								to: "/signup",
								style: { marginTop: 4 },
								children: "Créer mon compte"
							})
						]
					})]
				})
			]
		})
	});
}
var styles_default = "/assets/styles-DcBYny6y.css";
var Route$27 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{
				name: "theme-color",
				content: "#F7F1E6"
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}, {
			rel: "icon",
			href: "/favicon.svg",
			type: "image/svg+xml"
		}]
	}),
	shellComponent: RootDocument,
	component: RootLayout,
	notFoundComponent: NotFound
});
function RootDocument({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "fr",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootLayout() {
	const pathname = useLocation({ select: (location) => location.pathname });
	const isApp = pathname.startsWith("/app") || pathname === "/onboarding" || pathname === "/studio";
	const isPublicFollow = pathname.startsWith("/suivi/") || pathname.startsWith("/livreur/");
	if (isApp || pathname === "/login" || pathname === "/signup" || isPublicFollow) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		id: "main",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
			className: "skip",
			href: "#main",
			children: "Aller au contenu"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			id: "main",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
	] });
}
function NotFound() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "section",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: "Page introuvable"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "h1",
					children: "Cette page n'existe pas."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "lede",
					style: { marginTop: 16 },
					children: "Le lien est peut-être ancien. Revenez à l'accueil ou regardez les tarifs."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hero-actions",
					style: { marginTop: 24 },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: "btn btn-primary",
						href: "/",
						children: "Retour à l'accueil"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: "btn btn-secondary",
						href: "/tarifs",
						children: "Voir les tarifs"
					})]
				})
			]
		})
	});
}
var $$splitComponentImporter$17 = () => import("./routes-Wev0YBDJ.mjs");
var Route$26 = createFileRoute("/")({
	head: () => ({ meta: [{ title: "PizzaVoice, le standard des pizzerias" }, {
		name: "description",
		content: "PizzaVoice répond au téléphone pendant le service, prend la commande, l'envoie en cuisine et tient le livreur informé. Pour les pizzerias indépendantes et les petites chaînes."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("../_authenticated-DYsp_ooY.mjs");
var Route$25 = createFileRoute("/_authenticated")({
	beforeLoad: async () => {
		const session = await getSessionFn();
		if (!session) throw redirect({ to: "/login" });
		return { session };
	},
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./contact-DFzARSoz.mjs");
var Route$24 = createFileRoute("/contact")({
	head: () => ({ meta: [{ title: "Ouvrir un compte, PizzaVoice" }, {
		name: "description",
		content: "Laissez vos coordonnées pour ouvrir votre compte PizzaVoice. Réponse sous un jour ouvré, aucune carte bancaire demandée."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./legal-DBJh8Lb0.mjs");
var Route$23 = createFileRoute("/legal")({
	head: () => ({ meta: [{ title: "Informations légales, PizzaVoice" }, {
		name: "description",
		content: "Mentions légales, confidentialité, conditions d’utilisation et cookies de PizzaVoice."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./login-Cj7yWxZk.mjs");
var Route$22 = createFileRoute("/login")({
	head: () => ({ meta: [{ title: "Connexion, PizzaVoice" }] }),
	beforeLoad: async () => {
		const session = await getSessionFn();
		if (session) throw redirect({ to: session.location?.status === "active" ? "/app" : "/onboarding" });
	},
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./signup-CwyKS65e.mjs");
var Route$21 = createFileRoute("/signup")({
	head: () => ({ meta: [{ title: "Créer mon compte, PizzaVoice" }, {
		name: "description",
		content: "Créez votre compte PizzaVoice, importez votre carte et testez votre agent en quelques minutes. 14 jours d’essai, sans carte bancaire."
	}] }),
	beforeLoad: async () => {
		const session = await getSessionFn();
		if (session) throw redirect({ to: session.location?.status === "active" ? "/app" : "/onboarding" });
	},
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./studio-DHbdlWaA.mjs");
var Route$20 = createFileRoute("/studio")({
	head: () => ({ meta: [{ title: "Atelier, PizzaVoice" }] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./tarifs-Dg1rUxSL.mjs");
var Route$19 = createFileRoute("/tarifs")({
	head: () => ({ meta: [{ title: "Tarifs, PizzaVoice" }, {
		name: "description",
		content: "Abonnement mensuel par établissement, appels illimités, sans commission. 14 jours d’essai sans carte. Le tarif est public et le total se calcule en direct."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./app-BPb8emRY.mjs");
var Route$18 = createFileRoute("/_authenticated/app")({
	head: () => ({ meta: [{ title: "Commandes, PizzaVoice" }] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./onboarding-BMcXFnZZ.mjs");
var Route$17 = createFileRoute("/_authenticated/onboarding")({
	head: () => ({ meta: [{ title: "Paramétrer ma pizzeria, PizzaVoice" }] }),
	beforeLoad: async () => {
		const session = await getSessionFn();
		if (!session) throw redirect({ to: "/login" });
		if (session.location?.status === "active") throw redirect({ to: "/app" });
		return { session };
	},
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./voice-setup-Y-EybMtj.mjs");
var Route$16 = createFileRoute("/_authenticated/voice-setup")({
	head: () => ({ meta: [{ title: "Configuration à la voix, PizzaVoice" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var Route$15 = createFileRoute("/api/contact")({ server: { handlers: { POST: async ({ request }) => {
	let payload;
	try {
		payload = await request.json();
	} catch {
		return Response.json({
			ok: false,
			error: "invalid_json"
		}, { status: 400 });
	}
	const name = payload.name?.trim();
	const email = payload.email?.trim();
	if (!name || !email || !email.includes("@")) return Response.json({
		ok: false,
		error: "missing_fields"
	}, { status: 422 });
	console.info("[contact] nouvelle demande", {
		name,
		email,
		phone: payload.phone ?? "",
		locations: payload.locations ?? "",
		message: payload.message ?? ""
	});
	return Response.json({ ok: true });
} } } });
var $$splitComponentImporter$6 = () => import("./livreur._token-UQHnG88V.mjs");
var Route$14 = createFileRoute("/livreur/$token")({
	head: () => ({ meta: [{ title: "Livraisons, PizzaVoice" }, {
		name: "robots",
		content: "noindex,nofollow"
	}] }),
	loader: async ({ params }) => getDriverViewFn({ data: { token: params.token } }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./suivi._token-Bc4BNxpl.mjs");
var Route$13 = createFileRoute("/suivi/$token")({
	head: () => ({ meta: [{ title: "Suivi de commande, PizzaVoice" }, {
		name: "robots",
		content: "noindex,nofollow"
	}] }),
	loader: async ({ params }) => getTrackingFn({ data: { token: params.token } }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./app-BcCng_Qa.mjs");
var Route$12 = createFileRoute("/_authenticated/app/")({
	head: () => ({ meta: [{ title: "Vue d'ensemble, PizzaVoice" }] }),
	loader: async () => getDashboardFn(),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./commandes-BjUqbtpd.mjs");
var Route$11 = createFileRoute("/_authenticated/app/commandes")({
	head: () => ({ meta: [{ title: "Commandes, PizzaVoice" }] }),
	loader: async () => getDashboardFn(),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./menu-CxD02XZH.mjs");
var Route$10 = createFileRoute("/_authenticated/app/menu")({
	head: () => ({ meta: [{ title: "Menu, PizzaVoice" }] }),
	loader: async () => getMenuFn(),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./reglages-BZFze-DG.mjs");
var Route$9 = createFileRoute("/_authenticated/app/reglages")({
	head: () => ({ meta: [{ title: "Réglages, PizzaVoice" }] }),
	loader: async () => listDriversFn(),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./telephone-DuXdOu7F.mjs");
var Route$8 = createFileRoute("/_authenticated/app/telephone")({
	head: () => ({ meta: [{ title: "Téléphone, PizzaVoice" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var Route$7 = createFileRoute("/api/agent/drivers")({ server: { handlers: { GET: async ({ request }) => {
	const expected = process.env.AGENT_API_KEY;
	if (!expected) return Response.json({
		ok: false,
		error: "agent_api_not_configured"
	}, { status: 503 });
	if (request.headers.get("x-agent-key") !== expected) return Response.json({
		ok: false,
		error: "unauthorized"
	}, { status: 401 });
	const tenant = new URL(request.url, "http://localhost").searchParams.get("tenant");
	const locations = await listLocations();
	let location = null;
	if (tenant) {
		const t = tenant.replace(/\D/g, "");
		location = locations.find((item) => item.twilioNumber && item.twilioNumber.replace(/\D/g, "") === t) ?? null;
	}
	if (!location) location = locations.find((item) => item.status === "active") ?? locations[0] ?? null;
	if (!location) return Response.json({
		ok: false,
		error: "no_location"
	}, { status: 404 });
	const drivers = await listDrivers(location.id);
	return Response.json({
		ok: true,
		drivers: drivers.map((d) => ({
			name: d.name,
			active: d.active
		}))
	});
} } } });
var Route$6 = createFileRoute("/api/agent/location")({ server: { handlers: { GET: async ({ request }) => {
	const expected = process.env.AGENT_API_KEY;
	if (!expected) return Response.json({
		ok: false,
		error: "agent_api_not_configured"
	}, { status: 503 });
	if (request.headers.get("x-agent-key") !== expected) return Response.json({
		ok: false,
		error: "unauthorized"
	}, { status: 401 });
	const tenant = new URL(request.url, "http://localhost").searchParams.get("tenant");
	const locations = await listLocations();
	let location = null;
	if (tenant) {
		const t = tenant.replace(/\D/g, "");
		location = locations.find((item) => item.twilioNumber && item.twilioNumber.replace(/\D/g, "") === t) ?? null;
	}
	if (!location) location = locations.find((item) => item.status === "active") ?? locations[0] ?? null;
	if (!location) return Response.json({
		ok: false,
		error: "no_location"
	}, { status: 404 });
	return Response.json({
		ok: true,
		location: {
			id: location.id,
			name: location.name,
			address: location.address,
			postalCode: location.postalCode,
			city: location.city,
			cuisine: location.cuisine,
			phone: location.phone,
			hours: location.hours,
			delivery: location.delivery,
			status: location.status
		}
	});
} } } });
var Route$5 = createFileRoute("/api/agent/menu")({ server: { handlers: { GET: async ({ request }) => {
	const expected = process.env.AGENT_API_KEY;
	if (!expected) return Response.json({
		ok: false,
		error: "agent_api_not_configured"
	}, { status: 503 });
	if (request.headers.get("x-agent-key") !== expected) return Response.json({
		ok: false,
		error: "unauthorized"
	}, { status: 401 });
	const tenant = new URL(request.url, "http://localhost").searchParams.get("tenant");
	const locations = await listLocations();
	let location = null;
	if (tenant) {
		const t = tenant.replace(/\D/g, "");
		location = locations.find((item) => item.twilioNumber && item.twilioNumber.replace(/\D/g, "") === t) ?? null;
	}
	if (!location) location = locations.find((item) => item.status === "active") ?? locations[0] ?? null;
	if (!location) return Response.json({
		ok: false,
		error: "no_location"
	}, { status: 404 });
	return Response.json({
		ok: true,
		menu: location.menu.filter((item) => item.available).map((item) => ({
			name: item.name,
			category: item.category,
			description: item.description,
			priceCents: item.priceCents,
			priceEuros: (item.priceCents / 100).toFixed(2)
		}))
	});
} } } });
var SESSION_FILE_HEADER = "x-onboarding-session";
function clean(value, max = 120) {
	return String(value ?? "").trim().slice(0, max);
}
function toCents(item) {
	if (typeof item.priceCents === "number" && Number.isFinite(item.priceCents)) return Math.max(0, Math.round(item.priceCents));
	const parsed = Number.parseFloat(String(item.price ?? "").replace(",", "."));
	return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed * 100)) : 0;
}
var Route$4 = createFileRoute("/api/agent/onboarding")({ server: { handlers: { POST: async ({ request }) => {
	const expected = process.env.AGENT_API_KEY;
	if (!expected) return Response.json({
		ok: false,
		error: "agent_api_not_configured"
	}, { status: 503 });
	if (request.headers.get("x-agent-key") !== expected) return Response.json({
		ok: false,
		error: "unauthorized"
	}, { status: 401 });
	const userId = clean(request.headers.get(SESSION_FILE_HEADER), 64);
	const user = userId ? await findUserById(userId) : null;
	if (!user) return Response.json({
		ok: false,
		error: "unknown_user"
	}, { status: 404 });
	let payload;
	try {
		payload = await request.json();
	} catch {
		return Response.json({
			ok: false,
			error: "invalid_json"
		}, { status: 400 });
	}
	const est = payload.establishment ?? {};
	const name = clean(est.name);
	if (name.length < 2) return Response.json({
		ok: false,
		error: "missing_name",
		message: "Il manque le nom de la pizzeria."
	}, { status: 422 });
	const menu = (payload.menu ?? []).map((item) => {
		const itemName = clean(item.name, 80);
		const priceCents = toCents(item);
		return {
			id: randomUUID(),
			category: clean(item.category, 40) || "Pizza",
			name: itemName,
			description: clean(item.description, 200),
			priceCents,
			available: item.available !== false
		};
	}).filter((item) => item.name.length >= 2 && item.priceCents > 0);
	if (menu.length === 0) return Response.json({
		ok: false,
		error: "missing_menu",
		message: "Il faut au moins un produit avec un prix."
	}, { status: 422 });
	const hours = defaultHours().map((slot) => {
		const found = (payload.hours ?? []).find((h) => h.day === slot.day);
		if (!found) return slot;
		return {
			day: slot.day,
			closed: Boolean(found.closed),
			open: clean(found.open, 5) || slot.open,
			close: clean(found.close, 5) || slot.close
		};
	});
	const deliveryIn = payload.delivery ?? {};
	const baseDelivery = defaultDelivery();
	const delivery = {
		enabled: deliveryIn.enabled !== false,
		feeCents: typeof deliveryIn.feeCents === "number" && Number.isFinite(deliveryIn.feeCents) ? Math.max(0, Math.round(deliveryIn.feeCents)) : baseDelivery.feeCents,
		minOrderCents: typeof deliveryIn.minOrderCents === "number" && Number.isFinite(deliveryIn.minOrderCents) ? Math.max(0, Math.round(deliveryIn.minOrderCents)) : baseDelivery.minOrderCents,
		radiusKm: typeof deliveryIn.radiusKm === "number" && Number.isFinite(deliveryIn.radiusKm) ? Math.max(0, deliveryIn.radiusKm) : baseDelivery.radiusKm,
		postalCodes: clean(deliveryIn.postalCodes, 200)
	};
	const location = await upsertLocation(user.id, {
		name,
		address: clean(est.address, 160),
		postalCode: clean(est.postalCode, 10),
		city: clean(est.city, 80),
		cuisine: clean(est.cuisine, 40) || "Italienne",
		phone: clean(est.phone, 30),
		menu,
		hours,
		delivery,
		onboardingStep: 5
	});
	return Response.json({
		ok: true,
		location: {
			id: location.id,
			name: location.name,
			menuCount: menu.length,
			delivery,
			hours
		}
	});
} } } });
async function sendSms(to, body) {
	const sid = process.env.TWILIO_ACCOUNT_SID;
	const token = process.env.TWILIO_AUTH_TOKEN;
	const from = process.env.TWILIO_FROM ?? process.env.TWILIO_NUMBER ?? "";
	if (!sid || !token || !from) return {
		sent: false,
		reason: "twilio_not_configured"
	};
	if (!to || !to.startsWith("+")) return {
		sent: false,
		reason: "invalid_phone"
	};
	try {
		const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
			method: "POST",
			headers: {
				Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams({
				To: to,
				From: from,
				Body: body
			})
		});
		if (!response.ok) return {
			sent: false,
			reason: `twilio_${response.status}`
		};
		return {
			sent: true,
			id: (await response.json()).sid ?? ""
		};
	} catch (error) {
		return {
			sent: false,
			reason: error instanceof Error ? error.message : "network_error"
		};
	}
}
function normalize(value) {
	return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
function publicUrl(path) {
	return `${(process.env.APP_PUBLIC_URL ?? "http://localhost:4000").replace(/\/$/, "")}${path}`;
}
var Route$3 = createFileRoute("/api/agent/orders")({ server: { handlers: { POST: async ({ request }) => {
	const expected = process.env.AGENT_API_KEY;
	if (!expected) return Response.json({
		ok: false,
		error: "agent_api_not_configured"
	}, { status: 503 });
	if (request.headers.get("x-agent-key") !== expected) return Response.json({
		ok: false,
		error: "unauthorized"
	}, { status: 401 });
	let payload;
	try {
		payload = await request.json();
	} catch {
		return Response.json({
			ok: false,
			error: "invalid_json"
		}, { status: 400 });
	}
	const locations = await listLocations();
	let location = payload.locationId && await findLocationById(payload.locationId) || null;
	if (!location && payload.tenant) {
		const tenant = payload.tenant.replace(/\D/g, "");
		location = locations.find((item) => item.twilioNumber && item.twilioNumber.replace(/\D/g, "") === tenant) ?? null;
	}
	if (!location) location = locations.find((item) => item.status === "active") ?? locations[0] ?? null;
	if (!location) return Response.json({
		ok: false,
		error: "no_location"
	}, { status: 404 });
	if (!payload.phone) return Response.json({
		ok: false,
		error: "missing_phone"
	}, { status: 422 });
	const lines = (payload.items ?? []).map((item) => {
		const quantity = Math.max(1, Math.round(item.quantity ?? 1));
		const key = normalize(item.name);
		const menuItem = location.menu.find((entry) => normalize(entry.name) === key) ?? location.menu.find((entry) => normalize(entry.name).includes(key) || key.includes(normalize(entry.name)));
		return {
			name: menuItem?.name ?? item.name,
			quantity,
			priceCents: menuItem?.priceCents ?? 0
		};
	}).filter((line) => line.name.length > 0);
	if (lines.length === 0) return Response.json({
		ok: false,
		error: "empty_order"
	}, { status: 422 });
	const mode = payload.mode ?? "pickup";
	const deliveryFeeCents = mode === "delivery" && location.delivery.enabled ? location.delivery.feeCents : 0;
	const order = await createOrder({
		locationId: location.id,
		customerName: payload.customerName ?? "",
		phone: payload.phone,
		address: payload.address ?? "",
		mode,
		lines,
		deliveryFeeCents
	});
	const trackingUrl = publicUrl(`/suivi/${order.token}`);
	const sms = await sendSms(order.phone, `PizzaVoice — commande ${order.reference} confirmée. Suivez-la ici : ${trackingUrl}`);
	return Response.json({
		ok: true,
		order: {
			id: order.id,
			reference: order.reference,
			token: order.token,
			trackingUrl,
			totalCents: order.totalCents,
			status: order.status
		},
		sms
	});
} } } });
var Route$2 = createFileRoute("/api/auth/login")({ server: { handlers: { POST: async ({ request }) => {
	let body;
	try {
		body = await request.json();
	} catch {
		return Response.json({
			ok: false,
			error: "Requête invalide."
		}, { status: 400 });
	}
	const email = body.email?.trim().toLowerCase() ?? "";
	const password = body.password ?? "";
	try {
		const user = await findUserByEmail(email);
		if (!user || !verifyPassword(password, user.passwordHash)) return Response.json({
			ok: false,
			error: "Email ou mot de passe incorrect."
		});
		const session = await createSession(user.id);
		setCookie("pv_session", session.id, {
			httpOnly: true,
			sameSite: "lax",
			path: "/",
			maxAge: 2592e3,
			secure: true
		});
		return Response.json({ ok: true });
	} catch (error) {
		console.error("[login]", error);
		return Response.json({
			ok: false,
			error: "Connexion impossible pour le moment."
		}, { status: 500 });
	}
} } } });
var Route$1 = createFileRoute("/api/auth/logout")({ server: { handlers: { POST: async () => {
	const id = getCookie("pv_session");
	if (id) try {
		await deleteSession(id);
	} catch (error) {
		console.error("[logout]", error);
	}
	deleteCookie("pv_session", { path: "/" });
	return Response.json({ ok: true });
} } } });
var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var Route = createFileRoute("/api/auth/signup")({ server: { handlers: { POST: async ({ request }) => {
	let body;
	try {
		body = await request.json();
	} catch {
		return Response.json({
			ok: false,
			error: "Requête invalide."
		}, { status: 400 });
	}
	const name = body.name?.trim() ?? "";
	const email = body.email?.trim().toLowerCase() ?? "";
	const password = body.password ?? "";
	if (name.length < 2) return Response.json({
		ok: false,
		error: "Indiquez votre nom."
	});
	if (!EMAIL.test(email)) return Response.json({
		ok: false,
		error: "Cet email n’est pas valide."
	});
	if (password.length < 8) return Response.json({
		ok: false,
		error: "Le mot de passe doit faire au moins 8 caractères."
	});
	if (await findUserByEmail(email)) return Response.json({
		ok: false,
		error: "Un compte existe déjà avec cet email. Connectez-vous."
	});
	try {
		const user = await createUser({
			email,
			name,
			passwordHash: hashPassword(password)
		});
		const session = await createSession(user.id);
		setCookie("pv_session", session.id, {
			httpOnly: true,
			sameSite: "lax",
			path: "/",
			maxAge: 2592e3,
			secure: true
		});
		return Response.json({ ok: true });
	} catch (error) {
		console.error("[signup]", error);
		return Response.json({
			ok: false,
			error: "Création impossible pour le moment."
		}, { status: 500 });
	}
} } } });
var IndexRoute = Route$26.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$27
});
var AuthenticatedRoute = Route$25.update({
	id: "/_authenticated",
	getParentRoute: () => Route$27
});
var ContactRoute = Route$24.update({
	id: "/contact",
	path: "/contact",
	getParentRoute: () => Route$27
});
var LegalRoute = Route$23.update({
	id: "/legal",
	path: "/legal",
	getParentRoute: () => Route$27
});
var LoginRoute = Route$22.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$27
});
var SignupRoute = Route$21.update({
	id: "/signup",
	path: "/signup",
	getParentRoute: () => Route$27
});
var StudioRoute = Route$20.update({
	id: "/studio",
	path: "/studio",
	getParentRoute: () => Route$27
});
var TarifsRoute = Route$19.update({
	id: "/tarifs",
	path: "/tarifs",
	getParentRoute: () => Route$27
});
var AuthenticatedAppRoute = Route$18.update({
	id: "/app",
	path: "/app",
	getParentRoute: () => AuthenticatedRoute
});
var AuthenticatedOnboardingRoute = Route$17.update({
	id: "/onboarding",
	path: "/onboarding",
	getParentRoute: () => AuthenticatedRoute
});
var AuthenticatedVoiceSetupRoute = Route$16.update({
	id: "/voice-setup",
	path: "/voice-setup",
	getParentRoute: () => AuthenticatedRoute
});
var ApiContactRoute = Route$15.update({
	id: "/api/contact",
	path: "/api/contact",
	getParentRoute: () => Route$27
});
var LivreurTokenRoute = Route$14.update({
	id: "/livreur/$token",
	path: "/livreur/$token",
	getParentRoute: () => Route$27
});
var SuiviTokenRoute = Route$13.update({
	id: "/suivi/$token",
	path: "/suivi/$token",
	getParentRoute: () => Route$27
});
var AuthenticatedAppIndexRoute = Route$12.update({
	id: "/",
	path: "/",
	getParentRoute: () => AuthenticatedAppRoute
});
var AuthenticatedAppCommandesRoute = Route$11.update({
	id: "/commandes",
	path: "/commandes",
	getParentRoute: () => AuthenticatedAppRoute
});
var AuthenticatedAppMenuRoute = Route$10.update({
	id: "/menu",
	path: "/menu",
	getParentRoute: () => AuthenticatedAppRoute
});
var AuthenticatedAppReglagesRoute = Route$9.update({
	id: "/reglages",
	path: "/reglages",
	getParentRoute: () => AuthenticatedAppRoute
});
var AuthenticatedAppTelephoneRoute = Route$8.update({
	id: "/telephone",
	path: "/telephone",
	getParentRoute: () => AuthenticatedAppRoute
});
var ApiAgentDriversRoute = Route$7.update({
	id: "/api/agent/drivers",
	path: "/api/agent/drivers",
	getParentRoute: () => Route$27
});
var ApiAgentLocationRoute = Route$6.update({
	id: "/api/agent/location",
	path: "/api/agent/location",
	getParentRoute: () => Route$27
});
var ApiAgentMenuRoute = Route$5.update({
	id: "/api/agent/menu",
	path: "/api/agent/menu",
	getParentRoute: () => Route$27
});
var ApiAgentOnboardingRoute = Route$4.update({
	id: "/api/agent/onboarding",
	path: "/api/agent/onboarding",
	getParentRoute: () => Route$27
});
var ApiAgentOrdersRoute = Route$3.update({
	id: "/api/agent/orders",
	path: "/api/agent/orders",
	getParentRoute: () => Route$27
});
var ApiAuthLoginRoute = Route$2.update({
	id: "/api/auth/login",
	path: "/api/auth/login",
	getParentRoute: () => Route$27
});
var ApiAuthLogoutRoute = Route$1.update({
	id: "/api/auth/logout",
	path: "/api/auth/logout",
	getParentRoute: () => Route$27
});
var ApiAuthSignupRoute = Route.update({
	id: "/api/auth/signup",
	path: "/api/auth/signup",
	getParentRoute: () => Route$27
});
var AuthenticatedAppRouteChildren = {
	AuthenticatedAppCommandesRoute,
	AuthenticatedAppMenuRoute,
	AuthenticatedAppReglagesRoute,
	AuthenticatedAppTelephoneRoute,
	AuthenticatedAppIndexRoute
};
var AuthenticatedRouteChildren = {
	AuthenticatedAppRoute: AuthenticatedAppRoute._addFileChildren(AuthenticatedAppRouteChildren),
	AuthenticatedOnboardingRoute,
	AuthenticatedVoiceSetupRoute
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRoute: AuthenticatedRoute._addFileChildren(AuthenticatedRouteChildren),
	ContactRoute,
	LegalRoute,
	LoginRoute,
	SignupRoute,
	StudioRoute,
	TarifsRoute,
	ApiContactRoute,
	LivreurTokenRoute,
	SuiviTokenRoute,
	ApiAgentDriversRoute,
	ApiAgentLocationRoute,
	ApiAgentMenuRoute,
	ApiAgentOnboardingRoute,
	ApiAgentOrdersRoute,
	ApiAuthLoginRoute,
	ApiAuthLogoutRoute,
	ApiAuthSignupRoute
};
var routeTree = Route$27._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0
	});
}
export { Brand, BrandMark, Route$10, Route$11, Route$12, Route$13, Route$14, Route$16, Route$17, Route$18, Route$8, Route$9, activateFn, addMenuItemFn, completeDeliveryFn, createDriverFn, createSsrRpc, getSessionFn, removeMenuItemFn, router_exports, saveEstablishmentFn, saveMenuFn, saveServiceFn, saveTelephonyFn, takeDeliveryFn, toggleDriverFn, updateMenuItemFn, updateOrderStatusFn };
