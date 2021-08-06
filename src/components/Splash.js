/* eslint-disable react/no-unescaped-entities */
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Modal, Button, PageHeader } from 'react-bootstrap';

const Splash = ({ onContinue }) => {
  return (
    <Fragment>
      <Modal.Body style={{ lineHeight: '1.35em', margin: '0px 15px' }}>
        <PageHeader>
          Welcome to CWRC-Writer
          <br />
          <small>
            The XML & RDF online editor developed by the{' '}
            <a href="https://cwrc.ca" rel="noopener noreferrer">
              Canadian Writing Research Collaboratory
            </a>
          </small>
        </PageHeader>
        <p>CWRC-Writer provides:</p>
        <ul>
          <li>
            schema-aware document editing, including validation, against web-accessible schemas
          </li>
          <li>
            support for cascading stylesheets (CSS) to provide a WYSIWYG view of documents, as well
            as a view showing tags
          </li>
          <li>
            ability to look up and select identifiers for named entity tags (persons, organization,
            places, or titles) from a range of Linked Open Data authorities
          </li>
          <li>
            generation (if desired) of Linked Data annotations corresponding to tags for named
            entities and document annotations (notes, citations, corrections, links) in XML-RDF or
            JSON-LD conforming to the Web Annotation Data Model, for both pre-existing and newly
            added tags
          </li>
          <li>
            ability to detect candidate named entities (persons, places, or organizations) within a
            document for tagging and/or Web Annotation, to evaluate and refine those suggestions,
            and to associate the entities with LOD identifiers
          </li>
        </ul>
        <p>
          This version of CWRC-Writer, <em>Git-Writer</em>, uses the GitHub repository for document
          storage, versioning, and sharing. You need to be logged into a GitHub account to use it.
        </p>
        <p>
          Git-Writer is designed to work with customizations of the Text Encoding Initiative (TEI)
          schema provided by the TEI Consortium. (Schemas/CSS must be available at an https://
          location and have CORS enabled.)
        </p>
        <p>
          You can use CWRC-Writer to edit XML documents or produce new documents from templates.
          There are templates and sample documents here for getting started. Producing Linked Open
          Data annotations is optional.
        </p>
        <p>
          To learn more about how to use CWRC-Writer, see{' '}
          <a
            href="https://cwrc.ca/Documentation/CWRC-Writer"
            target="_blank"
            rel="noopener noreferrer"
          >
            cwrc.ca/Documentation/CWRC-Writer
          </a>
          . We recommend starting with the <em>video tutorial</em> and the{' '}
          <em>quick start guide</em>.
        </p>
        <p>
          If you run into a bug or there is a feature you would like to see added, please submit a
          ticket to{' '}
          <a
            href="https://github.com/cwrc/CWRC-WriterBase/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/cwrc/CWRC-WriterBase/issues
          </a>
          .
        </p>
        <p>
          If you are interested in adopting/adapting the Writer to a different environment, please
          consult{' '}
          <a
            href="https://github.com/cwrc/tech_documentation/blob/master/Tools-reference.md#cwrc-writer"
            target="_blank"
            rel="noopener noreferrer"
          >
            this reference
          </a>
          . You can contact us through a GitHub ticket on any of the CWRC-Writer code repositories.
        </p>
        <p>
          Finally, if you have found CWRC-Writer useful for your research or teaching, please let us
          know! We'd love to hear it.
        </p>
        <hr />
        <h4>Core Team</h4>
        <p>
          Susan Brown, <small>2011 - present (project director)</small>
        </p>
        <p>
          James Chartrand, <small>2011 - 2018 (lead developer)</small>
        </p>
        <p>
          Mihaela Ilovan, <small>2014 - present (project manager)</small>
        </p>
        <p>
          Andrew MacDonald, <small>2013 - 2020 (lead developer)</small>
        </p>
        <p>
          Luciano Frizzera, <small>2019 - present (2020 - lead developer)</small>
        </p>
        <p>
          Geoffrey Rockwell, <small>2011 - 2014 (scoping and direction)</small>
        </p>
        <p>
          Megan Sellmer, <small>2011 - 2016 (testing and documentation)</small>
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onContinue} bsStyle="success">
          Continue
        </Button>
      </Modal.Footer>
    </Fragment>
  );
};

Splash.propTypes = {
  onContinue: PropTypes.func,
};

export default Splash;
