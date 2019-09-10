import reactNativeMorph from './react-native.js'

export default options =>
  reactNativeMorph({
    ...options,
    reactNativeLibraryImport: '@react-pdf/renderer',
  })
