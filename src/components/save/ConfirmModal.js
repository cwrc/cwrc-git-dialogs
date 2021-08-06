import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const ConfirmModal = ({ cancel, title, body, ok }) => {
  const { t } = useTranslation(['common, save']);
  return (
    <Fragment>
      <Modal.Header>{t('save:header')}</Modal.Header>
      <Modal.Body>
        <h4>{title}</h4>
        <p>{body}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={cancel}>{t('common:cancel')}</Button>
        <Button onClick={ok} bsStyle="success">
          {t('common:ok')}
        </Button>
      </Modal.Footer>
    </Fragment>
  );
};

ConfirmModal.propTypes = {
  cancel: PropTypes.func,
  body: PropTypes.string,
  ok: PropTypes.func,
  title: PropTypes.string,
};

export default ConfirmModal;
