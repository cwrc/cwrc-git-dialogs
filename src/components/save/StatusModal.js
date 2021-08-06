import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const StatusModal = ({ status }) => {
  const { t } = useTranslation(['save']);

  return (
    <Fragment>
      <Modal.Header>{t('save:header')}</Modal.Header>
      <Modal.Body>
        <p>{status}</p>
      </Modal.Body>
    </Fragment>
  );
};

StatusModal.propTypes = {
  status: PropTypes.string,
};

export default StatusModal;
