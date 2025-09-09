export function patchStyle(el, prev, next) {
	const style = el.style
	if (next) {
		for (const key in next) {
			style[key] = next[key]
		}
	}
	
	if (prev) {
		for (const key in prev) {
			if (!next || !next[key]) {
				style[key] = null
			}
		}
	}
}