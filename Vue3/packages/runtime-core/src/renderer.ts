import { ShapeFlags } from "@vue/shared";
import { isSameVNodeType, normalizeVNode, Text } from "./vnode"
import { createAppAPI } from "./apiCreateApp";
import { createComponentInstance, setupComponent } from "./component";
import { RectiveEffect } from "@vue/reactivity";
import { queueJob } from "./scheduler";
import { shouldUpdateComponent } from './componentRenderUtils';
import { updateProps } from './componentProps';

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
	 * 开始全量 diff
	 * @param c1
	 * @param c2
	 * @param container
	 */
	function patchKeyedChildren(c1, c2, container) {
		let i = 0;
		let e1 = c1.length - 1; // 老节点的尾索引
		let e2 = c2.length - 1; // 新节点的尾索引
		/**
		 * 头部对比
		 * [0,1,2,3,4,5,6]
		 * [0,1,2,3,4,5,6,7]
		 * 开始时：i=0, e1=6, e2=7
		 * 结束时：i=7, e1=6, e2=7
		 */
		while (i <= e1 && i <= e2) {
			const n1 = c1[i]
			const n2 = c2[i] = normalizeVNode(c2[i])
			if (isSameVNodeType(n1, n2)) {
				patch(n1, n2, container)
			} else {
				break
			}
			
			i++
		}
		/**
		 * 尾部对比
		 * [0,1,2,3,4,5,6,7]
		 * [8,0,1,2,3,4,5,6,7]
		 * 开始时：i = 0, e1 = 7, e2 = 8
		 * 结束时：i = 0，e1 = -1, e2 = 1
		 */
		while (i <= e1 && i <= e2) {
			const n1 = c1[e1]
			const n2 = c2[e2] = normalizeVNode(c2[e2])
			if (isSameVNodeType(n1, n2)) {
				patch(n1, n2, container)
			} else {
				break
			}
			
			e1--
			e2--
		}
		/**
		 * 理想情况：老节点比新节点少，创建新节点
		 * 理想情况：老节点比新节点多，删除老节点
		 * 乱序情况
		 */
		if (i > e1) {
			const nextPos = e2 + 1
			const anchor = nextPos < c2.length ? c2[nextPos].el : null
			while (i <= e2) {
				patch(null, c2[i] = normalizeVNode(c2[i]), container, anchor)
				i++
			}
		} else if (i > e2) {
			while (i <= e1) {
				unmount(c1[i])
				i++
			}
		} else {
			let s1 = i // 老节点开始索引
			let s2 = i // 新节点开始索引
			
			const keyToNewIndexMap = new Map()
			const newIndexToOldIndexMap = new Array(e2 - s2 + 1).fill(-1)
			
			for (let i = s2; i <= e2; i++) {
				const n2 = c2[i] = normalizeVNode(c2[i])
				keyToNewIndexMap.set(n2.key, i)
			}
			/**
			 * 处理老的
			 */
			let pos = -1;
			let moved = false;
			
			for (let j = s1; j <= e1; j++) {
				const n1 = c1[j]
				const nIndex = keyToNewIndexMap.get(n1.key)
				if (nIndex !== null && nIndex !== undefined) {
					if (nIndex > pos) {
						pos = nIndex
					} else {
						moved = true
					}
					newIndexToOldIndexMap[nIndex] = j
					patch(n1, c2[nIndex] = normalizeVNode(c2[nIndex]), container)
				} else {
					unmount(n1)
				}
			}
			
			const newIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []
			const sequence = new Set(newIndexSequence)
			
			/**
			 * 处理新的
			 */
			for (let j = e2; j >= s2; j--) {
				const n2 = c2[j]
				const anchor = j + 1 < c2.length ? c2[j + 1].el : null
				if (n2.el) {
					if (!sequence.has(j)) {
						hostInsert(n2.el, container, anchor)
					}
				} else {
					patch(null, n2, container, anchor)
				}
			}
		}
	}
	
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
		const preShapeFlag = n1.shapeFlag
		const nextShapeFlag = n2.shapeFlag
		
		if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
			
			if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
				unmountChildren(n1.children)
			}
			if (n1.children !== n2.children) {
				hostSetElementText(el, n2.children)
			}
		} else {
			if (preShapeFlag & ShapeFlags.TEXT_CHILDREN) {
				hostSetElementText(el, '')
				if (nextShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
					mountChildren(n2.children, el)
				}
			} else {
				if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
					if (nextShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
						// 全量 diff
						patchKeyedChildren(n1.children, n2.children, el)
					} else {
						unmountChildren(n1.children)
					}
				} else {
					if (nextShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
						mountChildren(n2.children, el)
					}
				}
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
		const { shapeFlag } = vnode;
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
			const child = children[i] = normalizeVNode(children[i])
			patch(null, child, container)
		}
	}
	
	/**
	 * 挂载
	 * @param vnode
	 * @param container
	 * @param anchor
	 */
	function mountElement(vnode, container, anchor) {
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
		} else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
			// children is array
			mountChildren(children, el)
		}
		
		hostInsert(el, container, anchor)
	}
	
	/**
	 * 处理文本
	 * @param n1
	 * @param n2
	 * @param container
	 * @param anchor
	 */
	function processText(n1, n2, container, anchor) {
		if (n1 === null) {
			const el = hostCreateText(n2.children)
			hostInsert(el, container, anchor)
			n2.el = el
		} else {
			n2.el = n1.el
			if (n1.children !== n2.children) {
				hostSetText(n2.el, n2.children)
			}
		}
	}
	
	/**
	 * 处理元素
	 * @param n1
	 * @param n2
	 * @param container
	 * @param anchor
	 */
	function processElement(n1, n2, container, anchor) {
		if (n1 === null) {
			mountElement(n2, container, anchor)
		} else {
			patchElement(n1, n2)
		}
	}
	
	function updateComponent(n1, n2) {
		const instance = (n2.component = n1.component)
		
		if (shouldUpdateComponent(n1, n2)) {
			instance.next = n2
			instance.update();
		} else {
			n2.el = n1.el
			instance.vnode = n2
		}
	}
	
	/**
	 * 处理组件有状态和无状态
	 * @param n1
	 * @param n2
	 * @param container
	 * @param anchor
	 */
	function processComponent(n1, n2, container, anchor) {
		if (n1 == null) {
			// 挂载
			mountComponent(n2, container, anchor)
		} else {
			// 更新
			updateComponent(n1, n2)
		}
	}
	
	function updateComponentPreRender(instance, next) {
		instance.vnode = next
		instance.next = null
		
		updateProps(instance, next)
	}
	
	function setupRenderEffect(instance, container, anchor) {
		
		const componentUpdataFn = () => {
			if (!instance.isMounted) {
				const { vnode } = instance
				const subTree = instance.render.call(instance.proxy)
				patch(null, subTree, container, anchor)
				vnode.el = subTree.el
				instance.subTree = subTree
				instance.isMounted = true
			} else {
				let { next, vnode } = instance
				if (next) {
					updateComponentPreRender(instance, next)
				} else {
					next = vnode
				}
				const preSubTree = instance.subTree
				const subTree = instance.render.call(instance.proxy)
				patch(preSubTree, subTree, container, anchor)
				next.el = subTree.el
				instance.subTree = subTree
			}
		}
		const effect = new RectiveEffect(componentUpdataFn)
		const update = effect.run.bind(effect)
		
		instance.update = update
		
		effect.scheduler = () => {
			queueJob(() => update())
		}
		
		update()
	}
	
	/**
	 * 挂载组件
	 * @param vnode
	 * @param container
	 * @param anchor
	 */
	function mountComponent(vnode, container, anchor) {
		const instance = createComponentInstance(vnode)
		vnode.component = instance;
		setupComponent(instance)
		setupRenderEffect(instance, container, anchor)
	}
	
	/**
	 * 更新和挂载
	 * @param n1 旧节点
	 * @param n2 新节点
	 * @param container 容器
	 * @param anchor 插入的节点
	 */
	function patch(n1, n2, container, anchor = null) {
		if (n1 === n2) return
		
		if (n1 && n2 === null) {
			unmount(n1)
			return;
		}
		
		if (n1 && !isSameVNodeType(n1, n2)) {
			unmount(n1)
			n1 = null
		}
		/**
		 * 处理元素、文本、组件
		 */
		const { shapeFlag, type } = n2
		
		switch (type) {
			case Text:
				processText(n1, n2, container, anchor)
				break
			default:
				if (shapeFlag & ShapeFlags.ELEMENT) {
					// 元素
					processElement(n1, n2, container, anchor)
				} else if (shapeFlag & ShapeFlags.COMPONENT) {
					processComponent(n1, n2, container, anchor)
				}
			
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
		
		container._vnode = vnode // 保存旧节点
	}
	
	return {
		render,
		createApp: createAppAPI(render)
	}
}

/**
 * 最长递增子序列
 * @param target
 */
function getSequence(target: number[]): number[] {
	const result = []
	
	const map = new Map<number, number>()
	
	for (let i = 0; i < target.length; i++) {
		const item = target[i]
		if (item === -1 || item === undefined) {
			continue
		}
		
		if (result.length === 0) {
			result.push(i)
			continue
		}
		
		const preIndex = result[result.length - 1]
		const preItem = target[preIndex]
		
		if (item > preItem) {
			result.push(i)
			map.set(i, preIndex)
			continue
		}
		
		let left = 0;
		let right = result.length - 1;
		
		while (left < right) {
			const mid = Math.floor((left + right) / 2)
			const midItem = target[result[mid]]
			
			if (midItem > item) {
				left = mid + 1
			} else {
				right = mid
			}
		}
		
		if (target[result[left]] > item) {
			if (left > 0) {
				map.set(i, result[left - 1])
			}
			result[left] = i
		}
	}
	
	let l = result.length
	let last = result[l - 1]
	while (l > 0) {
		l--;
		result[l] = last
		last = map.get(last)
	}
	
	return result
}