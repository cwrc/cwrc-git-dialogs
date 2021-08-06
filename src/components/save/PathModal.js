import PropTypes from 'prop-types';
import React, { Fragment, useState } from 'react';
import {
  Button,
  Col,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  Grid,
  Label,
  Modal,
  Row,
} from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';

const PathModal = ({
  handleClose,
  handleChange,
  handleSaveFile,
  handleSaveFileAsPR,
  repo,
  path,
  owner,
}) => {
  const { t } = useTranslation(['common, save']);

  const [formMessage, setFormMessage] = useState(undefined);

  let ownerInput = null;
  let repoInput = null;
  let pathInput = null;

  const validateControl = (value) => {
    if (value === undefined || value.length === 0) return 'error';
    return null;
  };

  const isFormValid = () => {
    if (
      ownerInput.value !== undefined &&
      ownerInput.value !== '' &&
      repoInput.value !== undefined &&
      repoInput.value !== '' &&
      pathInput.value !== undefined &&
      pathInput.value !== ''
    ) {
      return true;
    }
    return false;
  };

  // action on button click in form
  const saveFile = () => {
    if (!isFormValid()) return setFormMessage(t('save:error.noBlankFields'));
    handleSaveFile();
  };

  // action on button click in form
  const saveFileAsPR = () => {
    handleSaveFileAsPR(isFormValid);
  };

  return (
    <Fragment>
      <Modal.Header>{t('save:header')}</Modal.Header>
      <Modal.Body>
        <Form>
          <Grid fluid>
            <Row>
              <h4>{t('save:saveForm.heading')}</h4>
              <Col sm={6}>
                <FormGroup controlId="owner" validationState={validateControl(owner)}>
                  <ControlLabel>{t('save:saveForm.owner.label')}</ControlLabel>
                  <FormControl
                    type="text"
                    value={owner}
                    onChange={(e) => {
                      setFormMessage(undefined);
                      handleChange('owner', e.target.value);
                    }}
                    inputRef={(ref) => (ownerInput = ref)}
                  />
                </FormGroup>
              </Col>
              <Col sm={6}>
                <FormGroup controlId="repo" validationState={validateControl(repo)}>
                  <ControlLabel>{t('save:saveForm.repo.label')}</ControlLabel>
                  <FormControl
                    type="text"
                    value={repo}
                    onChange={(e) => {
                      setFormMessage(undefined);
                      handleChange('repo', e.target.value);
                    }}
                    inputRef={(ref) => (repoInput = ref)}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <h4>{t('save:saveForm.path.label')}</h4>
              <Col sm={12}>
                <FormGroup controlId="path" validationState={validateControl(path)}>
                  <FormControl
                    type="text"
                    value={path}
                    onChange={(e) => {
                      setFormMessage(undefined);
                      handleChange('path', e.target.value);
                    }}
                    inputRef={(ref) => (pathInput = ref)}
                  />
                  <div style={{ marginTop: '5px', color: '#737373' }}>
                    <Trans
                      i18nKey="save:saveForm.path.helpText" // optional -> fallbacks to defaults if not provided
                      defaults="The file (and folder) path to which to save (<italic>e.g.</italic>, french/basque/SaintSauveur.xml)." // optional defaultValue
                      components={{ italic: <i /> }}
                    />
                  </div>
                </FormGroup>
              </Col>
            </Row>
            {formMessage !== undefined && (
              <Row>
                <Col sm={12}>
                  <h4>
                    <Label bsStyle="danger">{formMessage}</Label>
                  </h4>
                </Col>
              </Row>
            )}
          </Grid>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleClose}>{t('common:cancel')}</Button>
        <Button onClick={saveFile} bsStyle="success">
          {t('common:save')}
        </Button>
        <Button onClick={saveFileAsPR} bsStyle="success">
          {t('common:saveAsPullRequest')}
        </Button>
      </Modal.Footer>
    </Fragment>
  );
};

PathModal.propTypes = {
  handleClose: PropTypes.func,
  handleChange: PropTypes.func,
  handleSaveFile: PropTypes.func,
  handleSaveFileAsPR: PropTypes.func,
  path: PropTypes.string,
  repo: PropTypes.string,
  owner: PropTypes.string,
};

export default PathModal;
