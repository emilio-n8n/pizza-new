import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/react.mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
// node_modules/.nitro/vite/services/ssr/assets/pricing-DAf5bWI1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PhotoPrint({ src, alt, ratio = "4-3", caption, note, tilt = "left", className, style, lazy = true }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: [
			"photo-print-wrap",
			tilt === "left" ? "tilt-left" : "",
			tilt === "right" ? "tilt-right" : "",
			className ?? ""
		].filter(Boolean).join(" "),
		style,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "tape",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `photo-print ratio-${ratio}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src,
				alt,
				loading: lazy ? "lazy" : void 0
			}), caption || note ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figcaption", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: caption }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: note })] }) : null]
		})]
	});
}
function Faq() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "section",
		id: "faq",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container faq-grid",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: "Questions"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "h2",
					children: "Avant de brancher le standard."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "lede",
					style: { marginTop: 16 },
					children: "Les réponses concrètes, sans jargon."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "faq-list",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						open: true,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: "Est-ce que je garde mon numéro actuel ?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Oui. Vous activez le transfert d'appel depuis votre ligne existante. Les codes sont fournis pour Orange, SFR, Bouygues et Free. Votre numéro reste le même." })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: "L'agent parle-t-il anglais ?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Oui. L'agent répond en français ou en anglais selon la langue du client. Le menu peut avoir des noms et des descriptions dans les deux langues." })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: "Que se passe-t-il si l'agent ne comprend pas ?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Il pose une question de clarification. Si le doute persiste, il transfère l'appel vers un humain et laisse une trace dans le tableau de bord." })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: "Puis-je modifier le menu moi-même ?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Oui. Le menu se modifie depuis le tableau de bord. Les prix, les options et la disponibilité sont pris en compte au prochain appel." })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: "Où sont hébergées les données ?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Les données sont hébergées en Europe. Les accès sont journalisés et les tokens de suivi sont révocables. La politique de confidentialité détaille les sous-traitants." })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: "Combien de temps pour l'installation ?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Le menu est importé et relu en quelques minutes. Le test de l'agent et l'activation dépendent de votre ligne téléphonique. Nous ne promettons pas un délai que nous ne tenons pas." })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: "Comment se passe l'abonnement ?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Vous démarrez un essai de 14 jours sans carte bancaire. Ensuite, l'abonnement est prélevé chaque mois par carte, par établissement. Pas de commission sur les commandes, pas de frais par appel. Vous ajoutez ou retirez un établissement depuis le compte, et la facture s'ajuste au prorata." })] })
				]
			})]
		})
	});
}
var pricingBrackets = [
	{
		min: 1,
		max: 1,
		unit: 79,
		label: "1"
	},
	{
		min: 2,
		max: 4,
		unit: 69,
		label: "2 à 4"
	},
	{
		min: 5,
		max: 9,
		unit: 59,
		label: "5 à 9"
	},
	{
		min: 10,
		max: Number.POSITIVE_INFINITY,
		unit: 49,
		label: "10 et plus"
	}
];
function clampLocations(value) {
	if (!Number.isFinite(value)) return 1;
	return Math.min(50, Math.max(1, Math.round(value)));
}
function unitPrice(locations) {
	const count = clampLocations(locations);
	return pricingBrackets.find((item) => count >= item.min && count <= item.max)?.unit ?? pricingBrackets[0].unit;
}
function monthlyTotal(locations) {
	const count = clampLocations(locations);
	return count * unitPrice(count);
}
function activeBracket(locations) {
	const count = clampLocations(locations);
	return pricingBrackets.find((item) => count >= item.min && count <= item.max) ?? pricingBrackets[0];
}
function formatEuros(value, decimals = 0) {
	return new Intl.NumberFormat("fr-FR", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals
	}).format(value) + " €";
}
function formatLocations(count) {
	return `${count} établissement${count > 1 ? "s" : ""}`;
}
function PricingCard() {
	const inputId = (0, import_react.useId)();
	const [locations, setLocations] = (0, import_react.useState)(1);
	const unit = unitPrice(locations);
	const total = monthlyTotal(locations);
	const bracket = activeBracket(locations);
	function update(next) {
		setLocations(clampLocations(next));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "price-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "price-head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "badge badge-outline",
					children: "Abonnement mensuel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mono",
					children: "Sans commission"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "price",
				"aria-live": "polite",
				children: formatEuros(total)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "price-sub",
				children: [
					formatLocations(locations),
					", appels illimités. ",
					formatEuros(unit),
					" par adresse et par mois. Tarif HT."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fleet",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: inputId,
						children: "Votre parc"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "fleet-control",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "fleet-step",
								onClick: () => update(locations - 1),
								"aria-label": "Retirer un établissement",
								disabled: locations <= 1,
								children: "−"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: inputId,
								type: "number",
								min: 1,
								max: 50,
								value: locations,
								inputMode: "numeric",
								onChange: (event) => update(Number(event.target.value)),
								"aria-describedby": `${inputId}-rate`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "fleet-step",
								onClick: () => update(locations + 1),
								"aria-label": "Ajouter un établissement",
								disabled: locations >= 50,
								children: "+"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mono",
						id: `${inputId}-rate`,
						children: [formatEuros(unit), " / établissement"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "rate-table",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("caption", {
						className: "sr-only",
						children: "Tarif mensuel par établissement selon la taille du parc"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						scope: "col",
						children: "Établissements"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						scope: "col",
						children: "Par mois, par adresse"
					})] }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: pricingBrackets.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						"data-active": item.label === bracket.label,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							scope: "row",
							children: item.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: formatEuros(item.unit) })]
					}, item.label)) })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "price-list",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Appels illimités, en français et en anglais" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Menu, horaires et zones de livraison par établissement" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Écran cuisine, ticket 80 mm, suivi client" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Gestion des livreurs et de l'équipe" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Statistiques par établissement et par chaîne" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Support par email et téléphone" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				className: "btn btn-primary btn-block",
				to: "/signup",
				children: "Créer mon établissement"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "price-foot",
				children: [14, " jours d'essai, sans carte. Puis prélèvement mensuel automatique, facture dans le compte."]
			})
		]
	});
}
function PricingSection({ withPhoto = true, withIntro = true }) {
	if (!withIntro) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "section section-tint",
		id: "pricing",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "container pricing-solo",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PricingCard, {})
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "section section-tint",
		id: "pricing",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container pricing-grid",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: "Tarifs"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "h2",
					children: "Un forfait par établissement."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "lede",
					style: { marginTop: 16 },
					children: "Pas de commission sur les commandes, pas de frais par appel, pas de devis. Vous créez votre compte, vous importez votre carte, l'agent est prêt. Le tarif baisse à partir de deux établissements."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "small-note",
					style: { marginTop: 24 },
					children: [
						"Tarifs HT, facturés au mois. Essai de ",
						14,
						" jours sans carte bancaire. Résiliation en ligne, sans préavis."
					]
				}),
				withPhoto ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoPrint, {
					src: "/images/ingredients.webp",
					alt: "Tomates San Marzano, basilic, mozzarella et farine sur du papier cuisson.",
					ratio: "1-1",
					caption: "Ingrédients",
					note: "San Marzano",
					style: {
						maxWidth: 260,
						marginTop: 36
					}
				}) : null
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PricingCard, {})]
		})
	});
}
export { Faq, PhotoPrint, PricingSection };
