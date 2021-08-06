import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Glyphicon, ListGroup, ListGroupItem, Panel, PanelGroup } from 'react-bootstrap';

import cwrcGit from './GitServerClient';

const RepoResultList = ({ isGitLab, selectCB, serverURL, repos }) => {
  const [repoStructures, setRepoStructures] = useState({});
  const [openFolders, setOpenFolders] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);

  useEffect(() => {
    cwrcGit.setServerURL(serverURL);
    cwrcGit.useGitLab(isGitLab);
  }, []);

  const toggleFolder = (path) => {
    setOpenFolders((prevState) => {
      return openFolders.includes(path)
        ? prevState.openFolders.filter((item) => item.path !== path)
        : prevState.openFolders.concat(path);
    });
  };

  const showTree = (structure, repo, indent = 0) => {
    return structure.map((item, i) => {
      return item.type === 'folder' ? (
        <div key={i}>
          <ListGroupItem
            bsStyle="info"
            onClick={() => toggleFolder(item.path)}
            style={{ padding: '10px' }}
          >
            <div style={{ paddingLeft: `${indent * 10}px` }}>
              <Glyphicon
                glyph={openFolders.includes(item.path) ? 'chevron-down' : 'chevron-right'}
                style={{ paddingRight: '10px' }}
              />
              {item.name}
            </div>
          </ListGroupItem>
          {openFolders.includes(item.path) && showTree(item.contents, repo, indent + 2)}
        </div>
      ) : (
        <ListGroupItem
          key={i}
          onClick={() => selectCB(repo, item.path)}
          style={{ padding: '10px' }}
        >
          <div style={{ paddingLeft: `${indent * 10}px` }}>{item.name}</div>
        </ListGroupItem>
      );
    });
  };

  const showRepoStructure = (repoFullName) => {
    if (!repoStructures[repoFullName]) {
      cwrcGit.getRepoContents(repoFullName).then(({ contents: { contents: structure } }) => {
        //console.log(structure)
        setRepoStructures((prevState) => {
          return { ...prevState.repoStructures, [repoFullName]: structure };
        });
      });
      return (
        <div>
          <Glyphicon glyph="cloud-download" style={{ padding: '10px' }} />
          Loading Repository Structure...
        </div>
      );
    } else {
      return <ListGroup>{showTree(repoStructures[repoFullName], repoFullName)}</ListGroup>;
    }
  };

  const showRepoList = (results) => {
    return results.map((result, i) => {
      const repoDetails = result.repository ? result.repository : result;
      return (
        <Panel key={i} eventKey={repoDetails.full_name}>
          <Panel.Heading>
            <Panel.Title toggle>
              <span style={{ fontWeight: '900' }}>{repoDetails.full_name}</span>
              <span style={{ fontSize: '0.8em' }}>
                {repoDetails.description && ` ︱ ${repoDetails.description}`}
              </span>
            </Panel.Title>
          </Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>
              {repoDetails.full_name === selectedRepo && showRepoStructure(repoDetails.full_name)}
            </Panel.Body>
          </Panel.Collapse>
        </Panel>
      );
    });
  };

  // eventKey is the value of the eventKey attribute of the Panel that was clicked (expanded)
  // The value of eventKey=repoId
  // eventKey will be null if the open panel was clicked.
  // But, that's fine, because that then closes all panels.
  const handlePanelSelect = (eventKey) => setSelectedRepo(eventKey);

  return (
    <PanelGroup accordion id="git-dialogs-repoResultList" onSelect={handlePanelSelect}>
      {showRepoList(repos)}
    </PanelGroup>
  );
};

RepoResultList.propTypes = {
  isGitLab: PropTypes.bool,
  selectCB: PropTypes.func,
  serverURL: PropTypes.string,
  repos: PropTypes.array,
};

export default RepoResultList;
