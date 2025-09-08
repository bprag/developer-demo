import { Dependency, endTrack, Link, link, startTrack, Sub } from "./system";
import { ReactiveFlags } from "./ref";
import { activeSub, setActiveSub } from "./effect";
import { hasChanged, isFunction } from "@vue/shared";

export function computed(getterOrOptions) {
	let getter
	let setter
	
	if (isFunction(getterOrOptions)) {
		getter = getterOrOptions
	} else {
		getter = getterOrOptions.get
		setter = getterOrOptions.set
	}
	
	return new ComputedRefImpl(getter, setter)
}

class ComputedRefImpl implements Dependency, Sub {
	subs: Link | undefined
	subsTail: Link | undefined
	
	deps: Link | undefined
	depsTail: Link | undefined
	
	#value
	tracking: false
	dirty: true
	
	[ReactiveFlags.IS_REF] = true
	
	constructor(public fn, private setter) {
	}
	
	update() {
		const prevSub = activeSub
		setActiveSub(this)
		startTrack(this)
		try {
			const oldValue = this.#value;
			this.#value = this.fn()
			
			return hasChanged(oldValue, this.#value)
		} finally {
			endTrack(this)
			setActiveSub(prevSub)
		}
	}
	
	get value() {
		if (this.dirty) {
			// 如果计算属性脏了，执行 update
			this.update()
		}
		
		if (activeSub) {
			link(this, activeSub)
		}
		
		return this.#value
	}
	
	set value(newValue) {
		if (this.setter) {
			this.setter(newValue)
		} else {
			console.warn(`只读属性`)
		}
	}
}