let blacklist = [
  'aggregate',
  'classname',
  'data',
  'format',
  'formatout',
  'goto',
  'isfragment',
  'ismodal',
  'onclickid',
  'onclickselected',
  'onclickselectedtype',
  'onclickusediv',
  'perspective',
  'required',
  'rotatez',
  'scalez',
  'stream',
  'teleportto',
  'transformoriginz',
  'translatez',
  'type',
  'validate',
  'iskeyboardavoidingview',
]

export default (node, parent, state) =>
  !blacklist.includes(node.name.toLowerCase())
