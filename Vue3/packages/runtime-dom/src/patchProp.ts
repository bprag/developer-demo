import { isOn } from "@vue/shared";
import { patchClass } from "./modules/patchClass";
import { patchStyle } from "./modules/patchStyle";
import { patchEvents } from "./modules/patchEvents";
import { patchAttrs } from "./modules/patchAttrs";

export function patchProp(el, key, prevValue, nextValue, namespace, parentComponent) {
	// console.warn('el:=>', el)
	// console.warn('key:=>', key)
	// console.warn('prevValue:=>', prevValue)
	// console.warn('nextValue:=>', nextValue)
	// console.warn('namespace:=>', namespace)
	// console.warn('parentComponent:=>', parentComponent)
	
	if (key === 'class') {
		return patchClass(el, nextValue)
	}
	
	if (key === 'style') {
		return patchStyle(el, prevValue, nextValue)
	}
	
	if (isOn(key)) {
		return patchEvents(el, key, nextValue)
	}
	
	patchAttrs(el, key, nextValue)
}