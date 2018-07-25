export default state => {
  debugger
  return state.isTable
    ? `const columnCellRenderer = ({ cellData }) => { 
        return <div>{cellData}</div>;
      };`
    : ''
}
