import { activeSub } from "./effect";

enum ReactiveFlags {
	IS_REF = '__v_isRef'
}

class RefImpl {
	subs
	subsTail
	[ReactiveFlags.IS_REF] = true
	
	#value
	
	constructor(value) {
		this.#value = value;
	}
	
	get value() {
		if (activeSub) {
			let newLink = {
				sub: activeSub,
				nextSub: null,
				prevSub: null
			}
			if (this.subsTail) {
				this.subsTail.nextSub = newLink
				newLink.prevSub = this.subsTail
				this.subsTail = newLink
			} else {
				this.subsTail = this.subs = newLink
			}
		}
		
		return this.#value;
	}
	
	set value(newValue) {
		console.log('我被修改了');
		this.#value = newValue
		let link = this.subs
		const queueEffect = []
		while (link) {
			queueEffect.push(link.sub)
			link = link.nextSub
		}
		queueEffect.forEach(effect => effect())
	}
}

export function ref(value) {
	// @ts-ignore
	return new RefImpl(value);
}

export function isRef(value) {
	return !!(value && value[ReactiveFlags.IS_REF])
}
