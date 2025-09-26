import { getCurrentInstance } from '@vue/runtime-core';
import { ref } from '@vue/reactivity';

export function useTemplateRef(target: string) {
	const vm = getCurrentInstance()
	const refs = ref(null)
	
	Object.defineProperty(vm.refs, target, {
		get() {
			return refs.value
		},
		set(newVal) {
			refs.value = newVal
		}
	})
	
	return refs
}