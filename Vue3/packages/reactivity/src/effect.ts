import { endTrack, Link, startTrack } from "./system";

export let activeSub

export function setActiveSub(sub) {
	activeSub = sub
}

class RectiveEffect {
	deps: Link | undefined
	depsTail: Link | undefined
	tracking: false
	
	constructor(public fn) {
	}
	
	run() {
		const prevSub = activeSub
		setActiveSub(this)
		startTrack(this)
		try {
			return this.fn()
		} finally {
			endTrack(this)
			activeSub = prevSub
		}
	}
	
	notify() {
		this.scheduler();
	}
	
	scheduler() {
		this.run();
	}
}

export function effect(fn, scheduler) {
	const e = new RectiveEffect(fn)
	Object.assign(e, scheduler)
	e.run()
	
	const runner = e.run.bind(e)
	runner.effect = e
	
	return runner
}