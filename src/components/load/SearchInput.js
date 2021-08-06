import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Button, FormControl, FormGroup, Glyphicon, InputGroup } from 'react-bootstrap';

const SearchInput = ({ onChange, onClear, onSearch, placeholder, style }) => {
  const [value, setValue] = useState(undefined);

  let input; //store input reference

  const handleChange = (event) => {
    setValue(event.target.value);
    onChange(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.charCode === 13) doSearch();
  };

  const doSearch = () => onSearch.call(value);

  const doClear = () => {
    setValue(undefined);
    input.value = '';
    onClear();
  };

  return (
    <FormGroup style={style}>
      <InputGroup>
        <FormControl
          type="text"
          placeholder={placeholder}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          inputRef={(ref) => (input = ref)}
        />
        <InputGroup.Button style={{ borderRadius: '0' }}>
          <Button onClick={doSearch} title="Search" style={{ borderRadius: '0' }}>
            <Glyphicon glyph="search" />
            &#160;
          </Button>
        </InputGroup.Button>
        <InputGroup.Button>
          <Button onClick={doClear} title="Clear">
            <Glyphicon glyph="remove" />
            &#160;
          </Button>
        </InputGroup.Button>
      </InputGroup>
    </FormGroup>
  );
};

SearchInput.propTypes = {
  onChange: PropTypes.func,
  onClear: PropTypes.func,
  onSearch: PropTypes.func,
  placeholder: PropTypes.string,
  style: PropTypes.object,
};

export default SearchInput;
