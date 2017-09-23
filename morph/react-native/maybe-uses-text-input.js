export default state => {
  if (state.uses.includes('TextInput')) {
    state.use('DismissKeyboard')
    state.use('KeyboardAvoidingView')
    state.use('TouchableWithoutFeedback')

    state.render = [
      `<KeyboardAvoidingView behavior='position'>`,
      `<TouchableWithoutFeedback onPress={dismissKeyboard}>`,
      ...state.render,
      `</TouchableWithoutFeedback>`,
      `</KeyboardAvoidingView>`,
    ]
  }
}
