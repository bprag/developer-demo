export * from '@vue/runtime-core'

import { nodeOps } from "./nodeOpt";
import { patchProp } from './patchProp'

const renderOptions = { patchProp, ...nodeOps }

export { renderOptions }