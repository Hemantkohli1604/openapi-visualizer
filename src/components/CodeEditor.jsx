import React, { useState } from 'react';
import yaml from 'yaml';
import CodeMirror from '@uiw/react-codemirror';
import { langs } from '@uiw/codemirror-extensions-langs';

const CodeEditor = ({ spec, setSpec }) => {
  const [error, setError] = useState(null);

  const handleChange = (value) => {
    try {
      if (value.trim().startsWith('{')) {
        JSON.parse(value); // Validate JSON syntax
      } else {
        yaml.parse(value); // Validate YAML syntax
      }
      setSpec(value);
      setError(null);
    } catch (e) {
      setError('Invalid YAML or JSON syntax');
    }
  };

  return (
    <div className='p-4'>
      <h2 className='text-xl font-bold mb-4'>Edit OPENAPI SPEC</h2>
      <CodeMirror
        value={spec}
        extensions={[langs.yaml(), langs.json()]}
        theme='dark'
        onChange={(value) => handleChange(value)}
      />
      {error && <div className='text-red-600 mt-2'>{error}</div>}
    </div>
  );
};

export default CodeEditor;
