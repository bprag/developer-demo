import { isRef } from '@vue/reactivity';
import { isString, ShapeFlags } from '@vue/shared';
import { getComponentPublicInstance } from './component';

export function setRef(ref, vnode) {
	const { shapeFlag } = vnode
	const { r: rawRef, i: instance } = ref
	
	if (isRef(rawRef)) {
		if (shapeFlag & ShapeFlags.COMPONENT) {
			rawRef.value = getComponentPublicInstance(vnode.component)
		} else {
			// dom 元素
			rawRef.value = vnode.el
		}
	} else if (isString(rawRef)) {
		console.log(`🚀 ~ instance =>`, instance)

		if (shapeFlag & ShapeFlags.COMPONENT) {
			instance.refs[rawRef] = getComponentPublicInstance(vnode.component)
		} else {
			instance.refs[rawRef] = vnode.el
		}
	}
}