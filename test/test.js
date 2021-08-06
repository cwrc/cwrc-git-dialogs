/**
 * @jest-environment jsdom
 */

import $ from 'jquery';
import dialogs from '../src/index.js';

const sampleDoc = `
<?xml version="1.0" encoding="UTF-8"?>
<?xml-model href="https://cwrc.ca/schemas/cwrc_tei_lite.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?>
<?xml-stylesheet type="text/css" href="https://cwrc.ca/templates/css/tei.css"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:cw="http://cwrc.ca/ns/cw#" xmlns:w="http://cwrctc.artsrn.ualberta.ca/#">
<teiHeader>
    <fileDesc>
        <titleStmt>
            <title>Sample Document Title</title>
        </titleStmt>
        <publicationStmt>
            <p></p>
        </publicationStmt>
        <sourceDesc sameAs="http://www.cwrc.ca">
            <p>Created from original research by members of CWRC/CSÉC unless otherwise noted.</p>
        </sourceDesc>
    </fileDesc>
</teiHeader>
<text>
    <body>
        <div>
            Replace with your text.
        </div>
    </body>
</text>
</TEI>`;

let idCount = 0;
const writerMock = {
  getUniqueId: (prefix) => {
    let id = prefix + idCount;
    idCount++;
    return id;
  },
  dialogManager: {
    getDialogWrapper: () => $(document.body),
  },
  isDocLoaded: () => false,
  getDocument: () => sampleDoc,
  setDocument: () => {},
  event: () => ({
    publish: () => {},
  }),
};

test('show splash', () => {
  expect.assertions(1);
  dialogs.load(writerMock);
  expect($('#git-dialogs-0 h1').text().indexOf('Welcome to CWRC-Writer')).toBeGreaterThan(-1);
});
