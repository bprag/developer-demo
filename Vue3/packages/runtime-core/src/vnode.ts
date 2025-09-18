import { isArray, isFunction, isNumber, isObject, isString, ShapeFlags } from "@vue/shared";

export const Text = Symbol('v-txt')

export function isVNode(target) {
	return !!target?.__v_isVNode
}

export function normalizeVNode(vnode) {
	if (isString(vnode) || isNumber(vnode)) {
		return createVNode(Text, null, String(vnode))
	}
	
	return vnode
}

export function normalizeChildren(children) {
	if (isNumber(children)) {
		children = String(children)
	}
	return children
}

/**
 * 判断两个虚拟节点是不是相同类型
 * @param n1 老节点
 * @param n2 新节点
 */
export function isSameVNodeType(n1, n2) {
	return n1.type === n2.type && n1.key === n2.key
}

export function createVNode(type, props, children = null) {
	children = normalizeChildren(children)
	
	let shapeFlag = 0;
	if (isString(type)) {
		shapeFlag = ShapeFlags.ELEMENT
	} else if (isObject(type)) {
		shapeFlag = ShapeFlags.STATEFUL_COMPONENT
	} else if (isFunction(type)) {
		shapeFlag = ShapeFlags.FUNCTIONAL_COMPONENT
	}
	
	if (isString(children)) {
		shapeFlag |= ShapeFlags.TEXT_CHILDREN
	} else if (isArray(children)) {
		shapeFlag |= ShapeFlags.ARRAY_CHILDREN
	}
	
	const vnode = {
		__v_isVNode: true,
		type,
		props,
		key: props?.key,
		children,
		shapeFlag,
		el: null
	}
	
	return vnode;
}