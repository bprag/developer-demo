import { ShapeFlags } from "@vue/shared";
import { isSameVNodeType } from "./vnode"

export function createRenderer(options) {
	const {
		createElement: hostCreateElement,
		createText: hostCreateText,
		remove: hostRemove,
		setElementText: hostSetElementText,
		setText: hostSetText,
		parentNode: hostParentNode,
		nextSibling: hostNextSibling,
		insert: hostInsert,
		patchProp: hostPatchProp
	} = options
	
	/**
	 * 更新子节点
	 * @param n1 旧节点
	 * @param n2 新节点
	 */
	function patchChildren(n1, n2) {
		const el = n2.el
		/**
		 * 1. 新节点是文本
		 *    1.1 老的是文本
		 *    1.2 老的是数组
		 * 2. 新节点是数组
		 *    2.1 老的是数组
		 *    2.2 老的是文本
		 */
		const nextShapeFlag = n2.shapeFlag
		
		if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
			const preShapeFlag = n1.shapeFlag
			
			if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
				unmountChildren(n1.children)
			}
			if (n1.children !== n2.children) {
				hostSetElementText(el, n2.children)
			}
		} else {
			const preShapeFlag = n1.shapeFlag
			
			if (preShapeFlag & ShapeFlags.TEXT_CHILDREN) {
				hostSetElementText(el, '')
				mountChildren(n2.children, el)
			} else {
			
			}
		}
	}
	
	/**
	 * 更新 props
	 * @param el
	 * @param oldProps
	 * @param newProps
	 */
	function patchProps(el, oldProps, newProps) {
		if (oldProps) {
			for (const key in oldProps) {
				hostPatchProp(el, key, oldProps[key], null)
			}
		}
		if (newProps) {
			for (const key in newProps) {
				hostPatchProp(el, key, oldProps?.[key], newProps[key])
			}
		}
	}
	
	/**
	 * 更新元素
	 * 1. 复用 dom 元素
	 * 2. 更新属性
	 * 3. 更新子节点
	 * @param n1
	 * @param n2
	 */
	function patchElement(n1, n2) {
		const el = (n2.el = n1.el)
		// props 更新
		const oldProps = n1.props || {}
		const newProps = n2.props || {}
		patchProps(el, oldProps, newProps)
		// children 更新
		patchChildren(n1, n2)
	}
	
	/**
	 * 卸载子节点
	 * @param children
	 */
	function unmountChildren(children) {
		for (let i = 0; i < children.length; i++) {
			unmount(children[i])
		}
	}
	
	/**
	 * 卸载
	 * @param vnode 旧节点
	 */
	function unmount(vnode) {
		const { type, shapeFlag, children } = vnode;
		if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
			// 递归卸载子节点
			unmountChildren(vnode.children)
		}
		hostRemove(vnode.el);
	}
	
	/**
	 * 挂载子节点
	 * @param children
	 * @param container
	 */
	function mountChildren(children, container) {
		for (let i = 0; i < children.length; i++) {
			const child = children[i]
			patch(null, child, container)
		}
	}
	
	/**
	 * 挂载
	 * @param vnode
	 * @param container
	 */
	function mountElement(vnode, container) {
		const { type, props, children, shapeFlag } = vnode
		
		const el = hostCreateElement(type)
		vnode.el = el
		// props
		if (props) {
			for (const key in props) {
				hostPatchProp(el, key, null, props[key])
			}
		}
		// children
		if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
			// children is text
			hostSetElementText(el, children)
		} else {
			// children is array
			mountChildren(children, el)
		}
		
		hostInsert(el, container)
	}
	
	/**
	 * 更新和挂载
	 * @param n1 旧节点
	 * @param n2 新节点
	 * @param container 容器
	 */
	function patch(n1, n2, container) {
		if (n1 === n2) return
		
		if (n1 && n2 === null) {
			unmount(n1)
			return;
		}
		
		if (n1 && !isSameVNodeType(n1, n2)) {
			unmount(n1)
			n1 = null
		}
		
		if (n1 === null) {
			mountElement(n2, container)
		} else {
			// TODO 更新
			console.log('更新');
			patchElement(n1, n2)
		}
	}
	
	/**
	 * 渲染
	 * 1. 挂载
	 * 2. 更新
	 * 3. 卸载
	 * @param vnode
	 * @param container
	 */
	const render = (vnode, container) => {
		
		if (vnode === null) {
			if (container._vnode) {
				unmount(container._vnode)
			}
		} else {
			patch(container._vnode || null, vnode, container)
		}
		console.log('container._vnode', container._vnode);
		container._vnode = vnode // 保存旧节点
	}
	
	return {
		render
	}
}