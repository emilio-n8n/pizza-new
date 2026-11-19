import { __toESM } from "../_runtime.mjs";
import { BrandMark, createSsrRpc } from "./router-ZeX44smn.mjs";
import { createServerFn } from "./ssr.mjs";
import { require_react } from "../_libs/react.mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
// node_modules/.nitro/vite/services/ssr/assets/studio-DHbdlWaA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var BRIDGE_KEY = "pizzavoice/bridge/v1";
function audioKey(flow, node) {
	return `${flow.id}/${node.id}/v${flow.version}`;
}
function compileFlow(flow) {
	const states = {};
	const audio = [];
	for (const node of flow.nodes) {
		const outgoing = flow.edges.filter((item) => item.from === node.id);
		states[node.id] = {
			id: node.id,
			kind: node.kind,
			say: node.text,
			audio: audioKey(flow, node),
			slot: node.slot,
			tool: node.tool,
			transitions: outgoing.map((item) => ({
				id: item.id,
				to: item.to,
				intent: item.intent,
				examples: item.examples,
				question: `${item.intent}. ${item.examples.join(" ; ")}`
			}))
		};
		if (node.text.trim()) audio.push({
			key: audioKey(flow, node),
			nodeId: node.id,
			text: node.text,
			voice: flow.voice,
			characters: node.text.length
		});
	}
	audio.push({
		key: BRIDGE_KEY,
		nodeId: "handoff",
		text: flow.fallback.bridgeText,
		voice: flow.voice,
		characters: flow.fallback.bridgeText.length
	});
	return {
		flowId: flow.id,
		version: flow.version,
		voice: flow.voice,
		states,
		audio,
		fallback: {
			threshold: flow.fallback.threshold,
			bridgeText: flow.fallback.bridgeText,
			bridgeAudio: BRIDGE_KEY
		}
	};
}
var STOP_WORDS = /* @__PURE__ */ new Set([
	"le",
	"la",
	"les",
	"un",
	"une",
	"des",
	"de",
	"du",
	"au",
	"aux",
	"et",
	"ou",
	"je",
	"tu",
	"vous",
	"nous",
	"il",
	"elle",
	"on",
	"ce",
	"cette",
	"ces",
	"pour",
	"avec",
	"sans",
	"est",
	"sont",
	"ai",
	"as",
	"a",
	"avoir",
	"voudrais",
	"veux",
	"peux",
	"peut",
	"svp",
	"plait",
	"bonjour",
	"bonsoir",
	"merci",
	"oui",
	"non",
	"c",
	"j",
	"l",
	"d",
	"s",
	"qu",
	"que",
	"qui",
	"quoi",
	"dans",
	"sur",
	"chez",
	"moi",
	"mon",
	"ma",
	"mes"
]);
function normalize(value) {
	return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
function tokens(value) {
	return normalize(value).split(" ").filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}
function similarity(utterance, example) {
	const said = normalize(utterance);
	const target = normalize(example);
	if (!said || !target) return 0;
	if (said === target) return 1;
	if (said.includes(target) || target.includes(said)) return .85;
	const saidTokens = tokens(said);
	const targetTokens = tokens(target);
	if (saidTokens.length === 0) return 0;
	let overlap = 0;
	for (const token of saidTokens) if (targetTokens.some((item) => item === token || item.startsWith(token.slice(0, 4)))) overlap += 1;
	return overlap / saidTokens.length;
}
function scoreEdge(utterance, edge) {
	let best = 0;
	for (const example of edge.examples) best = Math.max(best, similarity(utterance, example));
	return best;
}
function routeLocally(state, utterance, threshold) {
	if (state.transitions.length === 0) return {
		transitionId: null,
		confidence: 0,
		source: "none",
		probabilities: [],
		reason: "no_transition"
	};
	if (state.transitions.length === 1) return {
		transitionId: state.transitions[0].id,
		confidence: 1,
		source: "single",
		probabilities: [{
			id: state.transitions[0].id,
			score: 1
		}]
	};
	const scored = state.transitions.map((edge) => ({
		id: edge.id,
		score: scoreEdge(utterance, edge)
	})).sort((a, b) => b.score - a.score);
	const top = scored[0];
	const second = scored[1];
	const confidence = top.score / (top.score + second.score + .25);
	if (top.score < .42 || confidence < threshold) return {
		transitionId: null,
		confidence,
		source: "none",
		probabilities: scored,
		reason: top.score < .42 ? "no_match" : "low_confidence"
	};
	return {
		transitionId: top.id,
		confidence,
		source: "local",
		probabilities: scored
	};
}
function slotValue(intent) {
	const normalized = normalize(intent);
	const slots = {};
	if (normalized.includes("margherita")) slots.pizza = "Margherita";
	if (normalized.includes("regina")) slots.pizza = "Regina";
	if (normalized.includes("quatre fromages")) slots.pizza = "Quatre fromages";
	if (normalized.includes("diavola")) slots.pizza = "Diavola";
	if (normalized === "1 pizza") slots.quantity = "1";
	if (normalized === "2 pizzas") slots.quantity = "2";
	if (normalized === "3 pizzas") slots.quantity = "3";
	if (normalized === "coca") slots.drink = "Coca";
	if (normalized === "eau") slots.drink = "Eau";
	if (normalized === "diabolo") slots.drink = "Diabolo";
	if (normalized === "sur place") slots.mode = "sur place";
	if (normalized === "a emporter") slots.mode = "à emporter";
	if (normalized === "en livraison") slots.mode = "en livraison";
	return slots;
}
function renderText(text, slots) {
	const quantity = slots.quantity ?? "1";
	const pizza = slots.pizza ?? "Margherita";
	const drink = slots.drink;
	const mode = slots.mode ?? "à emporter";
	const order = [
		`${quantity} × ${pizza}`,
		drink ? `1 × ${drink}` : null,
		mode === "en livraison" ? `Livraison${slots.address ? ` au ${slots.address}` : ""}` : mode
	].filter(Boolean).join(", ");
	return text.replaceAll("{{order}}", order).replaceAll("{{reference}}", "PV-1042");
}
function outgoingEdges(flow, nodeId) {
	return flow.edges.filter((edge) => edge.from === nodeId);
}
var edge = (from, to, intent, examples) => ({
	id: `${from}__${to}__${intent.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
	from,
	to,
	intent,
	examples
});
var sampleFlow = {
	id: "chez-luigi",
	name: "Chez Luigi · standard du soir",
	voice: "sophie-fr",
	version: 4,
	fallback: {
		threshold: .55,
		bridgeText: "Veuillez patienter quelques secondes, je vérifie avec la pizzeria."
	},
	nodes: [
		{
			id: "greeting",
			kind: "start",
			title: "Accueil",
			text: "Bonjour, bienvenue chez Luigi. Vous appelez pour commander ou pour une information ?"
		},
		{
			id: "mode",
			kind: "branch",
			title: "Type de commande",
			text: "C'est pour du sur place, à emporter ou en livraison ?"
		},
		{
			id: "address",
			kind: "capture",
			title: "Adresse",
			text: "Quelle est l'adresse de livraison ?",
			slot: "address"
		},
		{
			id: "menu",
			kind: "branch",
			title: "Catégorie",
			text: "Très bien. Vous voulez une pizza, des pâtes ou une boisson ?"
		},
		{
			id: "pasta",
			kind: "say",
			title: "Pas de pâtes ce soir",
			text: "Ce soir, nous ne faisons que des pizzas. Je vous montre la carte ?"
		},
		{
			id: "pizzas",
			kind: "say",
			title: "Carte des pizzas",
			text: "Nos pizzas ce soir : Margherita 12,50, Regina 13,50, Quatre fromages 14,00, Diavola 15,00."
		},
		{
			id: "pizza_choice",
			kind: "branch",
			title: "Choix de la pizza",
			text: "Quelle pizza vous tente ?"
		},
		{
			id: "quantity",
			kind: "branch",
			title: "Quantité",
			text: "Combien de pizzas ?"
		},
		{
			id: "drinks",
			kind: "branch",
			title: "Boisson",
			text: "Avec une boisson ?"
		},
		{
			id: "drink_choice",
			kind: "branch",
			title: "Choix de la boisson",
			text: "Coca, eau ou diabolo ?"
		},
		{
			id: "confirm",
			kind: "branch",
			title: "Récapitulatif",
			text: "Je récapitule : {{order}}. On valide ?"
		},
		{
			id: "create",
			kind: "action",
			title: "Créer la commande",
			text: "C'est envoyé en cuisine. Commande {{reference}}. Vous recevez le lien de suivi par SMS. À tout de suite.",
			tool: "create_order"
		},
		{
			id: "info",
			kind: "say",
			title: "Horaires et livraison",
			text: "Nous sommes ouverts du mardi au dimanche, de 11 h 30 à 14 h 30 et de 18 h à 22 h 30. La livraison est à 2,50 €, offerte dès 30 €."
		},
		{
			id: "handoff",
			kind: "handoff",
			title: "Gemini Live",
			text: "Veuillez patienter quelques secondes, je vérifie avec la pizzeria."
		},
		{
			id: "end",
			kind: "end",
			title: "Fin",
			text: "Merci, à bientôt."
		}
	],
	edges: [
		edge("greeting", "mode", "Commander", [
			"je voudrais commander",
			"je veux une pizza",
			"bonsoir je commande",
			"je peux avoir deux pizzas",
			"c’est pour une commande",
			"je voudrais deux margheritas",
			"c’est pour une livraison",
			"je voudrais commander à livrer",
			"vous livrez ce soir",
			"je veux passer commande"
		]),
		edge("greeting", "info", "Information", [
			"vous êtes ouverts",
			"quels sont vos horaires",
			"vous livrez",
			"combien de temps pour la livraison",
			"je peux voir le menu",
			"c’est quoi vos prix"
		]),
		edge("greeting", "handoff", "Un humain", [
			"je veux parler à quelqu’un",
			"un humain",
			"le patron",
			"passez-moi la pizzeria"
		]),
		edge("mode", "menu", "Sur place", [
			"sur place",
			"je mange sur place",
			"pour ici",
			"on reste"
		]),
		edge("mode", "menu", "À emporter", [
			"à emporter",
			"je viens chercher",
			"take away",
			"je passe récupérer"
		]),
		edge("mode", "address", "En livraison", [
			"en livraison",
			"livrez chez moi",
			"vous livrez au 11e",
			"j’habite à côté",
			"livraison"
		]),
		edge("mode", "handoff", "Autre", [
			"je ne sais pas",
			"autre chose",
			"on verra"
		]),
		edge("address", "menu", "Adresse notée", ["continuer"]),
		edge("menu", "pizzas", "Pizzas", [
			"une pizza",
			"des pizzas",
			"je veux une pizza",
			"montrez-moi les pizzas",
			"la carte des pizzas"
		]),
		edge("menu", "pasta", "Pâtes", [
			"des pâtes",
			"un plat de pâtes",
			"vous avez des pâtes",
			"une carbonara"
		]),
		edge("menu", "drinks", "Boissons", [
			"une boisson",
			"un coca",
			"quelque chose à boire",
			"de l’eau"
		]),
		edge("menu", "handoff", "Autre", [
			"je ne sais pas",
			"autre chose",
			"un dessert"
		]),
		edge("pasta", "pizzas", "Voir la carte", [
			"oui",
			"montrez-moi",
			"ok"
		]),
		edge("pizzas", "pizza_choice", "Carte", ["continuer"]),
		edge("pizza_choice", "quantity", "Margherita", [
			"une margherita",
			"margherita",
			"deux margheritas",
			"la classique"
		]),
		edge("pizza_choice", "quantity", "Regina", [
			"une regina",
			"regina",
			"avec du jambon",
			"celle avec les champignons"
		]),
		edge("pizza_choice", "quantity", "Quatre fromages", [
			"quatre fromages",
			"une quatre fromages",
			"celle avec plusieurs fromages"
		]),
		edge("pizza_choice", "quantity", "Diavola", [
			"une diavola",
			"diavola",
			"la piquante",
			"celle avec du salami"
		]),
		edge("pizza_choice", "handoff", "Autre pizza", [
			"autre chose",
			"vous avez une autre pizza",
			"je ne sais pas"
		]),
		edge("quantity", "drinks", "1 pizza", [
			"une",
			"une seule",
			"juste une"
		]),
		edge("quantity", "drinks", "2 pizzas", [
			"deux",
			"deux pizzas",
			"une pour moi une pour ma femme",
			"deux margheritas"
		]),
		edge("quantity", "drinks", "3 pizzas", ["trois", "trois pizzas"]),
		edge("quantity", "handoff", "Beaucoup", [
			"beaucoup",
			"pour dix personnes",
			"un grand groupe"
		]),
		edge("drinks", "drink_choice", "Avec boisson", [
			"oui",
			"avec un coca",
			"oui volontiers",
			"une boisson"
		]),
		edge("drinks", "confirm", "Sans boisson", [
			"non",
			"sans boisson",
			"juste les pizzas",
			"rien à boire"
		]),
		edge("drink_choice", "confirm", "Coca", [
			"un coca",
			"coca",
			"coca zéro"
		]),
		edge("drink_choice", "confirm", "Eau", [
			"une eau",
			"de l’eau",
			"eau plate"
		]),
		edge("drink_choice", "confirm", "Diabolo", [
			"un diabolo",
			"diabolo fraise",
			"diabolo menthe"
		]),
		edge("drink_choice", "handoff", "Autre boisson", [
			"autre chose",
			"un jus",
			"de la bière"
		]),
		edge("confirm", "create", "Valider", [
			"oui",
			"c’est bon",
			"je valide",
			"parfait",
			"oui c’est ça"
		]),
		edge("confirm", "handoff", "Modifier", [
			"non",
			"attendez",
			"je veux changer",
			"pas tout à fait"
		]),
		edge("create", "end", "Créée", ["continuer"]),
		edge("info", "end", "Info", ["continuer"]),
		edge("handoff", "end", "Fin", ["continuer"])
	]
};
var nodeKindLabel = {
	start: "Accueil",
	say: "Message",
	branch: "Question",
	capture: "Saisie",
	action: "Action",
	handoff: "Handoff",
	end: "Fin"
};
var routeWithJevFn = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("6663944952862d7814213590b8c8e243037e90189fc6252f46fd7d319c19f73c"));
var publishFlowFn = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("752e218e47a458247bf9858b83541ee145c2a76039fcf2dc175c13a068a2f1f9"));
function messageId() {
	return globalThis.crypto.randomUUID();
}
function walk(flow, nodeId, slots, messages, visitedEdges) {
	const nextMessages = [...messages];
	const nextEdges = [...visitedEdges];
	let current = nodeId;
	for (let guard = 0; guard < 20; guard += 1) {
		const node = flow.nodes.find((item) => item.id === current);
		if (!node) break;
		nextMessages.push({
			id: messageId(),
			role: "agent",
			text: renderText(node.text, slots),
			meta: node.id
		});
		if (node.kind === "start" || node.kind === "branch" || node.kind === "capture" || node.kind === "handoff" || node.kind === "end") {
			if (node.kind === "handoff") nextMessages.push({
				id: messageId(),
				role: "system",
				text: "Message d'attente joué. Gemini Live prend le relais pour la suite."
			});
			return {
				currentId: current,
				messages: nextMessages,
				visitedEdges: nextEdges
			};
		}
		const out = flow.edges.filter((edge) => edge.from === node.id);
		if (out.length !== 1) return {
			currentId: current,
			messages: nextMessages,
			visitedEdges: nextEdges
		};
		nextEdges.push(out[0].id);
		current = out[0].to;
	}
	return {
		currentId: current,
		messages: nextMessages,
		visitedEdges: nextEdges
	};
}
var NODE_W = 204;
var NODE_H = 88;
function layoutFlow(flow) {
	const levels = /* @__PURE__ */ new Map();
	const start = flow.nodes.find((node) => node.kind === "start") ?? flow.nodes[0];
	levels.set(start.id, 0);
	const queue = [start.id];
	let guard = 0;
	while (queue.length > 0 && guard < 200) {
		guard += 1;
		const id = queue.shift();
		if (!id) break;
		const level = levels.get(id) ?? 0;
		for (const edge of flow.edges.filter((item) => item.from === id)) {
			const candidate = level + 1;
			const existing = levels.get(edge.to);
			if (existing === void 0 || candidate > existing) {
				levels.set(edge.to, candidate);
				queue.push(edge.to);
			}
		}
	}
	for (const node of flow.nodes) if (!levels.has(node.id)) levels.set(node.id, 0);
	const rows = /* @__PURE__ */ new Map();
	const positions = /* @__PURE__ */ new Map();
	for (const node of flow.nodes) {
		const level = levels.get(node.id) ?? 0;
		const row = rows.get(level) ?? 0;
		rows.set(level, row + 1);
		positions.set(node.id, {
			x: row * 238 + 24,
			y: level * 132 + 24
		});
	}
	const maxLevel = Math.max(...Array.from(levels.values()), 0);
	return {
		positions,
		width: (Math.max(...Array.from(rows.values()), 0) + 1) * 238 + 24,
		height: (maxLevel + 1) * 132 + 24
	};
}
var KIND_TONE = {
	start: "primary",
	say: "neutral",
	branch: "info",
	capture: "accent",
	action: "accent",
	handoff: "warning",
	end: "success"
};
function Studio() {
	const [flow, setFlow] = (0, import_react.useState)(() => structuredClone(sampleFlow));
	const [selectedId, setSelectedId] = (0, import_react.useState)("greeting");
	const [tab, setTab] = (0, import_react.useState)("sim");
	const [routerMode, setRouterMode] = (0, import_react.useState)("jev");
	const [published, setPublished] = (0, import_react.useState)(false);
	const [toast, setToast] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const program = (0, import_react.useMemo)(() => compileFlow(flow), [flow]);
	const layout = (0, import_react.useMemo)(() => layoutFlow(flow), [flow]);
	const [slots, setSlots] = (0, import_react.useState)({});
	const [input, setInput] = (0, import_react.useState)("");
	const [trace, setTrace] = (0, import_react.useState)([]);
	const [lastRoute, setLastRoute] = (0, import_react.useState)(null);
	const initial = (0, import_react.useMemo)(() => walk(flow, "greeting", {}, [], []), []);
	const [messages, setMessages] = (0, import_react.useState)(initial.messages);
	const [currentId, setCurrentId] = (0, import_react.useState)(initial.currentId);
	const [visitedEdges, setVisitedEdges] = (0, import_react.useState)(initial.visitedEdges);
	const scrollRef = (0, import_react.useRef)(null);
	const canvasRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		scrollRef.current?.scrollTo({
			top: scrollRef.current.scrollHeight,
			behavior: "smooth"
		});
	}, [messages]);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		const position = layout.positions.get(currentId);
		if (!canvas || !position) return;
		canvas.scrollTo({
			top: Math.max(0, position.y - canvas.clientHeight / 2 + NODE_H / 2),
			behavior: "smooth"
		});
	}, [currentId, layout]);
	const currentNode = flow.nodes.find((node) => node.id === currentId);
	const currentEdges = currentNode ? outgoingEdges(flow, currentNode.id) : [];
	const waiting = currentNode?.kind === "branch" || currentNode?.kind === "start" || currentNode?.kind === "capture";
	const atEnd = currentNode?.kind === "end" || currentNode?.kind === "handoff";
	function focusNode(id) {
		const canvas = canvasRef.current;
		const position = layout.positions.get(id);
		if (!canvas || !position) return;
		canvas.scrollTo({
			top: Math.max(0, position.y - canvas.clientHeight / 2 + NODE_H / 2),
			behavior: "smooth"
		});
	}
	function reset() {
		const fresh = walk(flow, "greeting", {}, [], []);
		setMessages(fresh.messages);
		setCurrentId(fresh.currentId);
		setVisitedEdges(fresh.visitedEdges);
		setSlots({});
		setTrace([]);
		setLastRoute(null);
		setInput("");
		setTab("sim");
	}
	async function send() {
		const text = input.trim();
		if (!text || !currentNode || busy) return;
		const clientMessage = {
			id: messageId(),
			role: "client",
			text
		};
		const nextMessages = [...messages, clientMessage];
		setInput("");
		if (currentNode.kind === "capture") {
			const nextSlots = { ...slots };
			if (currentNode.slot) nextSlots[currentNode.slot] = text;
			setSlots(nextSlots);
			const edge = flow.edges.find((item) => item.from === currentNode.id);
			if (!edge) {
				setMessages(nextMessages);
				return;
			}
			const result = walk(flow, edge.to, nextSlots, nextMessages, [...visitedEdges, edge.id]);
			setMessages(result.messages);
			setCurrentId(result.currentId);
			setVisitedEdges(result.visitedEdges);
			setTrace((current) => [...current, `capture:${currentNode.slot ?? "valeur"}`]);
			return;
		}
		if (currentEdges.length === 0) {
			setMessages(nextMessages);
			return;
		}
		setBusy(true);
		let route;
		if (routerMode === "jev") {
			setTrace((current) => [...current, "jev:appel"]);
			const history = nextMessages.slice(-6).map((message) => `${message.role}: ${message.text}`).join("\n");
			const result = await routeWithJevFn({ data: {
				state: `L'agent vient de demander : ${currentNode.text}\n${history}`,
				options: currentEdges.map((edge) => ({
					id: edge.id,
					description: `${edge.intent}. ${edge.examples.join(" ; ")}`
				}))
			} });
			if (result.ok) {
				const edge = result.index === null ? void 0 : currentEdges[result.index];
				route = edge ? {
					transitionId: edge.id,
					confidence: result.confidence,
					source: "jev",
					probabilities: currentEdges.map((item, index) => ({
						id: item.id,
						score: result.probabilities[index] ?? 0
					}))
				} : {
					transitionId: null,
					confidence: result.confidence,
					source: "none",
					probabilities: currentEdges.map((item, index) => ({
						id: item.id,
						score: result.probabilities[index] ?? 0
					})),
					reason: "hors_flux"
				};
				setTrace((current) => [...current, `jev:ok:${result.index === null ? "hors_flux" : result.index}`]);
			} else {
				route = routeLocally(program.states[currentNode.id], text, flow.fallback.threshold);
				setTrace((current) => [...current, `jev:erreur:${result.reason} → local`]);
			}
		} else {
			route = routeLocally(program.states[currentNode.id], text, flow.fallback.threshold);
			setTrace((current) => [...current, `local:${route.transitionId ?? "handoff"}`]);
		}
		setLastRoute(route);
		setBusy(false);
		const chosen = currentEdges.find((edge) => edge.id === route.transitionId);
		if (!chosen) {
			const handoffMessage = {
				id: messageId(),
				role: "system",
				text: `Aucun choix fiable (${Math.round(route.confidence * 100)} %). Passage à Gemini Live.`
			};
			const result = walk(flow, "handoff", slots, [...nextMessages, handoffMessage], visitedEdges);
			setMessages(result.messages);
			setCurrentId(result.currentId);
			setVisitedEdges(result.visitedEdges);
			return;
		}
		const nextSlots = {
			...slots,
			...slotValue(chosen.intent)
		};
		setSlots(nextSlots);
		const result = walk(flow, chosen.to, nextSlots, nextMessages, [...visitedEdges, chosen.id]);
		setMessages(result.messages);
		setCurrentId(result.currentId);
		setVisitedEdges(result.visitedEdges);
	}
	async function publish() {
		const nextVersion = flow.version + 1;
		const nextFlow = {
			...flow,
			version: nextVersion
		};
		const nextProgram = compileFlow(nextFlow);
		setFlow(nextFlow);
		setPublished(true);
		setToast(`Version ${nextVersion} compilée…`);
		const result = await publishFlowFn({ data: {
			tenant: "default",
			name: flow.name,
			program: nextProgram
		} });
		if (result.ok) setToast(`Version ${nextVersion} publiée · ${nextProgram.audio.length} messages audio`);
		else setToast(`Publication refusée : ${result.error}`);
		window.setTimeout(() => setToast(null), 5e3);
	}
	function updateNode(id, patch) {
		setFlow({
			...flow,
			nodes: flow.nodes.map((node) => node.id === id ? {
				...node,
				...patch
			} : node),
			version: flow.version
		});
	}
	function updateEdge(id, patch) {
		setFlow({
			...flow,
			edges: flow.edges.map((edge) => edge.id === id ? {
				...edge,
				...patch
			} : edge)
		});
	}
	function addEdge(from) {
		const target = "handoff";
		setFlow({
			...flow,
			edges: [...flow.edges, {
				id: `${from}__${target}__${messageId().slice(0, 6)}`,
				from,
				to: target,
				intent: "Nouvelle intention",
				examples: ["exemple de phrase client"]
			}]
		});
	}
	function removeEdge(id) {
		setFlow({
			...flow,
			edges: flow.edges.filter((edge) => edge.id !== id)
		});
	}
	const selectedNode = flow.nodes.find((node) => node.id === selectedId);
	const selectedEdges = selectedNode ? outgoingEdges(flow, selectedNode.id) : [];
	const totalCharacters = program.audio.reduce((sum, asset) => sum + asset.characters, 0);
	const estimatedSeconds = Math.round(totalCharacters / 14);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "studio",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "studio-top",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "studio-ident",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, { className: "brand-mark" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "studio-name",
							children: "Atelier"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "studio-sub",
							children: "Plateforme de dialogues"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "studio-flow",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: flow.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "studio-meta",
							children: published ? `Publié · v${flow.version}` : `Brouillon · v${flow.version}`
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "studio-actions",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: `studio-router ${routerMode === "jev" ? "is-jev" : ""}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "studio-router-dot" }),
									"Routeur ",
									routerMode === "jev" ? "JEV" : "local"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "btn btn-secondary btn-sm",
								type: "button",
								onClick: () => setRouterMode(routerMode === "jev" ? "local" : "jev"),
								children: "Changer"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "btn btn-primary btn-sm",
								type: "button",
								onClick: () => void publish(),
								children: ["Publier v", flow.version + 1]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "studio-body",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "studio-stage",
					"aria-label": "Graphe de dialogue",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "studio-stage-head",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mono",
							children: [
								flow.nodes.length,
								" nœuds · ",
								flow.edges.length,
								" sorties"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mono",
							children: [
								"seuil ",
								Math.round(flow.fallback.threshold * 100),
								" %"
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "studio-canvas",
						ref: canvasRef,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "studio-graph",
							style: {
								width: layout.width,
								height: layout.height
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
								className: "studio-edges",
								width: layout.width,
								height: layout.height,
								"aria-hidden": "true",
								children: flow.edges.map((edge) => {
									const from = layout.positions.get(edge.from);
									const to = layout.positions.get(edge.to);
									if (!from || !to) return null;
									const x1 = from.x + NODE_W / 2;
									const y1 = from.y + NODE_H;
									const x2 = to.x + NODE_W / 2;
									const y2 = to.y;
									const active = visitedEdges.includes(edge.id);
									const showLabel = outgoingEdges(flow, edge.from).length > 1;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
										className: active ? "is-active" : void 0,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
												d: `M ${x1} ${y1} C ${x1} ${y1 + 42}, ${x2} ${y2 - 42}, ${x2} ${y2}`,
												className: "studio-edge-path"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
												cx: x2,
												cy: y2 - 4,
												r: "2.5",
												className: "studio-edge-dot"
											}),
											showLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
												x: x1 * .45 + x2 * .55,
												y: y1 * .45 + y2 * .55,
												textAnchor: "middle",
												className: "studio-edge-label",
												children: edge.intent.length > 22 ? `${edge.intent.slice(0, 21)}…` : edge.intent
											}) : null
										]
									}, edge.id);
								})
							}), flow.nodes.map((node) => {
								const position = layout.positions.get(node.id);
								if (!position) return null;
								const active = node.id === currentId;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: `studio-node tone-${KIND_TONE[node.kind]}${active ? " is-current" : ""}`,
									style: {
										left: position.x,
										top: position.y
									},
									onClick: () => {
										setSelectedId(node.id);
										setTab("node");
										focusNode(node.id);
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "studio-node-kind",
											children: nodeKindLabel[node.kind]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "studio-node-title",
											children: node.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "studio-node-text",
											children: node.text
										}),
										active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "studio-node-live",
											children: "En cours"
										}) : null
									]
								}, node.id);
							})]
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "studio-side",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "studio-tabs",
							role: "tablist",
							"aria-label": "Panneaux de l'atelier",
							children: [
								["sim", "Simulateur"],
								["program", "Programme"],
								["audio", "Voix"],
								["node", "Nœud"]
							].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								role: "tab",
								"aria-selected": tab === value,
								className: `studio-tab${tab === value ? " is-active" : ""}`,
								onClick: () => setTab(value),
								children: label
							}, value))
						}),
						tab === "sim" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "studio-sim",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "studio-sim-head",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mono",
										children: [
											currentNode ? nodeKindLabel[currentNode.kind] : "Fin",
											" · ",
											currentId
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "btn btn-ghost btn-sm",
										type: "button",
										onClick: reset,
										children: "Recommencer"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "studio-chat",
									ref: scrollRef,
									children: messages.map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: `studio-msg is-${message.role}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "studio-msg-role",
												children: message.role === "agent" ? "Agent" : message.role === "client" ? "Client" : "Système"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: message.text }),
											message.meta && message.role === "agent" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "studio-msg-meta",
												children: message.meta
											}) : null
										]
									}, message.id))
								}),
								lastRoute ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "studio-route",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "studio-route-head",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `badge ${lastRoute.source === "jev" ? "badge-ready" : "badge-outline"}`,
												children: lastRoute.source
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "mono",
												children: [Math.round(lastRoute.confidence * 100), " % de confiance"]
											})]
										}),
										lastRoute.probabilities.slice(0, 4).map((item) => {
											const edge = flow.edges.find((entry) => entry.id === item.id);
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "studio-prob",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: edge?.intent ?? item.id }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "studio-prob-bar",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { width: `${Math.min(100, item.score * 100)}%` } })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "mono",
														children: Math.round(item.score * 100)
													})
												]
											}, item.id);
										}),
										lastRoute.reason ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "studio-hint",
											children: ["Motif : ", lastRoute.reason]
										}) : null
									]
								}) : null,
								waiting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									className: "studio-input",
									onSubmit: (event) => {
										event.preventDefault();
										send();
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: input,
										onChange: (event) => setInput(event.target.value),
										placeholder: currentNode?.kind === "capture" ? "Réponse libre du client…" : "Ce que dit le client…",
										"aria-label": "Réponse du client"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "btn btn-primary btn-sm",
										type: "submit",
										disabled: busy,
										children: busy ? "…" : "Envoyer"
									})]
								}) : atEnd ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "studio-sim-end",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "studio-hint",
										children: currentNode?.kind === "handoff" ? "La conversation continue dans Gemini Live." : "L'appel est terminé."
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "btn btn-secondary btn-sm",
										type: "button",
										onClick: reset,
										children: "Nouvel appel"
									})]
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "studio-trace",
									children: trace.slice(-4).map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mono",
										children: item
									}, `${item}-${index}`))
								})
							]
						}) : null,
						tab === "program" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "studio-code",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "studio-code-head",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mono",
									children: [
										"programme v",
										program.version,
										" · ",
										Object.keys(program.states).length,
										" états"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-ghost btn-sm",
									type: "button",
									onClick: () => {
										navigator.clipboard.writeText(JSON.stringify(program, null, 2));
										setToast("Programme copié");
										window.setTimeout(() => setToast(null), 2500);
									},
									children: "Copier"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { children: JSON.stringify(program, null, 2) })]
						}) : null,
						tab === "audio" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "studio-audio",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "studio-audio-stats",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mono",
											children: "Messages"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: program.audio.length })] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mono",
											children: "Caractères"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: totalCharacters })] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mono",
											children: "Durée estimée"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
											Math.floor(estimatedSeconds / 60),
											":",
											String(estimatedSeconds % 60).padStart(2, "0")
										] })] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn btn-primary btn-block",
									type: "button",
									disabled: true,
									children: "Générer les voix (TTS à brancher)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "studio-hint",
									children: "Les messages sont générés une fois par version. Le handoff utilise le message d'attente global."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "studio-audio-list",
									children: program.audio.map((asset) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: asset.key }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: asset.text })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mono",
										children: asset.characters
									})] }, asset.key))
								})
							]
						}) : null,
						tab === "node" && selectedNode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "studio-inspector",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "studio-inspector-head",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `studio-node-kind tone-${KIND_TONE[selectedNode.kind]}`,
										children: nodeKindLabel[selectedNode.kind]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mono",
										children: selectedNode.id
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "field",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "node-title",
										children: "Titre"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "node-title",
										value: selectedNode.title,
										onChange: (event) => updateNode(selectedNode.id, { title: event.target.value })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "field",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "node-text",
										children: "Message dit par l'agent"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										id: "node-text",
										rows: 4,
										value: selectedNode.text,
										onChange: (event) => updateNode(selectedNode.id, { text: event.target.value })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "studio-inspector-edges",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "studio-inspector-label",
											children: [
												"Sorties (",
												selectedEdges.length,
												")"
											]
										}),
										selectedEdges.map((edge) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "studio-edge-card",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "studio-edge-card-head",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														className: "cell-input",
														value: edge.intent,
														"aria-label": "Intention",
														onChange: (event) => updateEdge(edge.id, { intent: event.target.value })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "mono",
														children: ["→ ", edge.to]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														className: "row-remove",
														type: "button",
														"aria-label": "Supprimer la sortie",
														onClick: () => removeEdge(edge.id),
														children: "×"
													})
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												className: "studio-edge-examples",
												value: edge.examples.join("\n"),
												"aria-label": "Exemples de phrases client",
												onChange: (event) => updateEdge(edge.id, { examples: event.target.value.split("\n").map((line) => line.trim()).filter(Boolean) })
											})]
										}, edge.id)),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "btn btn-secondary btn-sm",
											type: "button",
											onClick: () => addEdge(selectedNode.id),
											children: "Ajouter une sortie"
										})
									]
								})
							]
						}) : null
					]
				})]
			}),
			toast ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "studio-toast",
				role: "status",
				children: toast
			}) : null
		]
	});
}
export { Studio as component };
