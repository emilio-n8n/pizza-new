import { __toESM } from "../_runtime.mjs";
import { Brand, Route$17, activateFn, saveEstablishmentFn, saveMenuFn, saveServiceFn } from "./router-ZeX44smn.mjs";
import { DAY_LABELS, defaultDelivery, defaultHours, formatPriceInput, operatorCodes, parsePriceInput } from "./auth.server-CflMbcf0.mjs";
import { require_react } from "../_libs/react.mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { useNavigate } from "../_libs/@tanstack/react-router+[4...].mjs";
import { useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
// node_modules/.nitro/vite/services/ssr/assets/onboarding-BMcXFnZZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PRICE = /(\d+(?:[.,]\d{1,2})?)\s*(?:€|eur|euros?)?\s*$/i;
function newId() {
	return globalThis.crypto.randomUUID();
}
/**
* Analyse une carte collée en texte libre.
* Une ligne sans prix devient une catégorie ; une ligne avec prix devient un produit.
*/
function parseMenuText(input) {
	const items = [];
	let category = "Pizza";
	for (const raw of input.split(/\r?\n/)) {
		const line = raw.trim();
		if (!line) continue;
		const match = line.match(PRICE);
		if (!match) {
			const cleaned = line.replace(/[:_-]+$/, "").trim();
			if (cleaned.length >= 2 && cleaned.length <= 40) category = titleCase(cleaned);
			continue;
		}
		const price = Number.parseFloat(match[1].replace(",", "."));
		if (!Number.isFinite(price) || price <= 0) continue;
		const name = line.slice(0, match.index).replace(/[-–—:]\s*$/, "").trim();
		if (name.length < 2) continue;
		items.push({
			id: newId(),
			category,
			name: cleanName(name),
			description: "",
			priceCents: Math.round(price * 100),
			available: true
		});
	}
	return items;
}
function cleanName(value) {
	return value.replace(/^[-–—•*]\s*/, "").replace(/\s{2,}/g, " ").trim();
}
function titleCase(value) {
	return value.toLowerCase().split(" ").map((word) => word ? word[0].toUpperCase() + word.slice(1) : word).join(" ");
}
var STEP_TITLES = [
	"Établissement",
	"Menu",
	"Service",
	"Téléphone"
];
function Onboarding() {
	const { session } = Route$17.useRouteContext();
	const location = session.location;
	const navigate = useNavigate();
	const router = useRouter();
	const savedStep = Math.min(4, Math.max(1, location?.onboardingStep ?? 1));
	const [step, setStep] = (0, import_react.useState)(savedStep);
	const [error, setError] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(false);
	const [items, setItems] = (0, import_react.useState)(() => (location?.menu ?? []).map((item) => ({
		...item,
		price: formatPriceInput(item.priceCents)
	})));
	const [paste, setPaste] = (0, import_react.useState)("");
	const [hours, setHours] = (0, import_react.useState)(location?.hours?.length ? location.hours : defaultHours());
	const [delivery, setDelivery] = (0, import_react.useState)(location?.delivery ?? defaultDelivery());
	const [copied, setCopied] = (0, import_react.useState)(null);
	const [twilioNumber, setTwilioNumber] = (0, import_react.useState)(location?.twilioNumber ?? "");
	const testNumber = location?.testNumber ?? "01 89 71 33 56";
	const displayNumber = twilioNumber.trim() || testNumber;
	const codes = operatorCodes(displayNumber);
	function fail(message) {
		setError(message);
		setPending(false);
	}
	async function saveEstablishment(event) {
		event.preventDefault();
		setPending(true);
		setError(null);
		const form = new FormData(event.currentTarget);
		const result = await saveEstablishmentFn({ data: {
			name: String(form.get("name") ?? ""),
			address: String(form.get("address") ?? ""),
			postalCode: String(form.get("postalCode") ?? ""),
			city: String(form.get("city") ?? ""),
			cuisine: String(form.get("cuisine") ?? ""),
			phone: String(form.get("phone") ?? "")
		} });
		if (!result.ok) return fail(result.error);
		setPending(false);
		setStep(2);
		window.scrollTo({ top: 0 });
	}
	async function saveMenu() {
		setPending(true);
		setError(null);
		if (items.length === 0) return fail("Ajoutez au moins un produit à la carte.");
		const menu = items.map((item) => ({
			id: item.id,
			category: item.category || "Pizza",
			name: item.name,
			description: item.description,
			priceCents: parsePriceInput(item.price),
			available: item.available
		}));
		if (menu.some((item) => item.name.trim().length < 2)) return fail("Chaque ligne doit avoir un nom.");
		const result = await saveMenuFn({ data: { items: menu } });
		if (!result.ok) return fail(result.error);
		setPending(false);
		setStep(3);
		window.scrollTo({ top: 0 });
	}
	async function saveService() {
		setPending(true);
		setError(null);
		const result = await saveServiceFn({ data: {
			hours,
			delivery
		} });
		if (!result.ok) return fail(result.error);
		setPending(false);
		setStep(4);
		window.scrollTo({ top: 0 });
	}
	async function activate() {
		setPending(true);
		setError(null);
		const result = await activateFn({ data: { twilioNumber } });
		if (!result.ok) return fail(result.error);
		await router.invalidate();
		await navigate({ to: "/app" });
	}
	function addRow() {
		setItems((current) => [...current, {
			id: globalThis.crypto.randomUUID(),
			category: current.at(-1)?.category ?? "Pizza",
			name: "",
			description: "",
			price: "",
			available: true
		}]);
	}
	function importPaste() {
		const parsed = parseMenuText(paste);
		if (parsed.length === 0) {
			setError("Aucune ligne avec un prix n’a été trouvée. Format attendu : Margherita 12,50");
			return;
		}
		setError(null);
		setItems((current) => [...current, ...parsed.map((item) => ({
			...item,
			price: formatPriceInput(item.priceCents)
		}))]);
		setPaste("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "onboarding",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "onboarding-top",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { withTagline: false }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "onboarding-progress",
						children: [
							"Étape ",
							step,
							" sur 4 · ",
							STEP_TITLES[step - 1]
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container onboarding-body",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "wizard-steps",
					"aria-label": "Étapes de la mise en route",
					children: STEP_TITLES.map((title, index) => {
						const number = index + 1;
						const state = number < step ? "done" : number === step ? "current" : "todo";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "wizard-step",
							"data-state": state,
							onClick: () => number <= step && setStep(number),
							disabled: number > step,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "step-dot",
								children: state === "done" ? "✓" : number
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: number === 1 ? "Nom, adresse, téléphone" : number === 2 ? "Cartes et prix" : number === 3 ? "Horaires et livraison" : "Numéro et transfert" })] })]
						}, title);
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "wizard-card",
					children: [
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "wizard-error",
							role: "alert",
							children: error
						}) : null,
						step === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Votre établissement." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "lede",
								children: "Ces informations servent à l'agent pour répondre, calculer les frais et donner l'adresse au livreur."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "wizard-form",
								onSubmit: saveEstablishment,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "field",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											htmlFor: "name",
											children: "Nom de la pizzeria"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "name",
											name: "name",
											defaultValue: location?.name ?? "",
											placeholder: "Chez Luigi",
											required: true
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "field",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											htmlFor: "address",
											children: "Adresse"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "address",
											name: "address",
											defaultValue: location?.address ?? "",
											placeholder: "24 rue Oberkampf",
											required: true
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "wizard-grid",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "field",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												htmlFor: "postalCode",
												children: "Code postal"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												id: "postalCode",
												name: "postalCode",
												defaultValue: location?.postalCode ?? "",
												placeholder: "75011",
												inputMode: "numeric"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "field",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												htmlFor: "city",
												children: "Ville"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												id: "city",
												name: "city",
												defaultValue: location?.city ?? "",
												placeholder: "Paris"
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "wizard-grid",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "field",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												htmlFor: "cuisine",
												children: "Type de cuisine"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												id: "cuisine",
												name: "cuisine",
												defaultValue: location?.cuisine ?? "Napolitaine",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Napolitaine" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Italienne classique" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Américaine" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Autre" })
												]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "field",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												htmlFor: "phone",
												children: "Téléphone de la pizzeria"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												id: "phone",
												name: "phone",
												type: "tel",
												defaultValue: location?.phone ?? "",
												placeholder: "01 43 57 00 00"
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "wizard-actions",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "wizard-hint",
											children: "Vous pourrez tout modifier plus tard depuis les réglages."
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "btn btn-primary",
											type: "submit",
											disabled: pending,
											children: pending ? "Enregistrement…" : "Continuer vers le menu"
										})]
									})
								]
							})
						] }) : null,
						step === 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Votre carte." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "lede",
								children: "Collez votre carte ou ajoutez les produits à la main. L'agent ne proposera que ce qui figure ici, avec vos prix."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "menu-import",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "paste",
										className: "field",
										style: {
											fontSize: 13,
											fontWeight: 600
										},
										children: "Coller une carte"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "wizard-hint",
										style: { marginTop: 4 },
										children: "Une ligne par produit. Un titre sans prix crée une catégorie. Exemple : « PIZZAS », puis « Margherita 12,50 »."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										id: "paste",
										value: paste,
										onChange: (event) => setPaste(event.target.value),
										placeholder: "PIZZAS\nMargherita 12,50\nRegina 13,50\nQuatre fromages 14,00"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "btn btn-secondary btn-sm",
										type: "button",
										onClick: importPaste,
										style: { marginTop: 10 },
										children: "Ajouter ces lignes"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "menu-rows",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Produit" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Catégorie" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Prix €" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { "aria-label": "Supprimer" })
								] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: items.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "cell-input",
										value: item.name,
										placeholder: "Margherita",
										"aria-label": `Nom du produit ${index + 1}`,
										onChange: (event) => setItems((current) => current.map((row) => row.id === item.id ? {
											...row,
											name: event.target.value
										} : row))
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "cell-input",
										value: item.description,
										placeholder: "Description (optionnel)",
										"aria-label": `Description du produit ${index + 1}`,
										onChange: (event) => setItems((current) => current.map((row) => row.id === item.id ? {
											...row,
											description: event.target.value
										} : row))
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "cell-category",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "cell-input",
											value: item.category,
											"aria-label": `Catégorie du produit ${index + 1}`,
											onChange: (event) => setItems((current) => current.map((row) => row.id === item.id ? {
												...row,
												category: event.target.value
											} : row))
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "cell-input cell-price",
										value: item.price,
										inputMode: "decimal",
										placeholder: "0,00",
										"aria-label": `Prix du produit ${index + 1}`,
										onChange: (event) => setItems((current) => current.map((row) => row.id === item.id ? {
											...row,
											price: event.target.value
										} : row))
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "row-remove",
										type: "button",
										"aria-label": `Supprimer ${item.name || "cette ligne"}`,
										onClick: () => setItems((current) => current.filter((row) => row.id !== item.id)),
										children: "×"
									}) })
								] }, item.id)) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-secondary btn-sm",
								type: "button",
								onClick: addRow,
								style: { marginTop: 12 },
								children: "Ajouter une ligne"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "wizard-actions",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "wizard-hint",
									children: [
										items.length,
										" produit",
										items.length > 1 ? "s" : "",
										" · vous pourrez importer une photo de carte plus tard."
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-primary",
									type: "button",
									onClick: saveMenu,
									disabled: pending || items.length === 0,
									children: pending ? "Enregistrement…" : "Continuer vers le service"
								})]
							})
						] }) : null,
						step === 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Horaires et livraison." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "lede",
								children: "L'agent répond seulement quand vous êtes ouvert et refuse les adresses hors zone. Les frais sont calculés avec vos montants."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "wizard-form",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "eyebrow",
									children: "Horaires"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "hours-list",
									children: hours.map((day, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "hours-row",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: DAY_LABELS[day.day] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "hours-closed",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "checkbox",
													checked: day.closed,
													onChange: (event) => setHours((current) => current.map((row, rowIndex) => rowIndex === index ? {
														...row,
														closed: event.target.checked
													} : row))
												}), "Fermé"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "time",
												value: day.open,
												disabled: day.closed,
												"aria-label": `Ouverture ${DAY_LABELS[day.day]}`,
												onChange: (event) => setHours((current) => current.map((row, rowIndex) => rowIndex === index ? {
													...row,
													open: event.target.value
												} : row))
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "time",
												value: day.close,
												disabled: day.closed,
												"aria-label": `Fermeture ${DAY_LABELS[day.day]}`,
												onChange: (event) => setHours((current) => current.map((row, rowIndex) => rowIndex === index ? {
													...row,
													close: event.target.value
												} : row))
											})
										]
									}, day.day))
								})] }), delivery ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "eyebrow",
										children: "Livraison"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "hours-closed",
										style: { marginBottom: 12 },
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: delivery.enabled,
											onChange: (event) => setDelivery({
												...delivery,
												enabled: event.target.checked
											})
										}), "Je livre mes clients"]
									}),
									delivery.enabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "wizard-grid",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "field",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													htmlFor: "fee",
													children: "Frais de livraison (€)"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													id: "fee",
													value: formatPriceInput(delivery.feeCents),
													inputMode: "decimal",
													onChange: (event) => setDelivery({
														...delivery,
														feeCents: parsePriceInput(event.target.value)
													})
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "field",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													htmlFor: "minimum",
													children: "Commande minimum (€)"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													id: "minimum",
													value: formatPriceInput(delivery.minOrderCents),
													inputMode: "decimal",
													onChange: (event) => setDelivery({
														...delivery,
														minOrderCents: parsePriceInput(event.target.value)
													})
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "field",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													htmlFor: "radius",
													children: "Rayon (km)"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													id: "radius",
													type: "number",
													min: 0,
													value: delivery.radiusKm,
													onChange: (event) => setDelivery({
														...delivery,
														radiusKm: Number(event.target.value)
													})
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "field",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													htmlFor: "postal",
													children: "Codes postaux acceptés"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													id: "postal",
													value: delivery.postalCodes,
													placeholder: "75011, 75012",
													onChange: (event) => setDelivery({
														...delivery,
														postalCodes: event.target.value
													})
												})]
											})
										]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "wizard-hint",
										children: "L'agent prendra uniquement les commandes à emporter."
									})
								] }) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "wizard-actions",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-ghost",
									type: "button",
									onClick: () => setStep(2),
									children: "Retour"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-primary",
									type: "button",
									onClick: saveService,
									disabled: pending,
									children: pending ? "Enregistrement…" : "Continuer vers le téléphone"
								})]
							})
						] }) : null,
						step === 4 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Branchez votre téléphone." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "lede",
								children: "Entrez le numéro Twilio acheté pour votre agent, testez-le, puis activez le transfert depuis la ligne de la pizzeria."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "field",
								style: { marginBottom: 18 },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "twilio-number",
										children: "Numéro Twilio de votre agent"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "twilio-number",
										value: twilioNumber,
										onChange: (event) => setTwilioNumber(event.target.value),
										placeholder: "+33 1 23 45 67 89",
										inputMode: "tel"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "wizard-hint",
										style: { marginTop: 6 },
										children: "Vos clients continuent d'appeler le numéro de la pizzeria. Ce numéro Twilio reçoit le renvoi et fait répondre l'agent."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "activation-number",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "eyebrow",
									style: { marginBottom: 4 },
									children: twilioNumber.trim() ? "Numéro de votre agent" : "Numéro de test de votre agent"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: displayNumber })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-secondary btn-sm",
									type: "button",
									onClick: async () => {
										await navigator.clipboard.writeText(displayNumber.replace(/\s+/g, ""));
										setCopied("number");
									},
									children: copied === "number" ? "Copié" : "Copier"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "step-box",
								style: { marginTop: 24 },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "eyebrow",
									children: "Activer le transfert d'appel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "wizard-hint",
									style: { marginTop: 6 },
									children: "Composez le code de votre opérateur depuis le téléphone de la pizzeria, puis appuyez sur appel. Pour annuler plus tard : ##21#."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "operator-list",
								children: codes.map((operator) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "operator-row",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: operator.name }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: operator.code }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "btn btn-ghost btn-sm",
											type: "button",
											onClick: async () => {
												await navigator.clipboard.writeText(operator.code);
												setCopied(operator.code);
											},
											children: copied === operator.code ? "Copié" : "Copier"
										})
									]
								}, operator.name))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "wizard-actions",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-ghost",
									type: "button",
									onClick: () => setStep(3),
									children: "Retour"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-primary",
									type: "button",
									onClick: activate,
									disabled: pending,
									children: pending ? "Activation…" : "Mon agent est prêt"
								})]
							})
						] }) : null
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "container",
				style: { paddingBottom: 32 },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "small-note",
					children: ["Besoin d'aide ? Écrivez à bonjour@pizzavoice.fr ou revenez plus tard, votre progression est enregistrée. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						children: "Retour au site"
					})]
				})
			})
		]
	});
}
export { Onboarding as component };
