export default state => {
  if (state.uses.includes('TextInput')) {
    state.uses.push('KeyboardAvoidingView')
    state.render = [
      `<KeyboardAvoidingView behavior='position'>`,
      ...state.render,
      `</KeyboardAvoidingView>`,
    ]
  }
}
