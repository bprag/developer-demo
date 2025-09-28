import { isArray, isFunction, isNumber, isObject, isString, ShapeFlags } from "@vue/shared";
import { getCurrentRenderingInstance } from './component';
import { isTeleport } from './components/Teleport';

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

export function normalizeChildren(vnode, children) {
	let { shapeFlag } = vnode
	
	if (isArray(children)) {
		shapeFlag |= ShapeFlags.ARRAY_CHILDREN
	} else if (isObject(children)) {
		if (shapeFlag & ShapeFlags.COMPONENT) {
			shapeFlag |= ShapeFlags.SLOTS_CHILDREN
		}
	} else if (isFunction(children)) {
		if (shapeFlag & ShapeFlags.COMPONENT) {
			shapeFlag |= ShapeFlags.SLOTS_CHILDREN
			children = {
				default: children
			}
		}
	} else if (isNumber(children) || isString(children)) {
		children = String(children)
		shapeFlag |= ShapeFlags.TEXT_CHILDREN
	}
	
	vnode.shapeFlag = shapeFlag
	vnode.children = children
	return children
}

export function normalizeRef(ref) {
	return {
		r: ref,
		i: getCurrentRenderingInstance()
	}
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
	
	let shapeFlag = 0;
	
	if (isString(type)) {
		shapeFlag = ShapeFlags.ELEMENT
	} else if (isTeleport(type)) {
		shapeFlag = ShapeFlags.TELEPORT
	} else if (isObject(type)) {
		shapeFlag = ShapeFlags.STATEFUL_COMPONENT
	} else if (isFunction(type)) {
		shapeFlag = ShapeFlags.FUNCTIONAL_COMPONENT
	}
	
	const vnode = {
		__v_isVNode: true,
		type,
		props,
		shapeFlag,
		appContext: null,
		key: props?.key,
		children: null,
		el: null,
		ref: normalizeRef(props?.ref)
	}
	
	normalizeChildren(vnode, children)
	
	return vnode;
}