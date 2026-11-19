import { __toESM } from "../_runtime.mjs";
import { Brand, Route$16 } from "./router-ZeX44smn.mjs";
import { require_react } from "../_libs/react.mjs";
import { Link } from "../_libs/@tanstack/react-router+[3...].mjs";
import { useNavigate } from "../_libs/@tanstack/react-router+[4...].mjs";
import { require_jsx_runtime } from "../_libs/react2.mjs";
// node_modules/.nitro/vite/services/ssr/assets/voice-setup-Y-EybMtj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var VOICES = [
	"Kore",
	"Puck",
	"Zephyr",
	"Charon",
	"Fenrir",
	"Leda",
	"Orus",
	"Aoede"
];
function downsample(input, from, to) {
	if (to === from) return input;
	const ratio = from / to;
	const length = Math.round(input.length / ratio);
	const out = new Float32Array(length);
	let offset = 0;
	for (let i = 0; i < length; i += 1) {
		const next = Math.round((i + 1) * ratio);
		let sum = 0;
		let count = 0;
		for (let j = offset; j < next && j < input.length; j += 1) {
			sum += input[j];
			count += 1;
		}
		out[i] = count > 0 ? sum / count : 0;
		offset = next;
	}
	return out;
}
function floatToPcm16Base64(samples) {
	const buffer = /* @__PURE__ */ new ArrayBuffer(samples.length * 2);
	const view = new DataView(buffer);
	for (let i = 0; i < samples.length; i += 1) {
		const clamped = Math.max(-1, Math.min(1, samples[i]));
		view.setInt16(i * 2, clamped < 0 ? clamped * 32768 : clamped * 32767, true);
	}
	const bytes = new Uint8Array(buffer);
	let binary = "";
	const chunk = 32768;
	for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
	return btoa(binary);
}
function VoiceSetup() {
	const { session } = Route$16.useRouteContext();
	const navigate = useNavigate();
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [error, setError] = (0, import_react.useState)(null);
	const [voice, setVoice] = (0, import_react.useState)("Kore");
	const [messages, setMessages] = (0, import_react.useState)([]);
	const wsRef = (0, import_react.useRef)(null);
	const ctxRef = (0, import_react.useRef)(null);
	const streamRef = (0, import_react.useRef)(null);
	const processorRef = (0, import_react.useRef)(null);
	const queueRef = (0, import_react.useRef)([]);
	const playingRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => () => stop(true), []);
	function addMessage(role, text) {
		setMessages((prev) => [...prev.slice(-40), {
			role,
			text
		}]);
	}
	function playNext() {
		const ctx = ctxRef.current;
		if (!ctx || playingRef.current) return;
		const next = queueRef.current.shift();
		if (!next) return;
		playingRef.current = true;
		const source = ctx.createBufferSource();
		source.buffer = next;
		source.connect(ctx.destination);
		source.onended = () => {
			playingRef.current = false;
			playNext();
		};
		source.start();
	}
	async function start() {
		if (status === "live") return;
		setError(null);
		setMessages([]);
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
			const scheme = window.location.protocol === "https:" ? "wss" : "ws";
			const ws = new WebSocket(`${scheme}://${window.location.host}/onboarding-ws`);
			wsRef.current = ws;
			ws.onopen = () => {
				ws.send(JSON.stringify({
					type: "start",
					sessionId: session.user.id,
					voice
				}));
				const source = ctx.createMediaStreamSource(stream);
				const processor = ctx.createScriptProcessor(4096, 1, 1);
				processorRef.current = processor;
				const silent = ctx.createGain();
				silent.gain.value = 0;
				source.connect(processor);
				processor.connect(silent);
				silent.connect(ctx.destination);
				processor.onaudioprocess = (event) => {
					if (ws.readyState !== WebSocket.OPEN) return;
					const pcm16k = downsample(event.inputBuffer.getChannelData(0), ctx.sampleRate, 16e3);
					ws.send(JSON.stringify({
						type: "audio",
						sampleRate: 16e3,
						data: floatToPcm16Base64(pcm16k)
					}));
				};
				setStatus("live");
			};
			ws.onmessage = (event) => {
				let message;
				try {
					message = JSON.parse(event.data);
				} catch {
					return;
				}
				if (message.type === "audio" && message.data) {
					const binary = atob(message.data);
					const bytes = new Uint8Array(binary.length);
					for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
					const view = new DataView(bytes.buffer);
					const samples = new Float32Array(bytes.length / 2);
					for (let i = 0; i < samples.length; i += 1) samples[i] = view.getInt16(i * 2, true) / 32768;
					const buffer = ctx.createBuffer(1, samples.length, 8e3);
					buffer.copyToChannel(samples, 0);
					queueRef.current.push(buffer);
					playNext();
					return;
				}
				if (message.type === "transcript" && message.text) {
					addMessage(message.role === "client" ? "client" : "agent", message.text);
					return;
				}
				if (message.type === "onboarding_saved") {
					setStatus("saved");
					addMessage("system", `Établissement « ${message.name ?? ""} » enregistré.`);
					setTimeout(() => navigate({ to: "/app" }), 4e3);
					return;
				}
				if (message.type === "error") {
					setError(message.message ?? "erreur");
					setStatus("error");
				}
			};
			ws.onerror = () => {
				setError(`Connexion impossible sur ${ws.url}.`);
				setStatus("error");
			};
		} catch (err) {
			setError(err instanceof Error ? err.message : "Micro inaccessible");
			setStatus("error");
		}
	}
	function stop(silent = false) {
		processorRef.current?.disconnect();
		processorRef.current = null;
		streamRef.current?.getTracks().forEach((track) => track.stop());
		streamRef.current = null;
		queueRef.current = [];
		playingRef.current = false;
		if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify({ type: "stop" }));
		wsRef.current?.close();
		wsRef.current = null;
		ctxRef.current?.close().catch(() => void 0);
		ctxRef.current = null;
		if (!silent) setStatus("idle");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "auth-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "auth-panel",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "auth-top",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "small-note",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/onboarding",
						children: "Configurer à l'écrit"
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "auth-main",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "auth-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: "Mise en route à la voix"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "auth-title",
							children: "On configure votre pizzeria ensemble."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "lede",
							style: { fontSize: 15 },
							children: "Appuyez sur le bouton et répondez. L'assistant note au fur et à mesure : nom, adresse, carte, horaires, livraison. Deux minutes, aucune question à remplir."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "setup-voice",
								children: "Voix de l'assistant"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								id: "setup-voice",
								value: voice,
								onChange: (event) => setVoice(event.target.value),
								disabled: status === "live",
								children: VOICES.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: v,
									children: v
								}, v))
							})]
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "auth-error",
							children: error
						}) : null,
						status === "live" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn btn-block",
							type: "button",
							onClick: () => stop(),
							children: "Terminer"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "btn btn-primary btn-block",
							type: "button",
							onClick: start,
							disabled: status === "saved",
							children: status === "saved" ? "Enregistré" : "Démarrer la configuration"
						}),
						messages.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "setup-transcript",
							"aria-live": "polite",
							children: messages.map((message, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: `setup-line setup-${message.role}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: message.role === "client" ? "Vous" : message.role === "agent" ? "Assistant" : "—" }),
									" ",
									message.text
								]
							}, index))
						}) : null
					]
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "auth-aside",
			"aria-hidden": "true",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/images/counter.webp",
				alt: ""
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "auth-quote",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "« Vous parlez, il note. À la fin, votre standard est prêt à sonner. »" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Mise en route · 2 minutes" })]
			})]
		})]
	});
}
export { VoiceSetup as component };
