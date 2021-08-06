import PropTypes from 'prop-types';
import React, { useState } from 'react';
import {
  Button,
  Col,
  ControlLabel,
  FormControl,
  FormGroup,
  Grid,
  HelpBlock,
  Label,
  Row,
} from 'react-bootstrap';

const FileUpload = ({ fileCB }) => {
  const [xmlText, setXmlText] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  // const getValidationState = () => {
  // 	if (showWarning) return 'error';
  // 	return null;
  // };

  const handleTextChange = (e) => {
    if (xmlText.length > 0) setShowWarning(false);
    setXmlText(e.target.value);
  };

  const readFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => fileCB(event.target.result);
    reader.onerror = (error) => console.log(error);
    reader.readAsText(file);
  };

  const handleUpload = (event) => {
    const input = event.target;
    if ('files' in input && input.files.length > 0) {
      readFile(input.files[0]);
    }
  };

  const loadText = () => {
    if (xmlText.length < 1) return setShowWarning(true);

    setShowWarning(false);
    fileCB(xmlText);
  };

  return (
    <form>
      <Grid style={{ marginTop: '15px' }} fluid={true}>
        <Row>
          <Col sm={3}>
            <FormGroup>
              <ControlLabel
                htmlFor="fileUpload"
                style={{ cursor: 'pointer', paddingRight: '40px' }}
              >
                <h4>
                  <Label bsStyle="success" style={{ padding: '15px' }}>
                    Choose File
                  </Label>
                </h4>
                <FormControl
                  id="fileUpload"
                  type="file"
                  onChange={handleUpload}
                  style={{ display: 'none' }}
                />
              </ControlLabel>
              or
            </FormGroup>
          </Col>
          <Col sm={9} style={{ marginTop: '-20px' }}>
            <FormGroup controlId="formBasicText">
              <ControlLabel></ControlLabel>
              <FormControl
                componentClass="textarea"
                style={{ height: '100px' }}
                value={xmlText}
                placeholder="Paste your XML here"
                onChange={handleTextChange}
              />
              <FormControl.Feedback />
              {showWarning && <HelpBlock>Please enter some text in the box above.</HelpBlock>}
            </FormGroup>
            <Button onClick={loadText}>Open Text in Editor</Button>
          </Col>
        </Row>
      </Grid>
    </form>
  );
};

FileUpload.propTypes = {
  fileCB: PropTypes.func,
};

export default FileUpload;
