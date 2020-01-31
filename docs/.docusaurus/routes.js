
import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  
{
  path: '/',
  component: ComponentCreator('/'),
  exact: true,
  
},
{
  path: '/docs/:route',
  component: ComponentCreator('/docs/:route'),
  
  routes: [
{
  path: '/docs/endpoints',
  component: ComponentCreator('/docs/endpoints'),
  exact: true,
  
},
{
  path: '/docs/orchestration',
  component: ComponentCreator('/docs/orchestration'),
  exact: true,
  
},
{
  path: '/docs/samples/bahmni-fhir-transform',
  component: ComponentCreator('/docs/samples/bahmni-fhir-transform'),
  exact: true,
  
},
{
  path: '/docs/samples/dhis2-lookup',
  component: ComponentCreator('/docs/samples/dhis2-lookup'),
  exact: true,
  
},
{
  path: '/docs/setup',
  component: ComponentCreator('/docs/setup'),
  exact: true,
  
},
{
  path: '/docs/transformation',
  component: ComponentCreator('/docs/transformation'),
  exact: true,
  
},
{
  path: '/docs/validation',
  component: ComponentCreator('/docs/validation'),
  exact: true,
  
}],
},
  
  {
    path: '*',
    component: ComponentCreator('*')
  }
];
