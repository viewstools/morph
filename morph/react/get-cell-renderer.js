export default state => {
  return state.isTable
    ? `const columnCellRenderer = ({ cellData }) => { 
        return <${state.cell.name} value={cellData} />;
      };`
    : ''
}
