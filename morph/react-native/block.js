import * as BlockBackgroundImage from './block-background-image.js'
import * as BlockCapture from './block-capture.js'
import * as BlockExplicitChildren from '../react/block-explicit-children.js'
// import * as BlockGoTo from './block-go-to.js'
import * as BlockInList from '../react/block-in-list.js'
import * as BlockName from './block-name.js'
import * as BlockList from '../react/block-list.js'
import * as BlockGroup from '../react/block-group.js'
import * as BlockProperties from './block-properties.js'
import * as BlockProxy from '../react/block-proxy.js'
import * as BlockRoute from '../react/block-route.js'
import * as BlockSetTestId from '../react/block-set-test-id.js'
import * as BlockTeleport from '../react/block-teleport.js'
import * as BlockAddTestIdProp from '../react/block-add-test-id-prop.js'
import * as BlockOffWhen from '../react/block-off-when.js'
import * as BlockWrap from './block-wrap.js'

export const enter = [
  BlockSetTestId.enter,
  BlockOffWhen.enter,
  BlockProxy.enter,
  BlockRoute.enter,
  BlockWrap.enter,
  BlockName.enter,
  BlockCapture.enter,
  BlockBackgroundImage.enter,
  BlockTeleport.enter,
  // BlockGoTo.enter,
  BlockInList.enter,
  BlockAddTestIdProp.enter,
  BlockProperties.enter,
  BlockGroup.enter,
  BlockList.enter,
]

export const leave = [
  BlockList.leave,
  BlockExplicitChildren.leave,
  BlockName.leave,
  BlockWrap.leave,
  BlockRoute.leave,
  BlockOffWhen.leave,
]
