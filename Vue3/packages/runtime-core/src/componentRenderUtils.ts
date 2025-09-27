import { setCurrentRenderingInstance, unCurrentRenderingInstance } from './component';
import { ShapeFlags } from '@vue/shared';

export function hasPropsChanged(prevProps, nextProps) {
	const nextKeys = Object.keys(nextProps)
	const preKeys = Object.keys(prevProps)
	
	if (nextKeys.length !== preKeys.length) {
		return true
	}
	
	for (const key of nextKeys) {
		if (nextProps[key] !== prevProps[key]) {
			return true
		}
	}
	return false
}

export function shouldUpdateComponent(n1, n2) {
	const { props: prevProps, children: prevChildren } = n1
	const { props: nextProps, children: nextChildren } = n2
	
	if (prevChildren || nextChildren) {
		return true
	}
	
	if (!prevProps) {
		return !!nextProps
	}
	
	if (!nextProps) {
		return true
	}
	
	return hasPropsChanged(prevProps, nextProps)
}

export function renderComponentRoot(instance) {
	const { vnode } = instance
	
	if (vnode.shapeFlage & ShapeFlags.STATEFUL_COMPONENT) {
		setCurrentRenderingInstance(instance)
		const subTree = instance.render.call(instance.proxy)
		unCurrentRenderingInstance()
		
		return subTree
	} else {
		return vnode.type(instance.props, {
			get attrs() {
				return instance.attrs
			},
			slots: instance.slots,
			emit: instance.emit
		})
	}
}