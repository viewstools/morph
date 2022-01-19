import * as BlockAddData from '../react/block-add-data'
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
import * as BlockSetFlowToBasedOnData from '../react/block-set-flow-to-based-on-data.js'
import * as BlockProfile from '../react/block-profile.js'
import * as BlockProperties from './block-properties.js'
import * as BlockSetTestId from '../react/block-set-test-id.js'
import * as BlockSvg from './block-svg.js'
import * as BlockTable from '../react/block-table.js'
import * as BlockWrap from './block-wrap.js'
import * as BlockScrollView from './block-scroll-view.js'

// match new lines with ../react-dom/block.js
export let enter = [
  BlockMaybeSkip.enter,
  BlockSetTestId.enter,
  BlockAddData.enter,
  BlockOffWhen.enter,
  BlockWrap.enter,
  BlockSetFlowToBasedOnData.enter,

  BlockName.enter,
  BlockProfile.enter,
  BlockTable.enter,
  BlockColumn.enter,

  BlockSvg.enter,
  BlockCapture.enter,

  BlockBackgroundImage.enter,
  BlockInList.enter,
  BlockAddTestIdProp.enter,

  BlockScrollView.enter,
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
  BlockWrap.leave,
  BlockOffWhen.leave,
]
