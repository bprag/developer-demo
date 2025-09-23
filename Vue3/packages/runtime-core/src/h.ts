import { isArray, isObject } from "@vue/shared";
import { createVNode, isVNode } from "./vnode";

/**
 * h 函数的使用方法：
 * 1. h('div', 'hello world') 第二个参数为 子节点
 * 2. h('div', [h('span', 'hello'), h('span', ' world')]) 第二个参数为 子节点
 * 3. h('div', h('span', 'hello')) 第二个参数为 子节点
 * 4. h('div', { class: 'container' }) 第二个参数是 props
 * ------
 * 5. h('div', { class: 'container' }, 'hello world')
 * 6. h('div', { class: 'container' }, h('span', 'hello world'))
 * 7. h('div', { class: 'container' }, h('span', 'hello'), h('span', 'world'))
 * 8. h('div', { class: 'container' },[h('span', 'hello'), h('span', 'world')]) 和 7 一个意思
 */
export function h(type, propsOrChildren?, children?) {
	const len = arguments.length
	
	if (len === 2) {
		if (isArray(propsOrChildren)) {
			// h('div', [h('span', 'hello'), h('span', ' world')])
			return createVNode(type, null, propsOrChildren)
		}
		if (isObject(propsOrChildren)) {
			// h('div', h('span', 'hello'))
			if (isVNode(propsOrChildren)) {
				return createVNode(type, null, [propsOrChildren])
			}
			// h('div', { class: 'container' })
			return createVNode(type, propsOrChildren)
		}
		// h('div', 'hello world')
		return createVNode(type, null, propsOrChildren)
	} else {
		if (len > 3) {
			children = [...arguments].slice(2)
		} else if (isVNode(children)) {
			children = [children]
		}
		return createVNode(type, propsOrChildren, children)
	}
}