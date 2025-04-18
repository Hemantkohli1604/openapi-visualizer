import React from 'react';
import yaml from 'yaml';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerPreview = ({ spec }) => {
  let parsedSpec = {};
  try {
    parsedSpec = yaml.parse(spec);
  } catch (e) {
    parsedSpec = {};
  }

  return (
    <div className='h-full'>
    <h2 className='text-xl font-bold mb-4'>Swagger Preview</h2>
      <SwaggerUI spec={parsedSpec} />
    </div>
  );
};

export default SwaggerPreview;
