import { track, trigger } from "./dep";
import { isRef } from "./ref";
import { hasChanged, isObject } from "@vue/shared";
import { reactive } from "./reactive";

export const mutableHandlers = {
	get(target, key, receiver) {
		track(target, key)
		
		let res = Reflect.get(target, key, receiver)
		
		if (isRef(res)) {
			return res.value
		}
		if (isObject(res)) {
			return reactive(res)
		}
		
		return res
	},
	set(target, key, newValue, receiver) {
		let oldValue = target[key]
		let res = Reflect.set(target, key, newValue, receiver)
		
		if (isRef(oldValue) && !isRef(newValue)) {
			oldValue.value = newValue
			return res
		}
		
		if (hasChanged(oldValue, receiver)) {
			trigger(target, key)
		}
		
		return res
	}
}