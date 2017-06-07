const interpolateCode = s => (/props|item/.test(s) ? '${' + s + '}' : s)

export default s => '`' + s.split(' ').map(interpolateCode).join(' ') + '`'
