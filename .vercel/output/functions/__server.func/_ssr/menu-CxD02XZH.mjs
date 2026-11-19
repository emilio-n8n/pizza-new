import { __toESM } from "../_runtime.mjs";
import { formatPriceInput, parsePriceInput } from "./auth.server-CflMbcf0.mjs";
import { Route$10, addMenuItemFn, removeMenuItemFn, updateMenuItemFn } from "./router-ZeX44smn.mjs";
import { require_react } from "../_libs/react.mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
// node_modules/.nitro/vite/services/ssr/assets/menu-CxD02XZH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var BLANK = {
	name: "",
	category: "Pizza",
	description: "",
	price: ""
};
function MenuPage() {
	const data = Route$10.useLoaderData();
	const [items, setItems] = (0, import_react.useState)(data?.location.menu ?? []);
	const [draft, setDraft] = (0, import_react.useState)(BLANK);
	const [error, setError] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(false);
	async function addItem(event) {
		event.preventDefault();
		setPending(true);
		setError(null);
		const priceCents = parsePriceInput(draft.price);
		if (draft.name.trim().length < 2) {
			setError("Indiquez le nom du produit.");
			setPending(false);
			return;
		}
		if (priceCents <= 0) {
			setError("Indiquez un prix supérieur à zéro.");
			setPending(false);
			return;
		}
		const result = await addMenuItemFn({ data: {
			name: draft.name.trim(),
			category: draft.category.trim() || "Pizza",
			description: draft.description.trim(),
			priceCents,
			available: true
		} });
		if (!result.ok) {
			setError(result.error);
			setPending(false);
			return;
		}
		setItems(result.menu);
		setDraft(BLANK);
		setPending(false);
	}
	async function toggle(item) {
		const result = await updateMenuItemFn({ data: {
			id: item.id,
			patch: { available: !item.available }
		} });
		if (result.ok) setItems(result.menu);
	}
	async function remove(item) {
		const result = await removeMenuItemFn({ data: { id: item.id } });
		if (result.ok) setItems(result.menu);
	}
	const categories = Array.from(new Set(items.map((item) => item.category)));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "page-head",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Menu" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				items.length,
				" produit",
				items.length > 1 ? "s" : "",
				" · ",
				categories.length,
				" catégorie",
				categories.length > 1 ? "s" : "",
				" · l'agent ne propose que ce qui est disponible."
			] })] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "panel",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "menu-table",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Produit" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Prix" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Disponible" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { "aria-label": "Actions" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: item.name }),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "item-category",
							children: item.category
						}),
						item.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono",
							style: { color: "var(--muted-foreground)" },
							children: item.description
						})] }) : null
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "price",
						style: { fontSize: 13 },
						children: [formatPriceInput(item.priceCents), " €"]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: `switch${item.available ? " on" : ""}`,
						role: "switch",
						"aria-checked": item.available,
						"aria-label": `${item.name} ${item.available ? "disponible" : "indisponible"}`,
						onClick: () => toggle(item)
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						style: { textAlign: "right" },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "row-remove",
							type: "button",
							"aria-label": `Supprimer ${item.name}`,
							onClick: () => remove(item),
							children: "×"
						})
					})
				] }, item.id)), items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: 4,
					className: "empty-row",
					children: "Aucun produit. Ajoutez votre première pizza ci-dessous."
				}) }) : null] })]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Ajouter un produit" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "wizard-form",
				onSubmit: addItem,
				style: { marginTop: 14 },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "wizard-grid",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "item-name",
								children: "Nom"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "item-name",
								value: draft.name,
								onChange: (event) => setDraft({
									...draft,
									name: event.target.value
								}),
								placeholder: "Margherita",
								required: true
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "item-category",
								children: "Catégorie"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "item-category",
								value: draft.category,
								onChange: (event) => setDraft({
									...draft,
									category: event.target.value
								}),
								placeholder: "Pizza"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "wizard-grid",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "item-description",
								children: "Description"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "item-description",
								value: draft.description,
								onChange: (event) => setDraft({
									...draft,
									description: event.target.value
								}),
								placeholder: "Tomate, mozzarella, basilic"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "item-price",
								children: "Prix (€)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "item-price",
								value: draft.price,
								onChange: (event) => setDraft({
									...draft,
									price: event.target.value
								}),
								placeholder: "12,00",
								inputMode: "decimal",
								required: true
							})]
						})]
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "wizard-error",
						role: "alert",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "form-foot",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn btn-primary",
							type: "submit",
							disabled: pending,
							children: pending ? "Ajout…" : "Ajouter au menu"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "small-note",
							children: "Le produit est disponible immédiatement pour les prochains appels."
						})]
					})
				]
			})]
		})
	] });
}
export { MenuPage as component };
