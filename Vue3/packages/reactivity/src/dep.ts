import { activeSub } from "./effect";
import { Link, link, propagate } from "./system";

const targetMap = new WeakMap()

class Dep {
	subs: Link
	subsTail: Link
	
	constructor() {
	}
}

export function track(target, key) {
	if (!activeSub) return
	
	let depsMap = targetMap.get(target)
	
	if (!depsMap) {
		depsMap = new Map()
		targetMap.set(target, depsMap)
	}
	
	let dep = depsMap.get(key)
	if (!dep) {
		dep = new Dep()
		depsMap.set(key, dep)
	}
	
	link(dep, activeSub)
}

export function trigger(target, key) {
	let activeSubs = targetMap.get(target)
	let dep = activeSubs && activeSubs.get(key)
	
	propagate(dep.subs)
}
