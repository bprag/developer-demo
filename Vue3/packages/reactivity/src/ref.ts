import { activeSub } from "./effect";
import { Link, link, propagate } from "./system";
import { hasChanged, isObject } from "@vue/shared";
import { reactive } from "./reactive";

export enum ReactiveFlags {
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

class ObjectRefImpl {
	[ReactiveFlags.IS_REF] = true
	
	constructor(public _object, public _key) {
	}
	
	get value() {
		return this._object[this._key]
	}
	
	set value(newValue) {
		this._object[this._key] = newValue
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

export function toRef(target, key) {
	return new ObjectRefImpl(target, key)
}

export function toRefs(target) {
	const object = {}
	for (const key in target) {
		object[key] = new ObjectRefImpl(target, key)
	}
	
	return object
}

export function unref(val) {
	return isRef(val) ? val.value : val;
}

export function proxyRefs(target) {
	return new Proxy(target, {
		get(...args) {
			const res = Reflect.get(...args)
			return unref(res)
		},
		set(target, key, newValue, receiver) {
			const oldValue = target[key]
			
			if (isRef(oldValue) && !isRef(newValue)) {
				oldValue.value = newValue
				return true
			}
			
			return Reflect.set(target, key, newValue, receiver)
		}
	})
}

