import { hasOwn, isArray, ShapeFlags } from "@vue/shared";
import { reactive } from "@vue/reactivity";

export function normalizePropsOptions(props = {}) {
	if (isArray(props)) {
		return props.reduce((prev, cur) => {
			prev[cur] = {}
			return prev
		}, {})
	}
	
	return props
}

export function updateProps(instance, nextVNode) {
	const { props, attrs } = instance
	
	const rawProps = nextVNode.props
	
	setFullProps(instance, rawProps, props, attrs)
	
	for (const key in props) {
		if (!hasOwn(rawProps, key)) {
			delete props[key]
		}
	}
	
	for (const key in attrs) {
		if (!hasOwn(rawProps, key)) {
			delete attrs[key]
		}
	}
}

function setFullProps(instance, rawProps, props, attrs) {
	const { propsOptions, vnode } = instance
	const isFunctionComponents = vnode.shapeFlag & ShapeFlags.FUNCTIONAL_COMPONENT
	const hasProps = Object.keys(propsOptions).length
	if (rawProps) {
		for (const key in rawProps) {
			const value = rawProps[key]
			if (hasOwn(propsOptions, key) || (isFunctionComponents && !hasProps)) {
				props[key] = value
			} else {
				attrs[key] = value
			}
		}
	}
}

export function initProps(instance) {
	const { vnode } = instance
	const rawProps = vnode.props
	
	const props = {}
	const attrs = {}
	
	setFullProps(instance, rawProps, props, attrs)
	
	instance.props = reactive(props)
	instance.attrs = attrs
}