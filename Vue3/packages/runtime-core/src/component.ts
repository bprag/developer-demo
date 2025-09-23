import { proxyRefs } from "@vue/reactivity";
import { hasOwn, isFunction, isObject } from "@vue/shared";
import { initProps, normalizePropsOptions } from "./componentProps";
import { nextTick } from "./scheduler";

export function createComponentInstance(vnode) {
	const { type } = vnode
	const instance: { [key in string]: any } = {
		type,
		vnode,
		propsOptions: normalizePropsOptions(type.props),
		props: {},
		attrs: {},
		setupState: null,
		render: null,
		// 子树
		subTree: null,
		// 是否已经挂载
		isMounted: false
	}
	
	instance.ctx = { _: instance }
	instance.emit = emit.bind(null, instance)
	
	return instance
}

export function setupComponent(instance) {
	initProps(instance)
	setupStatefulComponent(instance)
}

function createSetupContext(instance) {
	return {
		get attrs() {
			return instance.attrs
		},
		emit(event, ...args) {
			emit(instance, event, ...args)
		}
	}
}

const publicPropertiesMap = {
	$el: instance => instance.vnode.el,
	$refs: instance => instance.refs,
	$emit: instance => instance.emit,
	$attrs: instance => instance.attrs,
	$slots: instance => instance.slots,
	$nextTick: instance => nextTick.bind(instance),
	$forceUpdate: instance => () => instance.update()
}

const publicInstanceProxyHandlers = {
	get(target, key) {
		const { _: instance } = target
		const { setupState, attrs } = instance
		
		if (hasOwn(setupState, key)) {
			return setupState[key]
		}
		
		if (hasOwn(attrs, key)) {
			return attrs[key]
		}
		
		if (hasOwn(publicPropertiesMap, key)) {
			const publicGetter = publicPropertiesMap[key]
			return publicGetter(instance)
		}
		
		return instance[key]
	},
	set(target, key, value) {
		const { _: instance } = target
		const { setupState } = instance
		
		if (hasOwn(setupState, key)) {
			setupState[key] = value
		}
		
		return true
	}
}

function setupStatefulComponent(instance) {
	const { type } = instance
	
	instance.proxy = new Proxy(instance.ctx, publicInstanceProxyHandlers)
	
	if (isFunction(type.setup)) {
		const setupContext = createSetupContext(instance)
		const setupResult = proxyRefs(type.setup(instance.props, setupContext))
		handleSetupResult(instance, setupResult)
	}
	if (!instance.render) {
		instance.render = type.render
	}
}

function handleSetupResult(instance, setupResult) {
	if (isFunction(setupResult)) {
		instance.render = setupResult
	} else if (isObject(setupResult)) {
		instance.setupState = proxyRefs(setupResult)
	}
}

export function emit(instance, event, ...args) {
	const eventName = `on${ event[0].toUpperCase() }${ event.slice(1) }`
	
	const handler = instance.vnode.props[eventName]
	handler && isFunction(handler) && handler(...args)
}