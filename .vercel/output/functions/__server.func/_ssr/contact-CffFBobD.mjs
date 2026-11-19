import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/react.mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
// node_modules/.nitro/vite/services/ssr/assets/contact-CffFBobD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ContactSection() {
	const [status, setStatus] = (0, import_react.useState)("idle");
	async function handleSubmit(event) {
		event.preventDefault();
		setStatus("sending");
		const payload = Object.fromEntries(new FormData(event.currentTarget));
		try {
			const response = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload)
			});
			setStatus(response.ok ? "sent" : "error");
		} catch {
			setStatus("error");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "section section-ink",
		id: "contact",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container contact-grid",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow light",
					children: "Une question ?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "display",
					children: "Parlons de votre service."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "lede",
					style: { marginTop: 20 },
					children: "L'ouverture de compte, l'import du menu et la mise en route se font en ligne. Écrivez-nous si vous avez une question avant de commencer."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "contact-note",
					children: "Réponse sous un jour ouvré."
				})
			] }), status === "sent" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "component-box",
				role: "status",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Message reçu"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "h3",
						style: { marginBottom: 8 },
						children: "Merci. Nous revenons vers vous avec votre accès."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "small-note",
						children: "Nous répondons sous un jour ouvré."
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "form",
				onSubmit: handleSubmit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "field",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "contact-name",
							children: "Nom"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "contact-name",
							name: "name",
							autoComplete: "name",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "field",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "contact-email",
							children: "Email professionnel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "contact-email",
							name: "email",
							type: "email",
							autoComplete: "email",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "field",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "contact-phone",
							children: "Téléphone"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "contact-phone",
							name: "phone",
							type: "tel",
							autoComplete: "tel"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "field",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "contact-locations",
							children: "Établissements"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							id: "contact-locations",
							name: "locations",
							defaultValue: "1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "1" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "2 à 4" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "5 à 9" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "10 et plus" })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "field full",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "contact-message",
							children: "Votre message"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							id: "contact-message",
							name: "message",
							rows: 3,
							placeholder: "Ville, nombre d'appels par jour, logiciel actuel..."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "field full form-foot",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn btn-primary",
							type: "submit",
							disabled: status === "sending",
							children: status === "sending" ? "Envoi…" : "Envoyer le message"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "small-note light",
							children: [
								"En envoyant ce formulaire, vous acceptez notre",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "/legal#privacy",
									children: "politique de confidentialité"
								}),
								"."
							]
						})]
					}),
					status === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "field full small-note light",
						role: "alert",
						children: "L'envoi n'a pas abouti. Réessayez ou écrivez à bonjour@pizzavoice.fr."
					}) : null
				]
			})]
		})
	});
}
export { ContactSection };
