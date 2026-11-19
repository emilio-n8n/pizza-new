import { createServerRpc } from "./createServerRpc-cwhBdcVU.mjs";
import { createServerFn } from "./ssr.mjs";
import { activateLocation, completeOrder, createDriver, createUser, defaultDelivery, defaultHours, driverOrders, endSession, findDriverByToken, findLocationById, findUserByEmail, getOrderById, getOrderByToken, getSessionPayload, hashPassword, listDrivers, listOrders, removeMenuItem, setDriverActive, setMenu, startSession, takeOrder, updateMenuItem, updateOrderStatus, upsertLocation, verifyPassword } from "./auth.server-CflMbcf0.mjs";
import { randomUUID } from "node:crypto";
import { copyFileSync, cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
// node_modules/.nitro/vite/services/ssr/assets/api-qZ1tlSK0.js
var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var getSessionFn_createServerFn_handler = createServerRpc({
	id: "1bf0614bbb2e4af5e748219a694c1b57b9f635ed84171bd9c223a0f9d9b38e95",
	name: "getSessionFn",
	filename: "src/server/api.ts"
}, (opts) => getSessionFn.__executeServer(opts));
var getSessionFn = createServerFn({ method: "GET" }).handler(getSessionFn_createServerFn_handler, async () => await getSessionPayload());
var signupFn_createServerFn_handler = createServerRpc({
	id: "f2c779d3bc8b972db1d8f7e5ff0b9e3a9e8a9dcf17cfd7b3a70f4dee9f2fb0de",
	name: "signupFn",
	filename: "src/server/api.ts"
}, (opts) => signupFn.__executeServer(opts));
var signupFn = createServerFn({ method: "POST" }).validator((data) => data).handler(signupFn_createServerFn_handler, async ({ data }) => {
	const name = data.name?.trim() ?? "";
	const email = data.email?.trim().toLowerCase() ?? "";
	const password = data.password ?? "";
	if (name.length < 2) return {
		ok: false,
		error: "Indiquez votre nom."
	};
	if (!EMAIL.test(email)) return {
		ok: false,
		error: "Cet email n’est pas valide."
	};
	if (password.length < 8) return {
		ok: false,
		error: "Le mot de passe doit faire au moins 8 caractères."
	};
	if (await findUserByEmail(email)) return {
		ok: false,
		error: "Un compte existe déjà avec cet email. Connectez-vous."
	};
	const user = await createUser({
		email,
		name,
		passwordHash: hashPassword(password)
	});
	await startSession(user.id);
	return { ok: true };
});
var loginFn_createServerFn_handler = createServerRpc({
	id: "a7078e7cf121c19443bab6ec059bad5c3f626b0349808d0282a47651389bea8b",
	name: "loginFn",
	filename: "src/server/api.ts"
}, (opts) => loginFn.__executeServer(opts));
var loginFn = createServerFn({ method: "POST" }).validator((data) => data).handler(loginFn_createServerFn_handler, async ({ data }) => {
	const email = data.email?.trim().toLowerCase() ?? "";
	const user = await findUserByEmail(email);
	if (!user || !verifyPassword(data.password ?? "", user.passwordHash)) return {
		ok: false,
		error: "Email ou mot de passe incorrect."
	};
	await startSession(user.id);
	return { ok: true };
});
var logoutFn_createServerFn_handler = createServerRpc({
	id: "b9049e4e75faa7cad4bb0cf1fc0401666a250174d97d5650d63d12597c623f0e",
	name: "logoutFn",
	filename: "src/server/api.ts"
}, (opts) => logoutFn.__executeServer(opts));
var logoutFn = createServerFn({ method: "POST" }).handler(logoutFn_createServerFn_handler, async () => {
	await endSession();
	return { ok: true };
});
var saveEstablishmentFn_createServerFn_handler = createServerRpc({
	id: "79ce39ae59c7e0814b3fcab6c8d76f4886bcc827bd4201707fa585be80e03afc",
	name: "saveEstablishmentFn",
	filename: "src/server/api.ts"
}, (opts) => saveEstablishmentFn.__executeServer(opts));
var saveEstablishmentFn = createServerFn({ method: "POST" }).validator((data) => data).handler(saveEstablishmentFn_createServerFn_handler, async ({ data }) => {
	const session = await getSessionPayload();
	if (!session) return {
		ok: false,
		error: "Session expirée."
	};
	const name = data.name.trim();
	const address = data.address.trim();
	if (name.length < 2) return {
		ok: false,
		error: "Indiquez le nom de la pizzeria."
	};
	if (address.length < 4) return {
		ok: false,
		error: "Indiquez l’adresse."
	};
	return {
		ok: true,
		location: await upsertLocation(session.user.id, {
			name,
			address,
			postalCode: data.postalCode.trim(),
			city: data.city.trim(),
			cuisine: data.cuisine.trim(),
			phone: data.phone.trim(),
			hours: session.location?.hours ?? defaultHours(),
			delivery: session.location?.delivery ?? defaultDelivery(),
			onboardingStep: Math.max(session.location?.onboardingStep ?? 1, 2)
		})
	};
});
var saveMenuFn_createServerFn_handler = createServerRpc({
	id: "10d4cc497aec497aa8dee92157198f3e774dcce63eb31a115029e13825b023f6",
	name: "saveMenuFn",
	filename: "src/server/api.ts"
}, (opts) => saveMenuFn.__executeServer(opts));
var saveMenuFn = createServerFn({ method: "POST" }).validator((data) => data).handler(saveMenuFn_createServerFn_handler, async ({ data }) => {
	const session = await getSessionPayload();
	if (!session) return {
		ok: false,
		error: "Session expirée."
	};
	const items = data.items.filter((item) => item.name.trim().length > 0 && item.priceCents >= 0).map((item) => ({
		id: item.id || randomUUID(),
		category: item.category.trim() || "Pizza",
		name: item.name.trim(),
		description: item.description.trim(),
		priceCents: Math.round(item.priceCents),
		available: item.available !== false
	}));
	if (items.length === 0) return {
		ok: false,
		error: "Ajoutez au moins un produit."
	};
	const location = await setMenu(session.user.id, items);
	await upsertLocation(session.user.id, { onboardingStep: Math.max(location.onboardingStep, 3) });
	return {
		ok: true,
		menu: items
	};
});
var saveServiceFn_createServerFn_handler = createServerRpc({
	id: "7217a62fcf089e74bd904cc103f670970135bc91e3662b04e9bd3cf912ef43db",
	name: "saveServiceFn",
	filename: "src/server/api.ts"
}, (opts) => saveServiceFn.__executeServer(opts));
var saveServiceFn = createServerFn({ method: "POST" }).validator((data) => data).handler(saveServiceFn_createServerFn_handler, async ({ data }) => {
	const session = await getSessionPayload();
	if (!session) return {
		ok: false,
		error: "Session expirée."
	};
	const hours = data.hours.filter((day) => day.day >= 0 && day.day <= 6).map((day) => ({
		day: day.day,
		closed: Boolean(day.closed),
		open: day.open || "11:30",
		close: day.close || "22:30"
	}));
	const delivery = {
		enabled: Boolean(data.delivery.enabled),
		feeCents: Math.max(0, Math.round(data.delivery.feeCents)),
		minOrderCents: Math.max(0, Math.round(data.delivery.minOrderCents)),
		radiusKm: Math.max(0, Number(data.delivery.radiusKm) || 0),
		postalCodes: data.delivery.postalCodes.trim()
	};
	await upsertLocation(session.user.id, {
		hours: hours.length === 7 ? hours : defaultHours(),
		delivery,
		onboardingStep: Math.max(session.location?.onboardingStep ?? 3, 4)
	});
	return { ok: true };
});
function digits(value) {
	return value.replace(/\D/g, "");
}
function provisionRuntime(location) {
	const number = digits(location.twilioNumber);
	if (!number) return null;
	const tenants = resolve(process.env.RUNTIME_DATA_DIR ?? "runtime/data", "tenants");
	const source = join(tenants, "default", "program.json");
	if (!existsSync(source)) return null;
	const target = join(tenants, number);
	mkdirSync(join(target, "audio"), { recursive: true });
	copyFileSync(source, join(target, "program.json"));
	const sourceAudio = join(tenants, "default", "audio");
	if (existsSync(sourceAudio)) cpSync(sourceAudio, join(target, "audio"), { recursive: true });
	writeFileSync(join(target, "meta.json"), JSON.stringify({
		name: location.name,
		locationId: location.id
	}, null, 2), "utf8");
	return {
		path: target,
		number
	};
}
var activateFn_createServerFn_handler = createServerRpc({
	id: "02dd9e49f3d1d3d78f47d1d071b847f9b8ff65dc435c913b374b9b6cf27a0752",
	name: "activateFn",
	filename: "src/server/api.ts"
}, (opts) => activateFn.__executeServer(opts));
var activateFn = createServerFn({ method: "POST" }).validator((data) => data).handler(activateFn_createServerFn_handler, async ({ data }) => {
	const session = await getSessionPayload();
	if (!session) return {
		ok: false,
		error: "Session expirée."
	};
	if (!session.location || session.location.menu.length === 0) return {
		ok: false,
		error: "Ajoutez au moins un produit au menu."
	};
	if (data.twilioNumber) await upsertLocation(session.user.id, { twilioNumber: data.twilioNumber.trim() });
	const location = await activateLocation(session.user.id);
	return {
		ok: true,
		location,
		provisioned: provisionRuntime({
			id: location.id,
			name: location.name,
			twilioNumber: location.twilioNumber
		})
	};
});
var saveTelephonyFn_createServerFn_handler = createServerRpc({
	id: "9961d8d256001c447f5e749910875b883264adde55cadf1b4c16e0c9e96cee9f",
	name: "saveTelephonyFn",
	filename: "src/server/api.ts"
}, (opts) => saveTelephonyFn.__executeServer(opts));
var saveTelephonyFn = createServerFn({ method: "POST" }).validator((data) => data).handler(saveTelephonyFn_createServerFn_handler, async ({ data }) => {
	const session = await getSessionPayload();
	if (!session) return {
		ok: false,
		error: "Session expirée."
	};
	const location = await upsertLocation(session.user.id, { twilioNumber: data.twilioNumber.trim() });
	return {
		ok: true,
		location,
		provisioned: provisionRuntime({
			id: location.id,
			name: location.name,
			twilioNumber: location.twilioNumber
		})
	};
});
var updateMenuItemFn_createServerFn_handler = createServerRpc({
	id: "2e263e65fe7e7cc8255c9e30a2bb2d84ad210e5156ffca866e8600225a31ce86",
	name: "updateMenuItemFn",
	filename: "src/server/api.ts"
}, (opts) => updateMenuItemFn.__executeServer(opts));
var updateMenuItemFn = createServerFn({ method: "POST" }).validator((data) => data).handler(updateMenuItemFn_createServerFn_handler, async ({ data }) => {
	const session = await getSessionPayload();
	if (!session) return {
		ok: false,
		error: "Session expirée."
	};
	return {
		ok: true,
		menu: (await updateMenuItem(session.user.id, data.id, data.patch))?.menu ?? []
	};
});
var addMenuItemFn_createServerFn_handler = createServerRpc({
	id: "11b6118e4139de037fd7fd3ece78b39d06dbc0a39bade830738e4afa86cad335",
	name: "addMenuItemFn",
	filename: "src/server/api.ts"
}, (opts) => addMenuItemFn.__executeServer(opts));
var addMenuItemFn = createServerFn({ method: "POST" }).validator((data) => data).handler(addMenuItemFn_createServerFn_handler, async ({ data }) => {
	const session = await getSessionPayload();
	if (!session?.location) return {
		ok: false,
		error: "Session expirée."
	};
	const item = {
		...data,
		id: randomUUID()
	};
	return {
		ok: true,
		menu: (await setMenu(session.user.id, [...session.location.menu, item]))?.menu ?? []
	};
});
var removeMenuItemFn_createServerFn_handler = createServerRpc({
	id: "02943e86b7eac47cec9a9bd2b2a862d753dac46640310f753bb4fa1035e6d1b6",
	name: "removeMenuItemFn",
	filename: "src/server/api.ts"
}, (opts) => removeMenuItemFn.__executeServer(opts));
var removeMenuItemFn = createServerFn({ method: "POST" }).validator((data) => data).handler(removeMenuItemFn_createServerFn_handler, async ({ data }) => {
	const session = await getSessionPayload();
	if (!session) return {
		ok: false,
		error: "Session expirée."
	};
	return {
		ok: true,
		menu: (await removeMenuItem(session.user.id, data.id))?.menu ?? []
	};
});
var getDashboardFn_createServerFn_handler = createServerRpc({
	id: "3cda5b4262142790a17f14a6c29d70ecc608317af6dde237c9cad4cd24e78db1",
	name: "getDashboardFn",
	filename: "src/server/api.ts"
}, (opts) => getDashboardFn.__executeServer(opts));
var getDashboardFn = createServerFn({ method: "GET" }).handler(getDashboardFn_createServerFn_handler, async () => {
	const session = await getSessionPayload();
	if (!session) return null;
	const orders = await listOrders(session.user.id);
	return {
		user: session.user,
		location: session.location,
		orders
	};
});
var getMenuFn_createServerFn_handler = createServerRpc({
	id: "d35f2014dd4a6766dd21ea0f74cb4f5914be9dc5f7b2f8f05004bcc918d59cf6",
	name: "getMenuFn",
	filename: "src/server/api.ts"
}, (opts) => getMenuFn.__executeServer(opts));
var getMenuFn = createServerFn({ method: "GET" }).handler(getMenuFn_createServerFn_handler, async () => {
	const session = await getSessionPayload();
	if (!session?.location) return null;
	return { location: session.location };
});
var getTrackingFn_createServerFn_handler = createServerRpc({
	id: "a7ab0db4ff7e1412f496847b2e5cf6766262086295ccb46ca8cc0f3655f7bb28",
	name: "getTrackingFn",
	filename: "src/server/api.ts"
}, (opts) => getTrackingFn.__executeServer(opts));
var getTrackingFn = createServerFn({ method: "GET" }).validator((data) => data).handler(getTrackingFn_createServerFn_handler, async ({ data }) => {
	const order = await getOrderByToken(data.token);
	if (!order) return null;
	const location = await findLocationById(order.locationId);
	return {
		order,
		location: location ? {
			name: location.name,
			address: location.address,
			city: location.city,
			phone: location.phone
		} : null
	};
});
var getDriverViewFn_createServerFn_handler = createServerRpc({
	id: "e3dcee04d2c9f07b656be7c1fdc2f374c58dc8fb7bf9469d0cb1b6b154960893",
	name: "getDriverViewFn",
	filename: "src/server/api.ts"
}, (opts) => getDriverViewFn.__executeServer(opts));
var getDriverViewFn = createServerFn({ method: "GET" }).validator((data) => data).handler(getDriverViewFn_createServerFn_handler, async ({ data }) => {
	const driver = await findDriverByToken(data.token);
	if (!driver || !driver.active) return null;
	const location = await findLocationById(driver.locationId);
	const orders = await driverOrders(driver);
	return {
		driver: {
			id: driver.id,
			name: driver.name,
			phone: driver.phone
		},
		location: location ? {
			name: location.name,
			address: location.address,
			city: location.city
		} : null,
		available: orders.available,
		active: orders.active
	};
});
var takeDeliveryFn_createServerFn_handler = createServerRpc({
	id: "dfbe7cee8aec0625561e25d82ad313433d138f86efe9d3ee53d6939201ee8d0d",
	name: "takeDeliveryFn",
	filename: "src/server/api.ts"
}, (opts) => takeDeliveryFn.__executeServer(opts));
var takeDeliveryFn = createServerFn({ method: "POST" }).validator((data) => data).handler(takeDeliveryFn_createServerFn_handler, async ({ data }) => {
	if (!await takeOrder(data.token, data.orderId)) return {
		ok: false,
		error: "Course indisponible."
	};
	return { ok: true };
});
var completeDeliveryFn_createServerFn_handler = createServerRpc({
	id: "9c7ff7e5835e4cdd771e6dcaf213871eca638cb80646eb2271996393b88fac7f",
	name: "completeDeliveryFn",
	filename: "src/server/api.ts"
}, (opts) => completeDeliveryFn.__executeServer(opts));
var completeDeliveryFn = createServerFn({ method: "POST" }).validator((data) => data).handler(completeDeliveryFn_createServerFn_handler, async ({ data }) => {
	if (!await completeOrder(data.token, data.orderId)) return {
		ok: false,
		error: "Course introuvable."
	};
	return { ok: true };
});
var listDriversFn_createServerFn_handler = createServerRpc({
	id: "c62d4adcc7e40c52e9715fb10fe962930cbd87bdd92f43e1b084ca15318c0d8e",
	name: "listDriversFn",
	filename: "src/server/api.ts"
}, (opts) => listDriversFn.__executeServer(opts));
var listDriversFn = createServerFn({ method: "GET" }).handler(listDriversFn_createServerFn_handler, async () => {
	const session = await getSessionPayload();
	if (!session?.location) return [];
	return (await listDrivers(session.location.id)).map((driver) => ({
		id: driver.id,
		name: driver.name,
		phone: driver.phone,
		token: driver.token,
		active: driver.active
	}));
});
var createDriverFn_createServerFn_handler = createServerRpc({
	id: "4918986a155e9f93b000b5b59e661e70759dd3a67aa99040c013434d9bc2ceac",
	name: "createDriverFn",
	filename: "src/server/api.ts"
}, (opts) => createDriverFn.__executeServer(opts));
var createDriverFn = createServerFn({ method: "POST" }).validator((data) => data).handler(createDriverFn_createServerFn_handler, async ({ data }) => {
	const session = await getSessionPayload();
	if (!session?.location) return {
		ok: false,
		error: "Session expirée."
	};
	if (data.name.trim().length < 2) return {
		ok: false,
		error: "Indiquez le prénom du livreur."
	};
	return {
		ok: true,
		driver: await createDriver({
			locationId: session.location.id,
			name: data.name,
			phone: data.phone
		})
	};
});
var toggleDriverFn_createServerFn_handler = createServerRpc({
	id: "f394ba91d4ee49e3a8fba046053375ac1e0c77664f61c5d301e84ea3418bd271",
	name: "toggleDriverFn",
	filename: "src/server/api.ts"
}, (opts) => toggleDriverFn.__executeServer(opts));
var toggleDriverFn = createServerFn({ method: "POST" }).validator((data) => data).handler(toggleDriverFn_createServerFn_handler, async ({ data }) => {
	const session = await getSessionPayload();
	if (!session?.location) return {
		ok: false,
		error: "Session expirée."
	};
	const driver = await setDriverActive(data.id, data.active);
	if (!driver || driver.locationId !== session.location.id) return {
		ok: false,
		error: "Livreur introuvable."
	};
	return { ok: true };
});
var updateOrderStatusFn_createServerFn_handler = createServerRpc({
	id: "091c8d4512633807340786b9a8c840325fdae7daa52580cc0a287df2ba090670",
	name: "updateOrderStatusFn",
	filename: "src/server/api.ts"
}, (opts) => updateOrderStatusFn.__executeServer(opts));
var updateOrderStatusFn = createServerFn({ method: "POST" }).validator((data) => data).handler(updateOrderStatusFn_createServerFn_handler, async ({ data }) => {
	const session = await getSessionPayload();
	if (!session?.location) return {
		ok: false,
		error: "Session expirée."
	};
	const order = await getOrderById(data.orderId);
	if (!order || order.locationId !== session.location.id) return {
		ok: false,
		error: "Commande introuvable."
	};
	return await updateOrderStatus(order.id, data.status) ? { ok: true } : {
		ok: false,
		error: "Mise à jour impossible."
	};
});
export { activateFn_createServerFn_handler, addMenuItemFn_createServerFn_handler, completeDeliveryFn_createServerFn_handler, createDriverFn_createServerFn_handler, getDashboardFn_createServerFn_handler, getDriverViewFn_createServerFn_handler, getMenuFn_createServerFn_handler, getSessionFn_createServerFn_handler, getTrackingFn_createServerFn_handler, listDriversFn_createServerFn_handler, loginFn_createServerFn_handler, logoutFn_createServerFn_handler, removeMenuItemFn_createServerFn_handler, saveEstablishmentFn_createServerFn_handler, saveMenuFn_createServerFn_handler, saveServiceFn_createServerFn_handler, saveTelephonyFn_createServerFn_handler, signupFn_createServerFn_handler, takeDeliveryFn_createServerFn_handler, toggleDriverFn_createServerFn_handler, updateMenuItemFn_createServerFn_handler, updateOrderStatusFn_createServerFn_handler };
