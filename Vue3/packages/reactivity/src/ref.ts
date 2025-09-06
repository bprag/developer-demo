import { activeSub } from "./effect";
import { Link, link, propagate } from "./system";
import { hasChanged, isObject } from "@vue/shared";
import { reactive } from "./reactive";

enum ReactiveFlags {
	IS_REF = '__v_isRef'
}

class RefImpl {
	sub: Link | undefined
	subsTail: Link | undefined
	[ReactiveFlags.IS_REF] = true
	
	#value
	
	constructor(value) {
		this.#value = isObject(value) ? reactive(value) : value;
	}
	
	get value() {
		trackRef(this)
		return this.#value;
	}
	
	set value(newValue) {
		if (hasChanged(newValue, this.#value)) {
			this.#value = isObject(newValue) ? reactive(newValue) : newValue;
			triggerRef(this)
		}
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

