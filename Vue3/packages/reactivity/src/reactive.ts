import { isObject } from "@vue/shared";
import { mutableHandlers } from "./baseHandlers";

export function reactive(value) {
	return createReactiveObject(value)
}

export function isReactive(target) {
	return reactiveSet.has(target)
}

const reactiveMap = new WeakMap()
const reactiveSet = new WeakSet()

function createReactiveObject(target) {
	
	if (!isObject(target)) {
		return target
	}
	
	if (Object.isExtensible(target)) {
		return target
	}
	
	if (reactiveSet.has(target)) {
		return target
	}
	
	const existingProxy = reactiveMap.get(target)
	if (existingProxy) {
		return existingProxy
	}
	
	const proxy = new Proxy(target, mutableHandlers)
	
	reactiveMap.set(target, proxy)
	reactiveSet.add(proxy)
	
	return proxy
}

