import { hasOwn, isArray } from "@vue/shared";
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

function setFullProps(instance, rawProps, props, attrs) {
	const { propsOptions } = instance
	if (rawProps) {
		for (const key in rawProps) {
			const value = rawProps[key]
			if (hasOwn(propsOptions, key)) {
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