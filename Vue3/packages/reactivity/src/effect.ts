export let activeSub

export function effect(fn) {
	activeSub = fn
	activeSub()
	activeSub = undefined
}