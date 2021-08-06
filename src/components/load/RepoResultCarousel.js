import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Breadcrumb, Carousel, Glyphicon, ListGroup, ListGroupItem } from 'react-bootstrap';

import cwrcGit from '../../GitServerClient.js';
import SearchInput from './SearchInput.js';

const RepoResultCarousel = ({ isGitLab, repos, selectCB, serverURL }) => {
  const [direction, setDirection] = useState(null);
  const [index, setIndex] = useState(0);
  const [isSearch, setIsSearch] = useState(false);
  const [openFolders, setOpenFolders] = useState([]);
  const [query, setQuery] = useState('');
  const [repoStructures, setRepoStructures] = useState({});
  const [selectedRepo, setSelectedRepo] = useState(null);

  useEffect(() => {
    cwrcGit.setServerURL(serverURL);
    cwrcGit.useGitLab(isGitLab);
  }, []);

  const toggleFolder = (path) => {
    setOpenFolders((prevState) => {
      return openFolders.includes(path)
        ? prevState.filter((item) => item !== path)
        : [...prevState, path];
    });
  };

  const showTree = (structure, repo, indent = 0) => {
    let _isSearch = isSearch;
    const searchQuery = query.toLowerCase();
    if (searchQuery.length === 0) _isSearch = false;

    if (structure.length === 0) {
      return (
        <div>
          <Glyphicon glyph="info-sign" style={{ padding: '10px' }} />
          Empty Repository
        </div>
      );
    }

    return (
      <ListGroup style={{ maxHeight: '500px', overflowY: 'scroll' }}>
        {structure.map((item, i) => {
          if (item.type === 'folder') {
            let isFolderOpen = openFolders.includes(item.path);
            return (
              <div key={i}>
                <ListGroupItem
                  bsStyle="info"
                  onClick={() => toggleFolder(item.path)}
                  style={{ padding: '10px' }}
                >
                  <div style={{ paddingLeft: `${indent * 10}px` }}>
                    <Glyphicon
                      glyph={isFolderOpen ? 'chevron-down' : 'chevron-right'}
                      style={{ paddingRight: '10px' }}
                    />
                    {item.name}
                  </div>
                </ListGroupItem>
                {isFolderOpen && showTree(item.contents, repo, indent + 2)}
              </div>
            );
          } else {
            if (_isSearch === false) {
              return (
                <ListGroupItem
                  key={i}
                  onClick={() => selectCB(repo, item.path)}
                  style={{ padding: '10px' }}
                >
                  <div style={{ paddingLeft: `${indent * 10}px` }}>{item.name}</div>
                </ListGroupItem>
              );
            } else {
              const queryIndex = item.name.toLowerCase().indexOf(searchQuery);
              if (queryIndex !== -1) {
                return (
                  <ListGroupItem
                    key={i}
                    onClick={() => selectCB(repo, item.path)}
                    style={{ padding: '10px' }}
                  >
                    <div style={{ paddingLeft: `${indent * 10}px` }}>
                      {item.name.substring(0, queryIndex)}
                      <span style={{ fontWeight: 'bold' }}>
                        {item.name.substring(queryIndex, queryIndex + searchQuery.length)}
                      </span>
                      {item.name.substring(queryIndex + searchQuery.length)}
                    </div>
                  </ListGroupItem>
                );
              }
            }
          }
        })}
      </ListGroup>
    );
  };

  const showRepoStructure = (repoFullName) => {
    if (!repoStructures[repoFullName]) {
      cwrcGit.getRepoContentsByDrillDown(repoFullName).then(
        ({ contents: { contents: structure } }) => {
          // console.log(structure)
          setRepoStructures((prevState) => ({
            ...prevState.repoStructures,
            [repoFullName]: structure,
          }));
        },
        // eslint-disable-next-line no-unused-vars
        (fail) => {
          // it's an empty repo
          setRepoStructures((prevState) => ({
            ...prevState.repoStructures,
            [repoFullName]: [],
          }));
        }
      );
      return (
        <div>
          <Glyphicon glyph="cloud-download" style={{ padding: '10px' }} />
          Loading Repository Structure...
        </div>
      );
    } else {
      return showTree(repoStructures[repoFullName], repoFullName);
    }
  };

  const showRepoList = (results) => {
    return results.map((result, i) => {
      const repoDetails = result.repository ? result.repository : result;
      return (
        <ListGroupItem key={i} eventkey={repoDetails.full_name} onClick={handleRepoSelect}>
          <span style={{ fontWeight: '900' }}>{repoDetails.full_name}</span>
          <span style={{ fontSize: '0.8em' }}>
            {repoDetails.description && ` ︱ ${repoDetails.description}`}
          </span>
        </ListGroupItem>
      );
    });
  };

  const handleRepoSelect = (event) => {
    const repo = event.currentTarget.getAttribute('eventkey');
    setDirection('next');
    setIndex(1);
    setSelectedRepo(repo);
  };

  const handleCarouselSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
    setDirection(e.direction);
  };

  const handleSearchClear = () => {
    setIsSearch(false);
    setQuery('');
  };

  const doSearch = (value = query) => {
    const openFolders = [];
    const repoStructure = repoStructures[selectedRepo];
    if (repoStructure !== undefined) {
      repoStructure.forEach((item) => {
        if (item.type === 'folder' && doesItemMatchSearch(item, value)) {
          openFolders.push(item.path);
        }
      });
    }

    setIsSearch(true);
    setQuery(value);
    setOpenFolders(openFolders);
  };

  const doesItemMatchSearch = (item, query) => {
    if (item.type === 'folder' && item.contents !== undefined) {
      for (let i = 0; i < item.contents.length; i++) {
        const subItem = item.contents[i];
        if (doesItemMatchSearch(subItem, query)) return true;
      }
    } else if (item.type === 'file') {
      return item.name.toLowerCase().indexOf(query) !== -1;
    }
    return false;
  };

  return (
    <Carousel
      id="git-dialogs-repoResultCarousel"
      activeIndex={index}
      direction={direction}
      onSelect={handleCarouselSelect}
      interval={null}
      indicators={false}
      controls={false}
      wrap={false}
      slide={false}
    >
      <Carousel.Item>
        <Breadcrumb style={{ marginBottom: '10px' }}>
          <Breadcrumb.Item active={true}>Repos</Breadcrumb.Item>
        </Breadcrumb>
        <ListGroup style={{ maxHeight: '500px', overflowY: 'scroll' }}>
          {showRepoList(repos)}
        </ListGroup>
      </Carousel.Item>
      <Carousel.Item>
        <Breadcrumb style={{ marginBottom: '10px' }}>
          <Breadcrumb.Item onClick={() => handleCarouselSelect(0, { direction: 'prev' })}>
            Repos
          </Breadcrumb.Item>
          <Breadcrumb.Item active={true}>{selectedRepo}</Breadcrumb.Item>
        </Breadcrumb>
        <SearchInput
          placeholder="Filename filter"
          onChange={doSearch}
          onClear={handleSearchClear}
          onSearch={doSearch}
          style={{ marginTop: '10px' }}
        />
        {index === 1 && selectedRepo !== null ? showRepoStructure(selectedRepo) : ''}
      </Carousel.Item>
    </Carousel>
  );
};

RepoResultCarousel.propTypes = {
  isGitLab: PropTypes.bool,
  repos: PropTypes.array,
  selectCB: PropTypes.func,
  serverURL: PropTypes.string,
};

export default RepoResultCarousel;
