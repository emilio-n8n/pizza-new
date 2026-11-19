import { createServerRpc } from "./createServerRpc-cwhBdcVU.mjs";
import { createServerFn } from "./ssr.mjs";
import { getSessionPayload } from "./auth.server-CflMbcf0.mjs";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
// node_modules/.nitro/vite/services/ssr/assets/publish-B5QDfLNt.js
function admins() {
	return (process.env.ATELIER_ADMINS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}
var publishFlowFn_createServerFn_handler = createServerRpc({
	id: "752e218e47a458247bf9858b83541ee145c2a76039fcf2dc175c13a068a2f1f9",
	name: "publishFlowFn",
	filename: "src/server/publish.ts"
}, (opts) => publishFlowFn.__executeServer(opts));
var publishFlowFn = createServerFn({ method: "POST" }).validator((data) => data).handler(publishFlowFn_createServerFn_handler, async ({ data }) => {
	const allowed = admins();
	if (allowed.length > 0) {
		const session = await getSessionPayload();
		if (!session || !allowed.includes(session.user.email.toLowerCase())) return {
			ok: false,
			error: "Accès Atelier non autorisé."
		};
	}
	const tenant = data.tenant.replace(/[^0-9a-zA-Z_-]/g, "") || "default";
	const root = resolve(process.env.RUNTIME_DATA_DIR ?? "runtime/data", "tenants", tenant);
	mkdirSync(join(root, "audio"), { recursive: true });
	writeFileSync(join(root, "program.json"), JSON.stringify(data.program, null, 2), "utf8");
	writeFileSync(join(root, "meta.json"), JSON.stringify({ name: data.name }, null, 2), "utf8");
	return {
		ok: true,
		path: root
	};
});
export { publishFlowFn_createServerFn_handler };
