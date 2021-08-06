import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';

const HighlightedMatch = ({ text_match }) => {
  return (
    <Fragment>
      <span>{text_match.fragment.slice(0, text_match.matches[0].indices[0])}</span>
      {text_match.matches.map((currentMatch, currentIndex, allMatches) => {
        const startOfNextMatch =
          currentIndex + 1 == allMatches.length
            ? text_match.fragment.length
            : allMatches[currentIndex + 1].indices[0];
        const endOfThisMatch = currentMatch.indices[1];
        return (
          <span key={currentIndex.toString()}>
            <span style={{ fontWeight: '900', fontSize: '16px' }}>{currentMatch.text}</span>
            {`${text_match.fragment.slice(endOfThisMatch, startOfNextMatch)}`}
          </span>
        );
      })}
    </Fragment>
  );
};

HighlightedMatch.propTypes = {
  text_match: PropTypes.object,
};

const Item = ({ selectCB, result }) => {
  const repoDetails = result.repository ? result.repository : result;
  const header = `${repoDetails.full_name}/${result.path}`;

  return (
    <ListGroupItem
      onClick={() => selectCB(repoDetails.full_name, result.path)}
      style={{ cursor: 'pointer' }}
    >
      <div
        style={{
          fontSize: '16px',
          fontWeight: '900',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
        className="list-group-item-heading"
        title={header}
      >
        {header}
      </div>
      {/* {highlightedMatches(result)} */}
      {result.text_matches.map((text_match, i) => (
        <HighlightedMatch key={i.toString()} text_match={text_match} />
      ))}
    </ListGroupItem>
  );
};

Item.propTypes = {
  result: PropTypes.object,
  selectCB: PropTypes.func,
};

const SearchResultList = ({ selectCB, results }) => {
  return (
    <ListGroup>
      {results.map((result, i) => (
        <Item key={i.toString()} result={result} selectCB={selectCB} />
      ))}
    </ListGroup>
  );
};

SearchResultList.propTypes = {
  results: PropTypes.array,
  selectCB: PropTypes.func,
};

export default SearchResultList;
