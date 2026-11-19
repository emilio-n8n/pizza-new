import { __toESM } from "../_runtime.mjs";
import { Brand, getSessionFn } from "./router-ZeX44smn.mjs";
import { require_react } from "../_libs/react.mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { useNavigate } from "../_libs/@tanstack/react-router+[4...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
// node_modules/.nitro/vite/services/ssr/assets/login-Cj7yWxZk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const navigate = useNavigate();
	const [error, setError] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(false);
	async function handleSubmit(event) {
		event.preventDefault();
		setPending(true);
		setError(null);
		const form = new FormData(event.currentTarget);
		const result = await (await fetch("/api/auth/login", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				email: String(form.get("email") ?? ""),
				password: String(form.get("password") ?? "")
			})
		})).json();
		if (!result.ok) {
			setError(result.error ?? "Une erreur est survenue.");
			setPending(false);
			return;
		}
		const session = await getSessionFn();
		await navigate({ to: session?.location?.status === "active" ? "/app" : "/onboarding" });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "auth-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "auth-panel",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "auth-top",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "small-note",
					children: ["Pas encore de compte ? ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/signup",
						children: "Créer un établissement"
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "auth-main",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "auth-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: "Connexion"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "auth-title",
							children: "Reprendre le service."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "lede",
							style: { fontSize: 15 },
							children: "Vos commandes, votre menu et l'état de votre agent sont là où vous les avez laissés."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "auth-form",
							onSubmit: handleSubmit,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "field",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "login-email",
										children: "Email professionnel"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "login-email",
										name: "email",
										type: "email",
										autoComplete: "email",
										placeholder: "vous@maisonluigi.fr",
										required: true
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "field",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "login-password",
										children: "Mot de passe"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "login-password",
										name: "password",
										type: "password",
										autoComplete: "current-password",
										required: true
									})]
								}),
								error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "auth-error",
									children: error
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-primary btn-block",
									type: "submit",
									disabled: pending,
									children: pending ? "Connexion…" : "Se connecter"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "auth-links",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Mot de passe oublié ? Écrivez à bonjour@pizzavoice.fr." })
						})
					]
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "auth-aside",
			"aria-hidden": "true",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/images/oven.webp",
				alt: ""
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "auth-quote",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "« Le téléphone sonne, la commande part en cuisine. Personne ne quitte le four. »" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Chez Luigi · Paris 11e" })]
			})]
		})]
	});
}
export { Login as component };
