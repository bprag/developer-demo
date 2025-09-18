import { proxyRefs } from "@vue/reactivity";

export function createComponentInstance(vnode) {
	const { type } = vnode
	const instance = {
		type,
		vnode,
		attrs: {},
		props: {},
		setupState: null,
		render: null,
		// 子树
		subTree: null,
		// 是否已经挂载
		isMounted: false
	}
	return instance
}

export function setupComponent(instance) {
	const { type } = instance
	instance.setupState = proxyRefs(type.setup())
	instance.render = type.render
}