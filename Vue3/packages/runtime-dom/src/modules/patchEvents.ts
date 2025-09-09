const veiKey = Symbol('_vei')

function createInvoker(value) {
	const invoker = () => {
		invoker.value()
	}
	invoker.value = value
	
	return invoker
}

export function patchEvents(el, rawName, nextValue) {
	const event = rawName.slice(2).toLowerCase();
	
	const invokers = (el[veiKey] ??= {})
	const existingInvoker = invokers[rawName]
	if (nextValue) {
		if (existingInvoker) {
			existingInvoker.value = nextValue
			return
		}
		const invoker = createInvoker(nextValue)
		invokers[rawName] = invoker
		el.addEventListener(event, invoker)
	} else {
		if (existingInvoker) {
			el.removeEventListener(event, existingInvoker)
			invokers[rawName] = undefined
		}
	}
}