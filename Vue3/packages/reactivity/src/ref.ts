import { activeSub } from "./effect";
import { Link, link, propagate } from "./system";

enum ReactiveFlags {
	IS_REF = '__v_isRef'
}

class RefImpl {
	sub: Link | undefined
	subsTail: Link | undefined
	[ReactiveFlags.IS_REF] = true
	
	#value
	
	constructor(value) {
		this.#value = value;
	}
	
	get value() {
		trackRef(this)
		return this.#value;
	}
	
	set value(newValue) {
		this.#value = newValue
		triggerRef(this)
	}
}

export function ref(value) {
	// @ts-ignore
	return new RefImpl(value);
}

export function isRef(value) {
	return !!(value && value[ReactiveFlags.IS_REF])
}

/**
 * 收集 ref 关联的 effect
 *
 */
export function trackRef(dep) {
	if (activeSub) {
		link(dep, activeSub)
	}
}

/**
 * 触发 ref 关联的 effect
 * @param dep
 */
export function triggerRef(dep) {
	if (dep.subs) {
		propagate(dep.subs)
	}
}

