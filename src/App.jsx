import React, { useState } from 'react';
import CodeEditor from './components/CodeEditor';
import SwaggerPreview from './components/SwaggerPreview';
import FlowView from './components/FlowView';
import Header from './components/Header';

function App() {
  // Load default file
  const defaultSpec = '';
//   const defaultSpec = `openapi: 3.0.0
// info:
//   title: Sample API
//   version: 1.0.0
// paths:
//   /users:
//     get:
//       summary: Get all users
//       responses:
//         '200':
//           description: A list of users
//           content:
//             application/json:
//               schema:
//                 type: array
//                 items:
//                   type: object
//                   properties:
//                     id:
//                       type: integer
//                     name:
//                       type: string
//                     email:
//                       type: string
//   /users/{id}:
//     get:
//       summary: Get a user by ID
//       parameters:
//         - name: id
//           in: path
//           required: true
//           description: The ID of the user to retrieve
//           schema:
//             type: integer
//       responses:
//         '200':
//           description: A user object
//           content:
//             application/json:
//               schema:
//                 type: object
//                 properties:
//                   id:
//                     type: integer
//                   name:
//                     type: string
//                   email:
//                     type: string`;
  const [spec, setSpec] = useState(defaultSpec); // Shared state for OpenAPI spec
  const [isFlowExpanded, setIsFlowExpanded] = useState(false); // State to toggle API Flow expansion

  return (
    <div className='flex flex-col w-full h-screen bg-gray-900 text-gray-100'>
      {/* Header */}
      <Header title='OpenAPI Visualizer' />

      {/* Main Content */}
      <div className='flex flex-grow overflow-hidden'>

        <h2> Paste your YAML/JSON Openapi Spec file in the left panel to visualize </h2>
        {/* Left Panel */}
        <div className={`w-full ${isFlowExpanded ? 'md:w-1/4' : 'md:w-1/3'} flex flex-col p-4 overflow-auto`}>
          <CodeEditor spec={spec} setSpec={setSpec} />
        </div>

        {/* Middle Panel */}
        <div className={`w-full ${isFlowExpanded ? 'hidden' : 'md:w-1/3'} flex flex-col p-4 overflow-auto`}>
          <SwaggerPreview spec={spec} />
        </div>

        {/* Right Panel */}
        <div className={`w-full ${isFlowExpanded ? 'md:w-3/4' : 'md:w-1/3'} flex flex-col p-4 overflow-auto`}>
          <h2 className='text-xl font-bold mb-4'>API Flow</h2>
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => setIsFlowExpanded(!isFlowExpanded)}
          >
            <img
              src={isFlowExpanded ? "Arrow-Right.svg" : "Arrow-Left.svg"}
              className="w-4 h-4 mr-2"
              alt="Icon"
            />
            <span className="sr-only">{isFlowExpanded ? 'Collapse API Flow' : 'Expand API Flow'}</span>
            {isFlowExpanded ? 'Collapse API Flow' : 'Expand API Flow'}
          </button>
          <div className='flex-grow mt-4'>
            <FlowView spec={spec} isExpanded={isFlowExpanded} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
