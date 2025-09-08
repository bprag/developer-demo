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
	let depsMap = targetMap.get(target)
	if (!depsMap) return
	
	const targetIsArray = Array.isArray(target)
	
	if (targetIsArray && key === 'length') {
		const length = target.length
		
		depsMap.forEach((dep, depKey) => {
			if (key >= length || depKey === 'length') {
				propagate(dep.subs)
			}
		})
		
	} else {
		let dep = depsMap.get(key)
		if (!dep) return;
		propagate(dep.subs)
	}
	
}
