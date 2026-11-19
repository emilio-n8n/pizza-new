import { __toESM } from "../_runtime.mjs";
import { Brand } from "./router-ZeX44smn.mjs";
import { require_react } from "../_libs/react.mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { useNavigate } from "../_libs/@tanstack/react-router+[4...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
// node_modules/.nitro/vite/services/ssr/assets/signup-CwyKS65e.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Signup() {
	const navigate = useNavigate();
	const [error, setError] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(false);
	async function handleSubmit(event) {
		event.preventDefault();
		setPending(true);
		setError(null);
		const form = new FormData(event.currentTarget);
		const result = await (await fetch("/api/auth/signup", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				name: String(form.get("name") ?? ""),
				email: String(form.get("email") ?? ""),
				password: String(form.get("password") ?? "")
			})
		})).json();
		if (result.ok) {
			await navigate({ to: "/voice-setup" });
			return;
		}
		setError(result.error ?? "Une erreur est survenue.");
		setPending(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "auth-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "auth-panel",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "auth-top",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "small-note",
					children: ["Déjà un compte ? ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						children: "Se connecter"
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "auth-main",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "auth-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: "Nouveau compte"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "auth-title",
							children: "Votre standard en dix minutes."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "lede",
							style: { fontSize: 15 },
							children: "Créez votre compte, importez votre carte, testez l'agent. L'essai de 14 jours ne demande pas de carte bancaire."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "auth-form",
							onSubmit: handleSubmit,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "field",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "signup-name",
										children: "Votre nom"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "signup-name",
										name: "name",
										autoComplete: "name",
										placeholder: "Emilio Moreau",
										required: true
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "field",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "signup-email",
										children: "Email professionnel"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "signup-email",
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
										htmlFor: "signup-password",
										children: "Mot de passe"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "signup-password",
										name: "password",
										type: "password",
										autoComplete: "new-password",
										placeholder: "8 caractères minimum",
										minLength: 8,
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
									children: pending ? "Création du compte…" : "Créer mon compte"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "small-note",
									children: [
										"Vous préférez remplir un formulaire ?",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/login",
											children: "Connectez-vous"
										}),
										" puis choisissez « configurer à l'écrit »."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "small-note",
									children: [
										"En créant un compte, vous acceptez les",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/legal",
											hash: "terms",
											children: "conditions d'utilisation"
										}),
										" ",
										"et la",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/legal",
											hash: "privacy",
											children: "politique de confidentialité"
										}),
										"."
									]
								})
							]
						})
					]
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "auth-aside",
			"aria-hidden": "true",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/images/counter.webp",
				alt: ""
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "auth-quote",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "« Compte créé, carte importée, agent testé. Le service peut commencer. »" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Mise en route · 10 minutes" })]
			})]
		})]
	});
}
export { Signup as component };
