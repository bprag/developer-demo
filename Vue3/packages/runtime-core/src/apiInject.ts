import { getCurrentInstance } from '../src/component';

export function provide(key, value) {
	const instance = getCurrentInstance();
	
	const parentProvides = instance.parent ? instance.parent.provides : instance.appContext.provides
	
	let provides = instance.provides;
	
	if (provides === parentProvides) {
		instance.provides = Object.create(parentProvides);
		provides = instance.provides;
	}
	
	provides[key] = value;
}

export function inject(key, defaultValue) {
	const instance = getCurrentInstance();
	
	const parentProvides = instance.parent ? instance.parent.provides : instance.appContext.provides
	
	if (key in parentProvides) {
		return parentProvides[key];
	}
	
	return defaultValue
}