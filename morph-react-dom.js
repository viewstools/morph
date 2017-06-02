import {
  getObjectAsString,
  getProp,
  hasKeys,
  hasProp,
  isCode,
} from './morph-utils.js';
import { makeVisitors, wrap } from './morph-react.js';
import { TELEPORT } from './types.js';
import { transform } from 'babel-core';
import getBody from './react-native/get-body.js';
import getDependencies from './react-native/get-dependencies.js';
import isUnitlessNumber from './react-native/is-unitless-number.js';
import hash from './hash.js';
import morph from './morph.js';
import toSlugCase from 'to-slug-case';

export default ({ getImport, name, view }) => {
  const state = {
    captures: [],
    fonts: [],
    render: [],
    styles: {},
    todos: [],
    uses: [],
    use(name) {
      if (!state.uses.includes(name) && !/props/.test(name))
        state.uses.push(name);
    },
  };

  morph(
    view,
    state,
    makeVisitors({
      getBlockName,
      getStyleForProperty,
      getValueForProperty,
      isValidPropertyForBlock,
      PropertiesStyleLeave,
    })
  );

  // TODO
  if (Object.keys(state.styles).length > 0) {
    state.uses.push('glam');
  }

  return toComponent({ getImport, name, state });
};

function PropertiesStyleLeave(node, parent, state) {
  if (hasKeys(node.style.static.base)) {
    const id = hash(node.style.static);
    state.styles[id] = node.style.static;
    parent.styleId = id;
    const isActive = getProp(parent, 'isActive');

    let className = [
      `styles.${id}`,
      isActive && `${isActive.value.value} && 'active'`,
    ].filter(Boolean);

    if (className.length > 0) {
      className = className.map(k => `\${${k}}`).join(' ');
      className = `\`${className}\``;
    }

    state.render.push(` className=${wrap(className)}`);
  }
  // TODO needs to be different, it should also be a classname here too
  if (hasKeys(node.style.dynamic.base)) {
    const dynamic = getObjectAsString(node.style.dynamic.base);
    state.render.push(` style={${dynamic}}`);
  }
}

const getBlockName = node => {
  switch (node.name.value) {
    case 'CaptureEmail':
    case 'CaptureFile':
    case 'CaptureInput':
    case 'CaptureNumber':
    case 'CapturePhone':
    case 'CaptureSecure':
    case 'CaptureText':
      return 'input';

    case 'Horizontal':
    case 'Vertical':
      return getGroupBlockName(node);

    case 'Image':
      return 'img';

    case 'Text':
    case 'List':
      return 'div';

    case 'Proxy':
      return getProxyBlockName(node);
    // TODO SvgText should be just Text but the import should be determined from the parent
    // being Svg

    case 'SvgText':
      return 'text';

    default:
      return node.name.value;
  }
};

const getGroupBlockName = node => {
  let name = 'div';

  if (hasProp(node, 'teleportTo')) {
    name = TELEPORT;
  } else if (hasProp(node, 'goTo')) {
    name = 'a';
  } else if (hasProp(node, 'onClick')) {
    name = 'button';
  } else if (hasProp(node, 'overflowY', v => v === 'auto' || v === 'scroll')) {
    name = 'div';
  }

  return name;
};

const getProxyBlockName = node => {
  const from = getProp(node, 'from');
  return from && from.value.value;
};

const getStyleForProperty = (node, parent, code) => {
  const key = node.key.value;
  const value = node.value.value;

  switch (key) {
    case 'zIndex':
      return {
        zIndex: code ? value : parseInt(value, 10),
      };

    default:
      return {
        [key]: code && !/(.+)\?(.+):(.+)/.test(value) ? safe(value) : value,
      };
  }
};

const getValueForProperty = (node, parent) => {
  const key = node.key.value;
  const value = node.value.value;

  switch (node.value.type) {
    case 'Literal':
      return {
        [key]: typeof value === 'string' && !isCode(node)
          ? JSON.stringify(value)
          : wrap(value),
      };
    // TODO lists
    case 'ArrayExpression':
    // TODO support object nesting
    case 'ObjectExpression':
    default:
      return false;
  }
};

// const blacklist = ['overflow', 'overflowX', 'overflowY', 'fontWeight']
const isValidPropertyForBlock = (node, parent) => true;
// !blacklist.includes(node.key.value)

const getValue = (key, value) =>
  typeof value === 'number' &&
    !(isUnitlessNumber.hasOwnProperty(key) && isUnitlessNumber[key])
    ? `${value}px`
    : `${value}`;

const toCss = obj =>
  Object.keys(obj)
    .map(k => `${toSlugCase(k)}: ${getValue(k, obj[k])};`)
    .join('\n');

const toNestedCss = ({
  base,
  hover,
  active,
  activeHover,
  disabled,
  placeholder,
}) => {
  const baseCss = toCss(base);
  const hoverCss = toCss(hover);
  const activeCss = toCss(active);
  const activeHoverCss = toCss(activeHover);
  const disabledCss = toCss(disabled);
  const placeholderCss = toCss(placeholder);

  const ret = [
    baseCss,
    hoverCss && `&:hover {${hoverCss}}`,
    activeCss && `&.active {${activeCss}}`,
    activeHoverCss && `&.active:hover {${activeHoverCss}}`,
    disabledCss && `&:disabled {${disabledCss}}`,
    placeholderCss && `&::placeholder {${placeholderCss}}`,
  ]
    .filter(Boolean)
    .join('\n');

  return ret;
};

const getStyles = styles => {
  if (!hasKeys(styles)) return '';

  const obj = Object.keys(styles)
    .map(k => `${JSON.stringify(k)}: css\`${toNestedCss(styles[k])}\``)
    .join(',');

  return transformGlam(`const styles = {${obj}}`).code;
};

const transformGlam = code =>
  transform(code, {
    babelrc: false,
    plugins: [[require.resolve('glam/babel'), { inline: true }]],
  });

// THE SAME
const toComponent = ({ getImport, name, state }) => `import React from 'react'
${getDependencies(state.uses, getImport)}

${getStyles(state.styles)}

${getBody({ state, name })}
export default ${name}`;

const interpolateCode = s => (/props|item/.test(s) ? '${' + s + '}' : s);
const safe = s => '`' + s.split(' ').map(interpolateCode).join(' ') + '`';
