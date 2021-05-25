import * as BlockAddTestIdProp from '../react/block-add-test-id-prop.js'
import * as BlockAddViewPath from '../react/block-add-view-path.js'
import * as BlockAddData from '../react/block-add-data'
import * as BlockCapture from './block-capture.js'
import * as BlockColumn from '../react/block-column.js'
import * as BlockExplicitChildren from '../react/block-explicit-children.js'
import * as BlockGoTo from './block-go-to.js'
import * as BlockGroup from '../react/block-group.js'
import * as BlockInList from '../react/block-in-list.js'
import * as BlockList from '../react/block-list.js'
import * as BlockMaybeSkip from '../react/block-maybe-skip.js'
import * as BlockName from './block-name.js'
import * as BlockOffWhen from '../react/block-off-when.js'
import * as BlockSetFlowToBasedOnData from '../react/block-set-flow-to-based-on-data.js'
import * as BlockProfile from '../react/block-profile.js'
import * as BlockProperties from './block-properties.js'
import * as BlockSetTestId from '../react/block-set-test-id.js'
import * as BlockTable from '../react/block-table.js'

// match new lines with ../react-native/block.js
export let enter = [
  BlockMaybeSkip.enter,
  BlockSetTestId.enter,
  BlockAddData.enter,
  BlockOffWhen.enter,
  BlockSetFlowToBasedOnData.enter,

  BlockName.enter,
  BlockProfile.enter,
  BlockTable.enter,
  BlockColumn.enter,

  BlockCapture.enter,
  BlockGoTo.enter,

  BlockInList.enter,
  BlockAddTestIdProp.enter,
  BlockAddViewPath.enter,
  BlockProperties.enter,
  BlockGroup.enter,
  BlockList.enter,
]

export let leave = [
  BlockList.leave,
  BlockExplicitChildren.leave,
  BlockGroup.leave,
  BlockName.leave,
  BlockTable.leave,

  BlockOffWhen.leave,
]
