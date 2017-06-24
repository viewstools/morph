export default state => {
  if (state.uses.includes('TextInput')) {
    state.uses.push('KeyboardAvoidingView')
    state.uses.push('DismissKeyboard')

    state.render = [
      `<KeyboardAvoidingView behavior='position'>`,
      `<TouchableWithoutFeedback onPress={dismissKeyboard}>`,
      ...state.render,
      `</TouchableWithoutFeedback>`,
      `</KeyboardAvoidingView>`,
    ]
  }
}
