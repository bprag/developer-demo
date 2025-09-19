export const isArray = Array.isArray

export function isObject(value) {
	return typeof value === 'object' && value !== null
}

export function hasChanged(value, oldValue) {
	return !Object.is(value, oldValue)
}

export function isFunction(fn) {
	return typeof fn === "function";
}

export function isOn(eventName) {
	return /^on[A-Z]/.test(eventName)
}

export function isString(value) {
	return typeof value === 'string'
}

export function isNumber(value) {
	return typeof value === 'number'
}

export function hasOwn(object, key) {
	return Object.hasOwn(object, key)
}