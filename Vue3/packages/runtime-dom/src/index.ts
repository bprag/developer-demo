export * from '@vue/runtime-core'
import { createRenderer } from "@vue/runtime-core";
import { nodeOps } from "./nodeOpt";
import { patchProp } from './patchProp'

const renderOptions = { patchProp, ...nodeOps }

const renderer = createRenderer(renderOptions)

// ts-ignore
export function render(vnode, container) {
	renderer.render(vnode, container)
}