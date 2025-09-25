import { getCurrentInstance, setCurrentInstance, unCurrentInstance } from './component';

export enum LifecycleHooks {
	// 挂载
	BEFORE_MOUNT = 'bm',
	MOUNTED = 'm',
	
	// 更新
	BEFORE_UPDATE = 'bu',
	UPDATED = 'u',
	
	// 卸载
	BEFORE_UNMOUNT = 'bum',
	UNMOUNTED = 'um',
}

/**
 * 注入生命周期
 * @param target 当前组件的实例
 * @param hook 用户传递的回调函数
 * @param type 生命周期的类型 bm um
 */
function injectHook(target, hook, type) {
	if (target && target[type] == null) {
		target[type] = []
	}
	const _hook = () => {
		setCurrentInstance(target)
		try {
			hook()
		} finally {
			unCurrentInstance()
		}
	}
	target[type].push(_hook)
}

function createHook(type) {
	return (hook, target = getCurrentInstance()) => {
		injectHook(target, hook, type)
	}
}

export function triggerHooks(instance, type) {
	const hooks = instance[type]
	
	hooks?.forEach(hook => hook())
}

export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT)
export const onMounted = createHook(LifecycleHooks.MOUNTED)

export const onBeforeUpdate = createHook(LifecycleHooks.BEFORE_UPDATE)
export const onUpdated = createHook(LifecycleHooks.UPDATED)

export const onBeforeUnmount = createHook(LifecycleHooks.BEFORE_UNMOUNT)
export const onUnmounted = createHook(LifecycleHooks.UNMOUNTED)