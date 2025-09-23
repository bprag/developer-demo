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