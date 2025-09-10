export enum ShapeFlags {
	// 表示 DOM 元素
	ELEMENT = 1, // 1
	// 表示函数组件
	FUNCTIONAL_COMPONENT = 1 << 1, // 10
	// 表示有状态组件（带有状态、生命周期等）
	STATEFUL_COMPONENT = 1 << 2, // 100
	// 表示该节点的子节点是纯文本
	TEXT_CHILDREN = 1 << 3, // 1000
	// 表示该节点的子节点是数组形式（多个子节点）
	ARRAY_CHILDREN = 1 << 4, // 10000
	// 表示该节点的子节点是通过插槽（slots）传入的
	SLOTS_CHILDREN = 1 << 5, // 100000
	// 表示 Teleport 组件，用于将子节点传送到其他位置
	TELEPORT = 1 << 6, // 1000000
	// 表示 Suspense 组件，用于处理异步加载组件时显示备用内容
	SUSPENSE = 1 << 7, // 10000000
	// 表示该组件应当被 keep-alive（缓存）
	COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8, // 100000000
	// 表示该组件已经被 keep-alive（已缓存）
	COMPONENT_KEPT_ALIVE = 1 << 9, // 1000000000
	// 表示组件类型，有状态组件与无状态函数组件的组合 // 110
	COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT,
}
