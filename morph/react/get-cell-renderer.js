export default state => {
  return state.isTable
    ? `const cellRenderer = ({ cellData }) => { 
        return <${state.cell.name} value={cellData} />;
      };`
    : ''
}
