export function patchClass(el, value) {
	if (value == undefined) {
		el.removeAttribute('class')
	} else {
		el.className = value
	}
}
