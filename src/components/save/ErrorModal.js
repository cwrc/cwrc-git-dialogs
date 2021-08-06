import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const ErrorModal = ({ cancel, children }) => {
  const { t } = useTranslation(['common']);
  return (
    <Fragment>
      <Modal.Header>{t('common:anErrorOccurred')}</Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button onClick={cancel} bsStyle="success">
          {t('common:ok')}
        </Button>
      </Modal.Footer>
    </Fragment>
  );
};

ErrorModal.propTypes = {
  cancel: PropTypes.func,
  children: PropTypes.any,
};

export default ErrorModal;
