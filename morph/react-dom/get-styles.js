export default ({ styles }) =>
  `\n${Object.keys(styles)
    .map(k => styles[k])
    .join('\n')}`
