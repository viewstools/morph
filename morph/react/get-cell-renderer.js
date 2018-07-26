export default state => {
  return state.isTable
    ? `const columnCellRenderer = ({ cellData }) => { 
        return <${state.cell.name} cellData={cellData} />;
      };`
    : ''
}
