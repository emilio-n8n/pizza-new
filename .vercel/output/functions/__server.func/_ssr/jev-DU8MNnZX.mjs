import { createServerRpc } from "./createServerRpc-cwhBdcVU.mjs";
import { createServerFn } from "./ssr.mjs";
// node_modules/.nitro/vite/services/ssr/assets/jev-DU8MNnZX.js
var ENDPOINT = process.env.JEV_ENDPOINT ?? "https://opencode.ai/inference/systemone/v1/systemone";
var MODEL = process.env.JEV_MODEL ?? "jev-1.13-free";
var KEY = process.env.JEV_API_KEY ?? "public";
var routeWithJevFn_createServerFn_handler = createServerRpc({
	id: "6663944952862d7814213590b8c8e243037e90189fc6252f46fd7d319c19f73c",
	name: "routeWithJevFn",
	filename: "src/server/jev.ts"
}, (opts) => routeWithJevFn.__executeServer(opts));
var routeWithJevFn = createServerFn({ method: "POST" }).validator((data) => data).handler(routeWithJevFn_createServerFn_handler, async ({ data }) => {
	if (data.options.length === 0) return {
		ok: false,
		reason: "no_options"
	};
	const criteria = {};
	data.options.forEach((option, index) => {
		criteria[`option_${index}`] = option.description;
	});
	criteria.hors_flux = "Le client dit quelque chose qui ne correspond à aucune option du graphe.";
	try {
		const response = await fetch(ENDPOINT, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${KEY}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				model: MODEL,
				state: data.state,
				questions: { next: {
					type: "choice",
					instructions: "Choisis la prochaine étape de la conversation. Si aucune option ne correspond vraiment, choisis hors_flux.",
					criteria
				} }
			})
		});
		if (!response.ok) return {
			ok: false,
			reason: `http_${response.status}`
		};
		const answer = (await response.json()).answers?.next;
		if (!answer?.choice) return {
			ok: false,
			reason: "missing_choice"
		};
		const probabilities = data.options.map((_, index) => answer.probabilities?.[`option_${index}`] ?? 0);
		if (answer.choice === "hors_flux") return {
			ok: true,
			index: null,
			confidence: answer.confidence ?? 0,
			probabilities
		};
		const index = Number.parseInt(answer.choice.replace("option_", ""), 10);
		if (!Number.isInteger(index) || index < 0 || index >= data.options.length) return {
			ok: false,
			reason: "choice_out_of_range"
		};
		return {
			ok: true,
			index,
			confidence: answer.confidence ?? answer.probabilities?.[`option_${index}`] ?? 0,
			probabilities
		};
	} catch (error) {
		return {
			ok: false,
			reason: error instanceof Error ? error.message : "network_error"
		};
	}
});
export { routeWithJevFn_createServerFn_handler };
