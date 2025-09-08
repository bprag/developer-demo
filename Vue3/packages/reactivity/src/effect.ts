import { endTrack, Link, startTrack } from "./system";

export let activeSub

export function setActiveSub(sub) {
	activeSub = sub
}

export class RectiveEffect {
	deps: Link | undefined
	depsTail: Link | undefined
	tracking: false
	dirty: false
	
	active: boolean = true
	
	constructor(public fn) {
	}
	
	run() {
		if (!this.active) {
			return this.fn()
		}
		
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
	
	stop() {
		if (this.active) {
			startTrack(this)
			endTrack(this)
			this.active = false
		}
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