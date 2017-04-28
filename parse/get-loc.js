export default (line, scolumn, ecolumn) => ({
  start: {
    line,
    column: scolumn,
  },
  end: {
    line,
    column: ecolumn,
  },
})
