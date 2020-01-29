import * as BlockAddTestIdProp from '../react/block-add-test-id-prop.js'
import * as BlockBackgroundImage from './block-background-image.js'
import * as BlockCapture from './block-capture.js'
import * as BlockColumn from '../react/block-column.js'
import * as BlockExplicitChildren from '../react/block-explicit-children.js'
import * as BlockGroup from '../react/block-group.js'
import * as BlockInList from '../react/block-in-list.js'
import * as BlockList from '../react/block-list.js'
import * as BlockMaybeSkip from '../react/block-maybe-skip.js'
import * as BlockName from './block-name.js'
import * as BlockOffWhen from '../react/block-off-when.js'
import * as BlockProperties from './block-properties.js'
import * as BlockRoute from '../react/block-route.js'
import * as BlockSetTestId from '../react/block-set-test-id.js'
import * as BlockSvg from './block-svg.js'
import * as BlockTable from '../react/block-table.js'
import * as BlockTeleport from '../react/block-teleport.js'
import * as BlockWrap from './block-wrap.js'

export let enter = [
  BlockMaybeSkip.enter,
  BlockSetTestId.enter,
  BlockOffWhen.enter,
  BlockRoute.enter,
  BlockWrap.enter,
  BlockName.enter,
  BlockTable.enter,
  BlockColumn.enter,
  BlockSvg.enter,
  BlockCapture.enter,
  BlockBackgroundImage.enter,
  BlockTeleport.enter,
  BlockInList.enter,
  BlockAddTestIdProp.enter,
  BlockProperties.enter,
  BlockGroup.enter,
  BlockList.enter,
]

export let leave = [
  BlockList.leave,
  BlockExplicitChildren.leave,
  BlockName.leave,
  BlockTable.leave,
  BlockWrap.leave,
  BlockRoute.leave,
  BlockOffWhen.leave,
]
