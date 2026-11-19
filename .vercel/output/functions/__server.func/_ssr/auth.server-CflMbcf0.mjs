import { deleteCookie, getCookie, setCookie } from "./ssr.mjs";
import { createClient } from "../_libs/supabase__supabase-js.mjs";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
// node_modules/.nitro/vite/services/ssr/assets/auth.server-CflMbcf0.js
function defaultHours() {
	return [
		{
			day: 1,
			closed: false,
			open: "11:30",
			close: "14:30"
		},
		{
			day: 2,
			closed: false,
			open: "11:30",
			close: "14:30"
		},
		{
			day: 3,
			closed: false,
			open: "11:30",
			close: "14:30"
		},
		{
			day: 4,
			closed: false,
			open: "11:30",
			close: "14:30"
		},
		{
			day: 5,
			closed: false,
			open: "11:30",
			close: "14:30"
		},
		{
			day: 6,
			closed: false,
			open: "11:30",
			close: "14:30"
		},
		{
			day: 0,
			closed: false,
			open: "18:00",
			close: "22:30"
		}
	];
}
function defaultDelivery() {
	return {
		enabled: true,
		feeCents: 250,
		minOrderCents: 1500,
		radiusKm: 4,
		postalCodes: ""
	};
}
var DAY_LABELS = [
	"Dimanche",
	"Lundi",
	"Mardi",
	"Mercredi",
	"Jeudi",
	"Vendredi",
	"Samedi"
];
function operatorCodes(number) {
	const digits = number.replace(/\s+/g, "");
	return [
		{
			name: "Orange / Sosh",
			code: `**21*${digits}#`
		},
		{
			name: "SFR / Red",
			code: `*21*${digits}#`
		},
		{
			name: "Bouygues",
			code: `*61*${digits}#`
		},
		{
			name: "Free",
			code: `*21*${digits}#`
		}
	];
}
function formatPriceInput(cents) {
	return (cents / 100).toFixed(2).replace(".", ",");
}
function parsePriceInput(value) {
	const parsed = Number.parseFloat(value.replace(",", ".").replace(/[^\d.]/g, ""));
	return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}
/**
* Accès aux données via Supabase (Postgres).
*
* Toutes les fonctions sont asynchrones : elles étaient synchrones quand les
* données vivaient dans un fichier JSON en mémoire. Les appelants doivent donc
* les attendre.
*
* Le client utilise la clé service_role : il contourne RLS, ce qui est voulu —
* il ne vit que côté serveur, jamais dans un bundle navigateur.
*/
var TEST_NUMBER = process.env.PV_TEST_NUMBER ?? "01 89 71 33 56";
var client = null;
function db() {
	if (client) return client;
	const url = process.env.SUPABASE_URL ?? "";
	const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "";
	if (!url || !key) throw new Error("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (voir .env).");
	client = createClient(url, key, { auth: {
		persistSession: false,
		autoRefreshToken: false
	} });
	return client;
}
function fail(scope, error) {
	console.error(`[store] ${scope}`, error);
}
function rowToUser(row) {
	return {
		id: row.id,
		email: row.email,
		name: row.name,
		passwordHash: row.password_hash,
		createdAt: row.created_at
	};
}
var toLocation = (row) => ({
	id: row.id,
	userId: row.user_id,
	name: row.name,
	address: row.address,
	postalCode: row.postal_code,
	city: row.city,
	cuisine: row.cuisine,
	phone: row.phone,
	menu: row.menu ?? [],
	hours: row.hours?.length ? row.hours : defaultHours(),
	delivery: row.delivery ?? defaultDelivery(),
	status: row.status,
	testNumber: row.test_number || TEST_NUMBER,
	twilioNumber: row.twilio_number,
	onboardingStep: row.onboarding_step,
	createdAt: row.created_at
});
var toOrder = (row) => ({
	id: row.id,
	locationId: row.location_id,
	reference: row.reference,
	token: row.token,
	customerName: row.customer_name,
	phone: row.phone,
	address: row.address,
	mode: row.mode,
	lines: row.lines ?? [],
	subtotalCents: row.subtotal_cents,
	deliveryFeeCents: row.delivery_fee_cents,
	totalCents: row.total_cents,
	status: row.status,
	driverId: row.driver_id,
	createdAt: row.created_at,
	updatedAt: row.updated_at
});
var toDriver = (row) => ({
	id: row.id,
	locationId: row.location_id,
	name: row.name,
	phone: row.phone,
	token: row.token,
	active: row.active,
	createdAt: row.created_at
});
async function findUserByEmail(email) {
	const { data, error } = await db().from("pv_users").select("*").eq("email", email.trim().toLowerCase()).maybeSingle();
	if (error) {
		fail("findUserByEmail", error);
		return null;
	}
	return data ? rowToUser(data) : null;
}
async function findUserById(id) {
	const { data, error } = await db().from("pv_users").select("*").eq("id", id).maybeSingle();
	if (error) {
		fail("findUserById", error);
		return null;
	}
	return data ? rowToUser(data) : null;
}
async function createUser(input) {
	const { data, error } = await db().from("pv_users").insert({
		email: input.email.trim().toLowerCase(),
		name: input.name.trim(),
		password_hash: input.passwordHash
	}).select("*").single();
	if (error || !data) {
		fail("createUser", error);
		throw error ?? /* @__PURE__ */ new Error("createUser failed");
	}
	return rowToUser(data);
}
async function createSession(userId, days = 30) {
	const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1e3).toISOString();
	const { data, error } = await db().from("pv_sessions").insert({
		user_id: userId,
		expires_at: expiresAt
	}).select("id, user_id, expires_at").single();
	if (error || !data) {
		fail("createSession", error);
		throw error ?? /* @__PURE__ */ new Error("createSession failed");
	}
	return {
		id: data.id,
		userId: data.user_id,
		expiresAt: data.expires_at
	};
}
async function findSession(id) {
	if (!id) return null;
	const { data, error } = await db().from("pv_sessions").select("id, user_id, expires_at").eq("id", id).maybeSingle();
	if (error) {
		fail("findSession", error);
		return null;
	}
	if (!data) return null;
	if (new Date(data.expires_at).getTime() <= Date.now()) return null;
	return {
		id: data.id,
		userId: data.user_id,
		expiresAt: data.expires_at
	};
}
async function deleteSession(id) {
	const { error } = await db().from("pv_sessions").delete().eq("id", id);
	if (error) fail("deleteSession", error);
}
async function findLocationByUser(userId) {
	const { data, error } = await db().from("pv_locations").select("*").eq("user_id", userId).maybeSingle();
	if (error) {
		fail("findLocationByUser", error);
		return null;
	}
	return data ? toLocation(data) : null;
}
async function findLocationById(id) {
	const { data, error } = await db().from("pv_locations").select("*").eq("id", id).maybeSingle();
	if (error) {
		fail("findLocationById", error);
		return null;
	}
	return data ? toLocation(data) : null;
}
async function listLocations() {
	const { data, error } = await db().from("pv_locations").select("*");
	if (error) {
		fail("listLocations", error);
		return [];
	}
	return (data ?? []).map((row) => toLocation(row));
}
async function upsertLocation(userId, patch) {
	const existing = await findLocationByUser(userId);
	const row = {};
	if (patch.name !== void 0) row.name = patch.name;
	if (patch.address !== void 0) row.address = patch.address;
	if (patch.postalCode !== void 0) row.postal_code = patch.postalCode;
	if (patch.city !== void 0) row.city = patch.city;
	if (patch.cuisine !== void 0) row.cuisine = patch.cuisine;
	if (patch.phone !== void 0) row.phone = patch.phone;
	if (patch.menu !== void 0) row.menu = patch.menu;
	if (patch.hours !== void 0) row.hours = patch.hours;
	if (patch.delivery !== void 0) row.delivery = patch.delivery;
	if (patch.status !== void 0) row.status = patch.status;
	if (patch.twilioNumber !== void 0) row.twilio_number = patch.twilioNumber;
	if (patch.onboardingStep !== void 0) row.onboarding_step = patch.onboardingStep;
	if (existing) {
		const { data, error } = await db().from("pv_locations").update(row).eq("id", existing.id).select("*").single();
		if (error || !data) {
			fail("upsertLocation.update", error);
			throw error ?? /* @__PURE__ */ new Error("upsertLocation failed");
		}
		return toLocation(data);
	}
	const { data, error } = await db().from("pv_locations").insert({
		user_id: userId,
		name: "",
		address: "",
		postal_code: "",
		city: "",
		cuisine: "Italienne",
		phone: "",
		menu: [],
		hours: defaultHours(),
		delivery: defaultDelivery(),
		status: "draft",
		test_number: TEST_NUMBER,
		twilio_number: "",
		onboarding_step: 1,
		...row
	}).select("*").single();
	if (error || !data) {
		fail("upsertLocation.insert", error);
		throw error ?? /* @__PURE__ */ new Error("upsertLocation failed");
	}
	return toLocation(data);
}
async function setMenu(userId, menu) {
	return upsertLocation(userId, { menu });
}
async function updateMenuItem(userId, itemId, patch) {
	const location = await findLocationByUser(userId);
	if (!location) return null;
	return upsertLocation(userId, { menu: location.menu.map((item) => item.id === itemId ? {
		...item,
		...patch,
		id: item.id
	} : item) });
}
async function removeMenuItem(userId, itemId) {
	const location = await findLocationByUser(userId);
	if (!location) return null;
	return upsertLocation(userId, { menu: location.menu.filter((item) => item.id !== itemId) });
}
async function activateLocation(userId) {
	return upsertLocation(userId, {
		status: "active",
		onboardingStep: 5
	});
}
async function listOrders(userId) {
	const location = await findLocationByUser(userId);
	if (!location) return [];
	const { data, error } = await db().from("pv_orders").select("*").eq("location_id", location.id).order("created_at", { ascending: false });
	if (error) {
		fail("listOrders", error);
		return [];
	}
	return (data ?? []).map((row) => toOrder(row));
}
async function listOrdersForLocation(locationId) {
	const { data, error } = await db().from("pv_orders").select("*").eq("location_id", locationId).order("created_at", { ascending: false });
	if (error) {
		fail("listOrdersForLocation", error);
		return [];
	}
	return (data ?? []).map((row) => toOrder(row));
}
async function getOrderByToken(token) {
	const { data, error } = await db().from("pv_orders").select("*").eq("token", token).maybeSingle();
	if (error) {
		fail("getOrderByToken", error);
		return null;
	}
	return data ? toOrder(data) : null;
}
async function getOrderById(id) {
	const { data, error } = await db().from("pv_orders").select("*").eq("id", id).maybeSingle();
	if (error) {
		fail("getOrderById", error);
		return null;
	}
	return data ? toOrder(data) : null;
}
async function createOrder(input) {
	const subtotalCents = input.lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);
	const deliveryFeeCents = input.mode === "delivery" ? input.deliveryFeeCents ?? 0 : 0;
	const { data, error } = await db().from("pv_orders").insert({
		location_id: input.locationId,
		reference: `PV-${Date.now().toString().slice(-5)}`,
		token: randomUUID().replace(/-/g, ""),
		customer_name: input.customerName ?? "",
		phone: input.phone,
		address: input.address,
		mode: input.mode,
		lines: input.lines,
		subtotal_cents: subtotalCents,
		delivery_fee_cents: deliveryFeeCents,
		total_cents: subtotalCents + deliveryFeeCents,
		status: "new"
	}).select("*").single();
	if (error || !data) {
		fail("createOrder", error);
		throw error ?? /* @__PURE__ */ new Error("createOrder failed");
	}
	return toOrder(data);
}
async function updateOrderStatus(orderId, status) {
	const { data, error } = await db().from("pv_orders").update({
		status,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", orderId).select("*").maybeSingle();
	if (error) {
		fail("updateOrderStatus", error);
		return null;
	}
	return data ? toOrder(data) : null;
}
async function createDriver(input) {
	const { data, error } = await db().from("pv_drivers").insert({
		location_id: input.locationId,
		name: input.name.trim(),
		phone: input.phone.trim(),
		token: randomUUID().replace(/-/g, ""),
		active: true
	}).select("*").single();
	if (error || !data) {
		fail("createDriver", error);
		throw error ?? /* @__PURE__ */ new Error("createDriver failed");
	}
	return toDriver(data);
}
async function listDrivers(locationId) {
	const { data, error } = await db().from("pv_drivers").select("*").eq("location_id", locationId);
	if (error) {
		fail("listDrivers", error);
		return [];
	}
	return (data ?? []).map((row) => toDriver(row));
}
async function findDriverByToken(token) {
	const { data, error } = await db().from("pv_drivers").select("*").eq("token", token).maybeSingle();
	if (error) {
		fail("findDriverByToken", error);
		return null;
	}
	return data ? toDriver(data) : null;
}
async function setDriverActive(driverId, active) {
	const { data, error } = await db().from("pv_drivers").update({ active }).eq("id", driverId).select("*").maybeSingle();
	if (error) {
		fail("setDriverActive", error);
		return null;
	}
	return data ? toDriver(data) : null;
}
async function driverOrders(driver) {
	const orders = await listOrdersForLocation(driver.locationId);
	return {
		available: orders.filter((order) => order.status === "ready" && order.mode === "delivery"),
		active: orders.filter((order) => order.status === "delivering" && order.mode === "delivery" && order.driverId === driver.id)
	};
}
async function takeOrder(driverToken, orderId) {
	const driver = await findDriverByToken(driverToken);
	if (!driver || !driver.active) return null;
	const order = await getOrderById(orderId);
	if (!order) return null;
	if (order.locationId !== driver.locationId) return null;
	if (order.status !== "ready") return null;
	const { data, error } = await db().from("pv_orders").update({
		status: "delivering",
		driver_id: driver.id,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", orderId).eq("status", "ready").select("*").maybeSingle();
	if (error) {
		fail("takeOrder", error);
		return null;
	}
	return data ? toOrder(data) : null;
}
async function completeOrder(driverToken, orderId) {
	const driver = await findDriverByToken(driverToken);
	if (!driver) return null;
	const order = await getOrderById(orderId);
	if (!order) return null;
	if (order.driverId !== driver.id) return null;
	if (order.status !== "delivering") return null;
	const { data, error } = await db().from("pv_orders").update({
		status: "delivered",
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", orderId).eq("driver_id", driver.id).eq("status", "delivering").select("*").maybeSingle();
	if (error) {
		fail("completeOrder", error);
		return null;
	}
	return data ? toOrder(data) : null;
}
var COOKIE = "pv_session";
var MAX_AGE = 2592e3;
function hashPassword(password) {
	const salt = randomBytes(16).toString("hex");
	return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
function verifyPassword(password, stored) {
	const [salt, hash] = stored.split(":");
	if (!salt || !hash) return false;
	const candidate = scryptSync(password, salt, 64);
	const expected = Buffer.from(hash, "hex");
	if (candidate.length !== expected.length) return false;
	return timingSafeEqual(candidate, expected);
}
async function startSession(userId) {
	const session = await createSession(userId);
	setCookie(COOKIE, session.id, {
		httpOnly: true,
		sameSite: "lax",
		path: "/",
		maxAge: MAX_AGE,
		secure: true
	});
}
async function endSession() {
	const id = getCookie(COOKIE);
	if (id) await deleteSession(id);
	deleteCookie(COOKIE, { path: "/" });
}
async function getSessionPayload() {
	const session = await findSession(getCookie(COOKIE));
	if (!session) return null;
	const user = await findUserById(session.userId);
	if (!user) return null;
	return {
		user: {
			id: user.id,
			email: user.email,
			name: user.name
		},
		location: await findLocationByUser(user.id)
	};
}
export { DAY_LABELS, activateLocation, completeOrder, createDriver, createOrder, createSession, createUser, defaultDelivery, defaultHours, deleteSession, driverOrders, endSession, findDriverByToken, findLocationById, findUserByEmail, findUserById, formatPriceInput, getOrderById, getOrderByToken, getSessionPayload, hashPassword, listDrivers, listLocations, listOrders, operatorCodes, parsePriceInput, removeMenuItem, setDriverActive, setMenu, startSession, takeOrder, updateMenuItem, updateOrderStatus, upsertLocation, verifyPassword };
