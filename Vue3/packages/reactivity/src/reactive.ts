import { Link, link, propagate } from "./system";
import { activeSub } from "./effect";

export function reactive(value) {
	return createReactiveObject(value)
}

const targetMap = new WeakMap()

const mutableHandlers = {
	get(target, key, receiver) {
		track(target, key)
		return Reflect.get(target, key, receiver)
	},
	set(target: any, p: string | symbol, newValue: any, receiver: any): boolean {
		let res = Reflect.set(target, p, newValue, receiver)
		let activeSubs = targetMap.get(target)
		let sub = activeSubs && activeSubs.get(p)
		
		trigger(sub)
		return res
	}
}

function createReactiveObject(target) {
	
	const proxy = new Proxy(target, mutableHandlers)
	
	return proxy
}

function track(target, key) {
	if (!activeSub) {
		return
	}
	let depsMap = targetMap.get(target)
	if (!depsMap) {
		depsMap = new Map()
		targetMap.set(target, depsMap)
	}
	let deps = depsMap.get(key)
	if (!deps) {
		deps = new Dep()
		depsMap.set(key, deps)
	}
	link(deps, activeSub)
}

export function trigger(dep) {
	if (dep.subs) {
		propagate(dep.subs)
	}
}

class Dep {
	subs: Link
	subsTail: Link
	
	constructor() {
	}
}