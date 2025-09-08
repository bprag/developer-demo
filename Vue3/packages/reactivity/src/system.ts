export interface Sub {
	deps: Link | undefined
	depsTail: Link | undefined
}

export interface Dependency {
	subs: Link | undefined
	subsTail: Link | undefined
}

export interface Link {
	sub: Sub
	nextSub: Link | undefined
	prevSub: Link | undefined
	
	dep: Dependency
	nextDep: Link | undefined
}

let linkPool: Link

export function link(dep, sub) {
	const currentDep = sub.depsTail
	const nextDep = currentDep === undefined ? sub.deps : currentDep.nextDep
	
	if (nextDep && nextDep.dep === dep) {
		sub.depsTail = nextDep
		return
	}
	let newLink: Link
	if (linkPool) {
		newLink = linkPool
		linkPool = linkPool.nextDep
		newLink.sub = sub
		newLink.dep = dep
		newLink.nextDep = nextDep
	} else {
		newLink = {
			sub,
			nextSub: undefined,
			prevSub: undefined,
			
			dep,
			nextDep
		}
		
	}
	
	if (dep.subsTail) {
		dep.subsTail.nextSub = newLink
		newLink.prevSub = dep.subsTail
		dep.subsTail = newLink
	} else {
		dep.subsTail = dep.subs = newLink
	}
	
	if (sub.depsTail) {
		sub.depsTail.nextDep = newLink
		sub.depsTail = newLink
	} else {
		sub.depsTail = sub.deps = newLink
	}
}

export function propagate(subs) {
	let link = subs
	const queueEffect = []
	
	while (link) {
		const sub = link.sub
		if (!sub.tracking && !sub.dirty) {
			sub.dirty = true
			if ('update' in sub) {
				processComputedUpdate(sub)
			} else {
				queueEffect.push(link.sub)
			}
		}
		link = link.nextSub
	}
	
	queueEffect.forEach(effect => effect.notify())
}

export function startTrack(sub) {
	sub.depsTail = undefined
	sub.tracking = true
}

export function endTrack(sub) {
	const depsTail = sub.depsTail
	
	if (depsTail) {
		if (depsTail.nextDep) {
			clearTracking(depsTail.nextDep)
			depsTail.nextDep = undefined
		}
	} else if (sub.deps) {
		clearTracking(sub.deps)
		sub.deps = undefined
	}
	sub.dirty = false
	sub.tracking = false
}

function clearTracking(link: Link) {
	while (link) {
		const { prevSub, nextSub, nextDep, dep } = link
		
		if (prevSub) {
			prevSub.nextSub = nextSub
			link.nextSub = undefined
		} else {
			dep.subs = nextSub
		}
		
		if (nextSub) {
			nextSub.prevSub = prevSub
			link.prevSub = undefined
		} else {
			dep.subsTail = prevSub
		}
		
		link.dep = link.sub = undefined
		link.nextDep = linkPool
		linkPool = link
		
		link = nextDep
	}
}

function processComputedUpdate(sub) {
	if (sub.subs && sub.update) {
		propagate(sub.subs)
	}
}