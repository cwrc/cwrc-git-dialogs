import parseLinks from 'parse-link-header';
import PropTypes from 'prop-types';
import React, { Fragment, useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Col,
  ControlLabel,
  FormControl,
  FormGroup,
  Glyphicon,
  Grid,
  ListGroup,
  ListGroupItem,
  Modal,
  Panel,
  PanelGroup,
  Row,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';

import cwrcGit from '../../GitServerClient';
import FileUpload from './FileUpload';
import Paginator from './Paginator';
import RepoResultCarousel from './RepoResultCarousel';
import SearchInput from './SearchInput';
import SearchResultList from './SearchResultList';

const RESULTS_PER_PAGE = 100;

const LoadDialog = ({
  handleClose,
  isDocLoaded,
  isGitLab,
  onFileSelect,
  onFileUpload,
  serverURL,
  user,
}) => {
  const [activeTab, setActiveTab] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [isSearch, setIsSearch] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [query, setQuery] = useState(undefined);
  const [xmlOnly, setXmlOnly] = useState(false);

  const [repoType, setRepoType] = useState('private');
  const [privateReposAffiliation, setPrivateReposAffiliation] = useState('owner');

  const [results, setResults] = useState([]); //
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [templates, setTemplates] = useState([]);

  let filterInput;

  useEffect(() => {
    cwrcGit.setServerURL(serverURL);
    cwrcGit.useGitLab(isGitLab);
    handleTabSelect('templates');
  }, []);

  // update repo list when toggle affiliation changes
  useEffect(() => {
    getRepos();
  }, [privateReposAffiliation, searchFilter]);

  const getReposForGithubUser = async (user, requestedPage, resultsPerPage = RESULTS_PER_PAGE) => {
    const response = await cwrcGit
      .getReposForGithubUser(user, requestedPage, resultsPerPage)
      .catch((fail) => fail);

    return {
      items: response.data,
      lastPage: getLastPage(response, requestedPage),
    };
  };

  const getReposForAuthenticatedGithubUser = async (
    requestedPage,
    affiliation = 'owner',
    resultsPerPage = RESULTS_PER_PAGE
  ) => {
    const response = await cwrcGit
      .getReposForAuthenticatedGithubUser(requestedPage, resultsPerPage, affiliation)
      .catch((fail) => fail);

    return {
      items: response.data,
      lastPage: getLastPage(response, requestedPage),
    };
  };

  const searchFileContentsForUser = async (
    gitName,
    searchTerms,
    requestedPage,
    resultsPerPage = RESULTS_PER_PAGE
  ) => {
    let queryString = 'language:xml';
    if (searchTerms) queryString += ` "${searchTerms}"`;
    if (gitName) queryString += ` user:${gitName}`;

    const response = await cwrcGit
      .searchCode(queryString, resultsPerPage, requestedPage)
      .catch((fail) => fail);

    return {
      items: response.data.items,
      lastPage: getLastPage(response, requestedPage),
    };
  };

  const getLastPage = (results, requestedPage) => {
    let lastPage = requestedPage;
    if (results.meta && results.meta.link) {
      const relLinks = parseLinks(results.meta.link);
      lastPage = relLinks.last ? parseInt(relLinks.last.page, 10) : requestedPage;
    }
    return lastPage;
  };

  const handleTabSelect = async (key) => {
    setActiveTab(key);
    setLoading(false);

    switch (key) {
      case 'repos':
        if (results.length === 0) getRepos();
        break;
      case 'templates':
        if (templates.length === 0) {
          setLoading(true);
          const templateList = await cwrcGit.getTemplates().catch((error) => {
            setError(error);
          });
          setLoading(false);

          if (templateList) setTemplates(templateList);
        }
        break;
    }
  };

  const handleRepoTypeSelect = (key) => {
    if (key === null) return;

    setRepoType(key);
    setIsSearch(false);

    if (key === 'private') getRepos();
  };

  const handleAffiliationSelect = (value) => {
    setIsSearch(false);
    setPrivateReposAffiliation(value);
  };

  const handleXMLOnlyChange = (event) => {
    const value = event.target.checked;
    setXmlOnly(value);
    // getRepos();
  };

  const doSearch = (pageNum, value = query) => {
    setLoading(true);
    setError('');
    setIsSearch(true);
    setQuery(value);

    let promise;
    if (repoType === 'private') {
      promise = searchFileContentsForUser(user.userId, value, pageNum);
    } else {
      let filter = filterInput.value;
      if (filter && !value) {
        setIsSearch(false);
        promise = getReposForGithubUser(filter, pageNum);
      } else {
        promise = searchFileContentsForUser(filter, value, pageNum);
      }
    }

    promise.then(
      (result) => {
        setResults(result.items);
        setCurrentPage(pageNum);
        setLastPage(result.lastPage);
        setLoading(false);
      },
      (fail) => {
        setError(fail.responseText);
        setLoading(false);
      }
    );
  };

  const handleSearchChange = (value) => setQuery(value);

  const handleSearchClear = () => {
    setIsSearch(false);
    setTimeout(() => getRepos());
  };

  const getRepos = (pageNum = 1) => {
    setLoading(true);
    setError('');

    let promise;
    if (repoType === 'public') {
      if (searchFilter !== '') {
        promise = getReposForGithubUser(searchFilter, pageNum);
      } else {
        setLoading(false);
        return false;
      }
    } else {
      promise = getReposForAuthenticatedGithubUser(pageNum, privateReposAffiliation);
    }

    promise
      .then((result) => {
        setResults(result.items);
        setCurrentPage(pageNum);
        setLastPage(result.lastPage);
        setLoading(false);
      })
      .catch((fail) => {
        setError(fail.responseText);
        setLoading(false);
      });
  };

  return (
    <Fragment>
      <Modal.Header closeButton={isDocLoaded} onHide={handleClose}>
        Load a Document
      </Modal.Header>
      <Modal.Body>
        <Tabs
          id="git-dialogs-tabs"
          animation={false}
          activeKey={activeTab}
          onSelect={handleTabSelect}
          // bsStyle='pills'
        >
          <Tab eventKey="templates" title="CWRC Templates" style={{ marginTop: '10px' }}>
            {loading ? (
              <h5>
                <Glyphicon glyph="cloud-download" style={{ padding: '10px' }} /> Loading...
              </h5>
            ) : error !== '' ? (
              <div>
                <h5>Error!</h5>
                <p>{error}</p>
              </div>
            ) : (
              <ListGroup>
                {templates.map((item, key) => (
                  <ListGroupItem key={key} onClick={() => onFileUpload(item.download_url)}>
                    {item.name.replace(/.xml$/, '')}
                  </ListGroupItem>
                ))}
              </ListGroup>
            )}
          </Tab>
          <Tab eventKey="repos" title={'GitHub Repositories'} style={{ marginTop: '10px' }}>
            <Grid fluid={true} style={{ marginBottom: '10px' }}>
              <Row>
                <Col sm={5}>
                  <h4>Search</h4>
                  <PanelGroup
                    accordion
                    id="git-dialogs-repoPanelGroup"
                    activeKey={repoType}
                    onSelect={handleRepoTypeSelect}
                  >
                    <Panel eventKey="private">
                      <Panel.Heading>
                        <Panel.Title toggle>My Repositories</Panel.Title>
                      </Panel.Heading>
                      <Panel.Collapse>
                        <Panel.Body>
                          <ControlLabel>Show repositories for which I am:</ControlLabel>
                          <ToggleButtonGroup type="radio" name="affiliation" defaultValue="owner">
                            <ToggleButton
                              bsSize="small"
                              value="owner"
                              onClick={() => handleAffiliationSelect('owner')}
                            >
                              Owner
                            </ToggleButton>
                            <ToggleButton
                              bsSize="small"
                              value="collaborator"
                              onClick={() => handleAffiliationSelect('collaborator')}
                            >
                              Collaborator
                            </ToggleButton>
                            <ToggleButton
                              bsSize="small"
                              value="organization_member"
                              onClick={() => handleAffiliationSelect('organization_member')}
                            >
                              Organization Member
                            </ToggleButton>
                          </ToggleButtonGroup>
                        </Panel.Body>
                      </Panel.Collapse>
                    </Panel>
                    <Panel eventKey="public">
                      <Panel.Heading>
                        <Panel.Title toggle>Public Repositories</Panel.Title>
                      </Panel.Heading>
                      <Panel.Collapse>
                        <Panel.Body>
                          <ControlLabel>Limit to user or organization:</ControlLabel>
                          <FormControl
                            type="text"
                            inputRef={(ref) => (filterInput = ref)}
                            onKeyPress={(event) => {
                              if (event.charCode === 13) setSearchFilter(filterInput.value);
                            }}
                          />
                          <Button
                            onClick={() => setSearchFilter(filterInput.value)}
                            style={{ marginTop: '10px' }}
                          >
                            Search
                          </Button>
                        </Panel.Body>
                      </Panel.Collapse>
                    </Panel>
                  </PanelGroup>
                  <SearchInput
                    onChange={handleSearchChange}
                    onClear={handleSearchClear}
                    onSearch={(value) => doSearch(1, value)}
                    placeholder="Search XML files within repos"
                    style={{ marginTop: '10px' }}
                  />
                  {false && (
                    <FormGroup style={{ marginTop: '10px' }}>
                      <Checkbox checked={xmlOnly} onChange={handleXMLOnlyChange}>
                        Only show XML repositories
                      </Checkbox>
                    </FormGroup>
                  )}
                </Col>
                <Col sm={7}>
                  <h4>Results</h4>
                  {loading ? (
                    <div>
                      <h5>
                        <Glyphicon glyph="cloud-download" style={{ padding: '10px' }} />
                        Loading...
                      </h5>
                    </div>
                  ) : error !== '' ? (
                    <div>
                      <h5>Error!</h5>
                      <p>{error}</p>
                    </div>
                  ) : results.length === 0 ? (
                    <div>
                      <h5>No results</h5>
                    </div>
                  ) : isSearch ? (
                    <div>
                      <SearchResultList results={results} selectCB={onFileSelect} />
                      <Paginator
                        currentPage={currentPage}
                        lastPage={lastPage}
                        pagingCB={doSearch}
                      />
                    </div>
                  ) : (
                    <div>
                      <RepoResultCarousel
                        isGitLab={isGitLab}
                        repos={results}
                        selectCB={onFileSelect}
                        serverURL={serverURL}
                      />
                    </div>
                  )}
                </Col>
              </Row>
            </Grid>
          </Tab>
          <Tab eventKey="upload" title="Upload File or Text" style={{ marginTop: '10px' }}>
            <FileUpload fileCB={onFileUpload} />
          </Tab>
        </Tabs>
      </Modal.Body>
      {isDocLoaded && (
        <Modal.Footer>
          <Button onClick={handleClose}>Cancel</Button>
        </Modal.Footer>
      )}
    </Fragment>
  );
};

LoadDialog.propTypes = {
  handleClose: PropTypes.func,
  isDocLoaded: PropTypes.bool,
  isGitLab: PropTypes.bool,
  onFileSelect: PropTypes.func,
  onFileUpload: PropTypes.func,
  serverURL: PropTypes.string,
  user: PropTypes.object,
};

export default LoadDialog;
