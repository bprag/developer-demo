const resolvedPromise = Promise.resolve()

export function queueJob(fn) {
	resolvedPromise.then(() => fn())
}

export function nextTick(fn) {
	return resolvedPromise.then(() => fn.call(this))
}