// components/Pagination.js
const Pagination = ({ currentPage, totalPages, onPrevPage, onNextPage }) => (
    <div className="pagination">
      <button onClick={onPrevPage} disabled={currentPage === 1}>
        이전
      </button>
      <span>{currentPage} / {totalPages}</span>
      <button onClick={onNextPage} disabled={currentPage === totalPages}>
        다음
      </button>
    </div>
  );
  
  export default Pagination;