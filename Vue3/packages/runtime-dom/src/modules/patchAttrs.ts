export function patchAttrs(el, key, nextValue) {
	if (nextValue === undefined || nextValue === null) {
		el.removeAttribute(key)
	} else {
		el.setAttribute(key, nextValue)
	}
}