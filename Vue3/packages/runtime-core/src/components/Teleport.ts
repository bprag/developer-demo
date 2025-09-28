export const isTeleport = type => type?.__isTeleport

export const Teleport = {
	name: 'Teleport',
	__isTeleport: true,
	props: {
		to: {
			type: String
		},
		disabled: {
			type: Boolean
		}
	},
	process(n1, n2, container, anchor, parentComponent, internals) {
		const {
			mountChildren,
			patchChildren,
			options: { querySelector, insert }
		} = internals
		
		const { disabled, to } = n2.props
		
		if (n1 == null) {
			const target = disabled ? container : querySelector(to)
			if (target) {
				n2.target = target
				mountChildren(n2.children, target, parentComponent)
			}
		} else {
			patchChildren(n1, n2, n1.target, parentComponent)
			n2.target = n1.target
			
			const prevProps = n1.props
			
			if (prevProps.to !== to || prevProps.disabled !== disabled) {
				const target = disabled ? container : querySelector(to)
				for (const child of n2.children) {
					insert(child.el, target)
				}
				n2.target = target
			}
		}
	}
}