import reactNativeMorph from './react-native.js'

export default (options) =>
  reactNativeMorph({
    ...options,
    morpher: 'react-pdf',
    reactNativeLibraryImport: '@react-pdf/renderer',
  })
