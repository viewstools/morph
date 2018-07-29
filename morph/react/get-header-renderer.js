export default state => {
  return state.externalHeader
    ? `const headerRenderer = ({ label }) => { 
        return <${state.externalHeader.name} value={label} />;
      };`
    : ''
}
