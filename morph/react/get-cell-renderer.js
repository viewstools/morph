export default state => {
  return state.isTable
    ? `const columnCellRenderer = ({ cellData }) => { 
        return <div>{cellData}</div>;
      };`
    : ''
}
