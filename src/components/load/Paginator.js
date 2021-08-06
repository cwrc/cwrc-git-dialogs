import PropTypes from 'prop-types';
import React from 'react';
import { Pagination } from 'react-bootstrap';
import ReactDOM from 'react-dom';

const Paginator = ({ pagingCB, currentPage, lastPage }) => {
  const range = (start, end) =>
    Array(end - start + 1)
      .fill()
      .map((_, idx) => start + idx);

  const getPageItem = (page, currentPage, pagingCB) => (
    <Pagination.Item
      key={page}
      onClick={() => page != currentPage && pagingCB(page)}
      data-page={page}
      active={page === currentPage}
    >
      {page}
    </Pagination.Item>
  );

  const addLinks = (currentPage, lastPage, pagingCB) => {
    const delta = 2;
    const spaceOnEnd = lastPage - currentPage;
    const portionofDeltaAvailableOnEnd = spaceOnEnd >= delta ? delta : spaceOnEnd;

    // calculate start delta, adding any extra because current page number is last or second last page
    const deltaToAddToStart = delta - portionofDeltaAvailableOnEnd;
    const totalDeltaForStart = delta + deltaToAddToStart;
    const startPage = Math.max(currentPage - totalDeltaForStart, 1);

    // calculate end delta, adding any extra because current page number is 1 or 2.
    const deltaToAddToEnd = startPage - currentPage + 2;
    const totalDeltaForEnd = delta + deltaToAddToEnd;
    const endPage = Math.min(currentPage + totalDeltaForEnd, lastPage);

    const pagesToShow = range(startPage, endPage);

    return pagesToShow.map((page) => getPageItem(page, currentPage, pagingCB));
  };

  return (
    <Pagination>
      <Pagination.Prev
        onClick={() => currentPage > 1 && pagingCB(currentPage - 1)}
        disabled={currentPage == 1}
      />
      {addLinks(currentPage, lastPage, pagingCB)}
      <Pagination.Next
        onClick={() => currentPage != lastPage && pagingCB(currentPage + 1)}
        disabled={currentPage == lastPage}
      />
    </Pagination>
  );
};

Paginator.propTypes = {
  pagingCB: PropTypes.func,
  currentPage: PropTypes.number,
  lastPage: PropTypes.number,
};

const showPagination = (
  targetElement,
  currentPage,
  lastPage,
  pagingCallback,
  reactResultComponentReference
) => {
  ReactDOM.render(
    <Paginator
      pagingCB={pagingCallback}
      lastPage={lastPage}
      currentPage={currentPage}
      resultComponent={reactResultComponentReference}
    />,
    document.getElementById(targetElement)
  );
};

export default Paginator;
