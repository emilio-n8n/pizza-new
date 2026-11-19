import { __toESM } from "../_runtime.mjs";
import { DAY_LABELS, defaultDelivery, defaultHours, formatPriceInput, operatorCodes, parsePriceInput } from "./auth.server-CflMbcf0.mjs";
import { Route$9, createDriverFn, saveEstablishmentFn, saveServiceFn, saveTelephonyFn, toggleDriverFn } from "./router-ZeX44smn.mjs";
import { require_react } from "../_libs/react.mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
// node_modules/.nitro/vite/services/ssr/assets/reglages-BZFze-DG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Settings() {
	const { session } = Route$9.useRouteContext();
	const drivers = Route$9.useLoaderData();
	const router = useRouter();
	const location = session.location;
	const [hours, setHours] = (0, import_react.useState)(location?.hours?.length ? location.hours : defaultHours());
	const [delivery, setDelivery] = (0, import_react.useState)(location?.delivery ?? defaultDelivery());
	const [message, setMessage] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(false);
	const [copied, setCopied] = (0, import_react.useState)(null);
	const [twilioNumber, setTwilioNumber] = (0, import_react.useState)(location?.twilioNumber ?? "");
	const [driverName, setDriverName] = (0, import_react.useState)("");
	const [driverPhone, setDriverPhone] = (0, import_react.useState)("");
	const testNumber = location?.testNumber ?? "01 89 71 33 56";
	const displayNumber = twilioNumber.trim() || testNumber;
	const codes = operatorCodes(displayNumber);
	async function saveInfo(event) {
		event.preventDefault();
		setPending(true);
		setMessage(null);
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
		setPending(false);
		if (!result.ok) setError(result.error);
		else setMessage("Informations enregistrées.");
	}
	async function addDriver(event) {
		event.preventDefault();
		setPending(true);
		setMessage(null);
		setError(null);
		const result = await createDriverFn({ data: {
			name: driverName,
			phone: driverPhone
		} });
		setPending(false);
		if (!result.ok) {
			setError(result.error);
			return;
		}
		setDriverName("");
		setDriverPhone("");
		setMessage("Livreur ajouté. Copiez son lien et envoyez-le-lui.");
		await router.invalidate();
	}
	async function toggleDriver(id, active) {
		if ((await toggleDriverFn({ data: {
			id,
			active
		} })).ok) await router.invalidate();
	}
	async function copyDriverLink(token) {
		const link = `${window.location.origin}/livreur/${token}`;
		await navigator.clipboard.writeText(link);
		setCopied(`driver-${token}`);
		window.setTimeout(() => setCopied(null), 2500);
	}
	async function saveTelephony() {
		setPending(true);
		setMessage(null);
		setError(null);
		const result = await saveTelephonyFn({ data: { twilioNumber } });
		setPending(false);
		if (!result.ok) setError(result.error);
		else setMessage("Numéro Twilio enregistré. Le runtime répond sur ce numéro.");
	}
	async function saveService() {
		setPending(true);
		setMessage(null);
		setError(null);
		const result = await saveServiceFn({ data: {
			hours,
			delivery
		} });
		setPending(false);
		if (!result.ok) setError(result.error);
		else setMessage("Service enregistré. L'agent applique ces horaires au prochain appel.");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "page-head",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Réglages" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Les informations que l'agent utilise pour répondre et calculer." })] })
		}),
		message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "small-note",
			role: "status",
			style: {
				color: "var(--secondary)",
				marginBottom: 12
			},
			children: message
		}) : null,
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "wizard-error",
			role: "alert",
			style: { marginBottom: 12 },
			children: error
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Établissement" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Nom, adresse et téléphone donnés au client et au livreur." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "wizard-form",
					onSubmit: saveInfo,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "wizard-grid",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "settings-name",
									children: "Nom"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "settings-name",
									name: "name",
									defaultValue: location?.name ?? "",
									required: true
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "settings-phone",
									children: "Téléphone"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "settings-phone",
									name: "phone",
									type: "tel",
									defaultValue: location?.phone ?? ""
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "settings-address",
								children: "Adresse"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "settings-address",
								name: "address",
								defaultValue: location?.address ?? "",
								required: true
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "wizard-grid",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "settings-postal",
									children: "Code postal"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "settings-postal",
									name: "postalCode",
									defaultValue: location?.postalCode ?? ""
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "settings-city",
									children: "Ville"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "settings-city",
									name: "city",
									defaultValue: location?.city ?? ""
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "settings-cuisine",
								children: "Type de cuisine"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								id: "settings-cuisine",
								name: "cuisine",
								defaultValue: location?.cuisine ?? "Napolitaine",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Napolitaine" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Italienne classique" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Américaine" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Autre" })
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "form-foot",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-primary",
								type: "submit",
								disabled: pending,
								children: "Enregistrer"
							})
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Horaires" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "L'agent ne prend pas de commande quand l'établissement est fermé." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
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
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Livraison" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Frais, minimum et zone. L'agent refuse une adresse hors zone." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "hours-closed",
					style: { marginTop: 12 },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: delivery.enabled,
						onChange: (event) => setDelivery({
							...delivery,
							enabled: event.target.checked
						})
					}), "Livraison active"]
				}),
				delivery.enabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "wizard-grid",
					style: { marginTop: 12 },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "settings-fee",
								children: "Frais de livraison (€)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "settings-fee",
								value: formatPriceInput(delivery.feeCents),
								onChange: (event) => setDelivery({
									...delivery,
									feeCents: parsePriceInput(event.target.value)
								}),
								inputMode: "decimal"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "settings-minimum",
								children: "Commande minimum (€)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "settings-minimum",
								value: formatPriceInput(delivery.minOrderCents),
								onChange: (event) => setDelivery({
									...delivery,
									minOrderCents: parsePriceInput(event.target.value)
								}),
								inputMode: "decimal"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "settings-radius",
								children: "Rayon (km)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "settings-radius",
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
								htmlFor: "settings-postal-codes",
								children: "Codes postaux acceptés"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "settings-postal-codes",
								value: delivery.postalCodes,
								placeholder: "75011, 75012",
								onChange: (event) => setDelivery({
									...delivery,
									postalCodes: event.target.value
								})
							})]
						})
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "form-foot",
					style: { marginTop: 16 },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-primary",
						type: "button",
						onClick: saveService,
						disabled: pending,
						children: "Enregistrer le service"
					})
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Téléphone" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Le numéro Twilio reçoit le renvoi de la ligne de la pizzeria. Le numéro public reste celui de la pizzeria." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "field",
					style: { marginTop: 12 },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "settings-twilio",
						children: "Numéro Twilio"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "settings-twilio",
						value: twilioNumber,
						onChange: (event) => setTwilioNumber(event.target.value),
						placeholder: "+33 1 23 45 67 89",
						inputMode: "tel"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "form-foot",
					style: { marginTop: 10 },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-secondary btn-sm",
						type: "button",
						onClick: saveTelephony,
						disabled: pending,
						children: "Enregistrer le numéro"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "activation-number",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: displayNumber }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-secondary btn-sm",
						type: "button",
						onClick: async () => {
							await navigator.clipboard.writeText(displayNumber.replace(/\s+/g, ""));
							setCopied("number");
						},
						children: copied === "number" ? "Copié" : "Copier"
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "small-note",
					style: { marginTop: 12 },
					children: [
						"Pour annuler le transfert, composez ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono",
							children: "##21#"
						}),
						" depuis la même ligne."
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Livreurs" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Chaque livreur reçoit un lien personnel : courses disponibles, adresse, téléphone, montant à encaisser et itinéraire Google Maps. Le lien se révoque en désactivant le livreur." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "wizard-form",
					onSubmit: addDriver,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "wizard-grid",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "driver-name",
								children: "Prénom"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "driver-name",
								value: driverName,
								onChange: (event) => setDriverName(event.target.value),
								placeholder: "Karim",
								required: true
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "driver-phone",
								children: "Téléphone"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "driver-phone",
								value: driverPhone,
								onChange: (event) => setDriverPhone(event.target.value),
								placeholder: "06 12 34 56 78",
								inputMode: "tel"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "form-foot",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn btn-primary",
							type: "submit",
							disabled: pending,
							children: "Ajouter le livreur"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "driver-manage",
					children: drivers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "small-note",
						children: "Aucun livreur. Ajoutez le premier ci-dessus."
					}) : drivers.map((driver) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "driver-manage-row",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: driver.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: driver.phone || "Téléphone non renseigné" })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `badge ${driver.active ? "badge-success" : "badge-outline"}`,
								children: driver.active ? "Actif" : "Désactivé"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "driver-manage-actions",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "btn btn-secondary btn-sm",
										type: "button",
										onClick: () => void copyDriverLink(driver.token),
										children: copied === `driver-${driver.token}` ? "Lien copié" : "Copier le lien"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										className: "btn btn-ghost btn-sm",
										to: "/livreur/$token",
										params: { token: driver.token },
										target: "_blank",
										children: "Ouvrir"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "btn btn-ghost btn-sm",
										type: "button",
										onClick: () => void toggleDriver(driver.id, !driver.active),
										children: driver.active ? "Désactiver" : "Réactiver"
									})
								]
							})
						]
					}, driver.id))
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Compte" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					session.user.name,
					" · ",
					session.user.email
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "small-note",
					children: "L'abonnement et les factures arrivent ici avec Stripe. Essai en cours, aucune carte enregistrée."
				})
			]
		})
	] });
}
export { Settings as component };
