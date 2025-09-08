import { isRef } from "./ref";
import { isReactive } from "./reactive";
import { isFunction, isObject } from "@vue/shared";
import { RectiveEffect } from "./effect";

export function watch(source, cb, options) {
	let { immediate, once, deep } = options || {};
	
	if (once) {
		let _cb = cb
		
		cb = (...args) => {
			_cb(...args)
			stop()
		}
	}
	
	let getter;
	
	if (isRef(source)) {
		getter = () => source.value
	} else if (isReactive(source)) {
		getter = () => source
		if (!deep) {
			deep = true
		}
	} else if (isFunction(source)) {
		getter = source
	}
	
	if (deep) {
		const baseGetter = getter
		const depth = deep === true ? Infinity : deep
		getter = () => traverse(baseGetter(), depth)
	}
	
	let oldValue
	let cleanup = null
	
	function onCleanup(cb) {
		cleanup = cb
	}
	
	function job() {
		if (cleanup) {
			cleanup()
			cleanup = null
		}
		
		let newValue = effect.run()
		
		cb(newValue, oldValue, onCleanup)
		
		oldValue = newValue
	}
	
	const effect = new RectiveEffect(getter)
	effect.scheduler = job
	// 立即执行
	if (immediate) {
		job();
	} else {
		oldValue = effect.run()
	}
	
	function stop() {
		effect.stop()
	}
	
	return stop
}

function traverse(value, depth, seen = new Set()) {
	if (!isObject(value) || depth <= 0) {
		return value
	}
	if (seen.has(value)) {
		return value
	}
	
	depth--;
	seen.add(value);
	
	for (const key in value) {
		// 递归触发 getter
		traverse(value[key], depth, seen)
	}
	
	return value
}