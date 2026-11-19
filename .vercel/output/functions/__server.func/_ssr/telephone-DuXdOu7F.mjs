import { __toESM } from "../_runtime.mjs";
import { Route$8 } from "./router-ZeX44smn.mjs";
import { require_react } from "../_libs/react.mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
// node_modules/.nitro/vite/services/ssr/assets/telephone-DuXdOu7F.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function base64(bytes) {
	let binary = "";
	const chunk = 32768;
	for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
	return btoa(binary);
}
function downsample(input, from, to) {
	if (from === to) return input;
	const ratio = from / to;
	const length = Math.floor(input.length / ratio);
	const output = new Float32Array(length);
	for (let i = 0; i < length; i += 1) {
		const start = Math.floor(i * ratio);
		let sum = 0;
		let count = 0;
		for (let j = 0; j < ratio; j += 1) {
			const index = start + j;
			if (index >= input.length) break;
			sum += input[index];
			count += 1;
		}
		output[i] = count > 0 ? sum / count : 0;
	}
	return output;
}
function toInt16(input) {
	const output = new Int16Array(input.length);
	for (let i = 0; i < input.length; i += 1) {
		const value = Math.max(-1, Math.min(1, input[i]));
		output[i] = value < 0 ? value * 32768 : value * 32767;
	}
	return output;
}
function WebPhone() {
	const { session } = Route$8.useRouteContext();
	const location = session.location;
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [handoff, setHandoff] = (0, import_react.useState)(false);
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [phone, setPhone] = (0, import_react.useState)("+33600000000");
	const [error, setError] = (0, import_react.useState)(null);
	const wsRef = (0, import_react.useRef)(null);
	const ctxRef = (0, import_react.useRef)(null);
	const streamRef = (0, import_react.useRef)(null);
	const processorRef = (0, import_react.useRef)(null);
	const sourcesRef = (0, import_react.useRef)([]);
	const nextTimeRef = (0, import_react.useRef)(0);
	const scrollRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		scrollRef.current?.scrollTo({
			top: scrollRef.current.scrollHeight,
			behavior: "smooth"
		});
	}, [messages]);
	(0, import_react.useEffect)(() => {
		return () => {
			stop();
		};
	}, []);
	function addMessage(role, text) {
		if (!text.trim()) return;
		setMessages((current) => [...current, {
			id: globalThis.crypto.randomUUID(),
			role,
			text
		}]);
	}
	function stopSources() {
		for (const source of sourcesRef.current) try {
			source.stop();
		} catch {}
		sourcesRef.current = [];
		nextTimeRef.current = 0;
	}
	function playAudio(data, sampleRate) {
		const ctx = ctxRef.current;
		if (!ctx) return;
		const bytes = Uint8Array.from(atob(data), (char) => char.charCodeAt(0));
		const view = new DataView(bytes.buffer);
		const samples = new Float32Array(bytes.length / 2);
		for (let i = 0; i < samples.length; i += 1) samples[i] = view.getInt16(i * 2, true) / 32768;
		const buffer = ctx.createBuffer(1, samples.length, sampleRate);
		buffer.copyToChannel(samples, 0);
		const source = ctx.createBufferSource();
		source.buffer = buffer;
		source.connect(ctx.destination);
		const start = Math.max(ctx.currentTime + .03, nextTimeRef.current);
		source.start(start);
		nextTimeRef.current = start + buffer.duration;
		sourcesRef.current.push(source);
		source.onended = () => {
			sourcesRef.current = sourcesRef.current.filter((item) => item !== source);
		};
	}
	async function start() {
		setError(null);
		setMessages([]);
		setHandoff(false);
		setStatus("connecting");
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: {
				echoCancellation: true,
				noiseSuppression: true,
				autoGainControl: true
			} });
			streamRef.current = stream;
			const ctx = new AudioContext();
			ctxRef.current = ctx;
			await ctx.resume();
			"".trim();
			const url = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/phone-ws`;
			const ws = new WebSocket(url);
			wsRef.current = ws;
			ws.onopen = () => {
				ws.send(JSON.stringify({
					type: "start",
					tenant: location?.twilioNumber?.replace(/\D/g, "") || "default",
					phone
				}));
				setStatus("live");
				const source = ctx.createMediaStreamSource(stream);
				const processor = ctx.createScriptProcessor(4096, 1, 1);
				processorRef.current = processor;
				const silent = ctx.createGain();
				silent.gain.value = 0;
				processor.onaudioprocess = (event) => {
					if (ws.readyState !== WebSocket.OPEN) return;
					const int16 = toInt16(downsample(event.inputBuffer.getChannelData(0), ctx.sampleRate, 16e3));
					const bytes = new Uint8Array(int16.buffer);
					ws.send(JSON.stringify({
						type: "audio",
						sampleRate: 16e3,
						data: base64(bytes)
					}));
				};
				source.connect(processor);
				processor.connect(silent);
				silent.connect(ctx.destination);
			};
			ws.onmessage = (event) => {
				let message;
				try {
					message = JSON.parse(event.data);
				} catch {
					return;
				}
				if (message.type === "audio" && message.data) {
					playAudio(message.data, message.sampleRate ?? 8e3);
					return;
				}
				if (message.type === "agent" && message.text) {
					addMessage("agent", message.text);
					return;
				}
				if (message.type === "client" && message.text) {
					addMessage("client", message.text);
					return;
				}
				if (message.type === "handoff") {
					setHandoff(true);
					addMessage("system", "Gemini Live prend le relais.");
					return;
				}
				if (message.type === "clear") {
					stopSources();
					return;
				}
				if (message.type === "end") setStatus("ended");
			};
			ws.onerror = () => {
				setError(`Connexion au runtime impossible sur ${url}. Vérifiez que le proxy et le runtime tournent, et que l'URL est en wss en HTTPS.`);
				setStatus("idle");
			};
			ws.onclose = () => {
				if (status !== "ended") setStatus("ended");
			};
		} catch (cause) {
			setStatus("idle");
			setError(cause instanceof Error ? `Micro inaccessible : ${cause.message}` : "Micro inaccessible.");
		}
	}
	function stop() {
		if (wsRef.current?.readyState === WebSocket.OPEN) {
			wsRef.current.send(JSON.stringify({ type: "stop" }));
			wsRef.current.close();
		}
		wsRef.current = null;
		processorRef.current?.disconnect();
		processorRef.current = null;
		streamRef.current?.getTracks().forEach((track) => track.stop());
		streamRef.current = null;
		stopSources();
		ctxRef.current?.close();
		ctxRef.current = null;
		setStatus("ended");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "page-head",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Téléphone" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Appelez l'agent depuis votre navigateur, sans Twilio." })] })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "webcall-grid",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel webcall-panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "webcall-status",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: `status-live${status === "live" ? "" : " status-draft"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "dot",
							"aria-hidden": "true"
						}), status === "live" ? handoff ? "Gemini Live" : "Appel en cours" : status === "connecting" ? "Connexion…" : status === "ended" ? "Appel terminé" : "Prêt"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mono",
						children: location?.name ?? "Maison Luigi"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "field",
					style: { marginTop: 18 },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "webcall-phone",
						children: "Numéro du client (pour le suivi)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "webcall-phone",
						value: phone,
						onChange: (event) => setPhone(event.target.value),
						disabled: status === "live" || status === "connecting",
						inputMode: "tel"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "small-note",
					style: { marginTop: 10 },
					children: "Le micro nécessite HTTPS ou localhost. Le numéro sert à créer la commande et à envoyer le lien de suivi."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "webcall-actions",
					children: status === "idle" || status === "ended" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-primary btn-block",
						type: "button",
						onClick: () => void start(),
						children: "Appeler l'agent"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-secondary btn-block",
						type: "button",
						onClick: stop,
						children: "Raccrocher"
					})
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "wizard-error",
					role: "alert",
					style: { marginTop: 12 },
					children: error
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel webcall-transcript",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "app-section-head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Conversation" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Ce que l'agent a entendu et répondu." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "mono",
					children: [messages.length, " tours"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "webcall-messages",
				ref: scrollRef,
				children: messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "empty-state",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Aucun appel en cours." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Lancez l'appel, parlez, et vérifiez la commande dans l'onglet Commandes." })]
				}) : messages.map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `studio-msg is-${message.role}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "studio-msg-role",
						children: message.role === "agent" ? "Agent" : message.role === "client" ? "Vous" : "Système"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: message.text })]
				}, message.id))
			})]
		})]
	})] });
}
export { WebPhone as component };
