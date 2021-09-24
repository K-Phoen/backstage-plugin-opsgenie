import React from 'react';
import { useOutlet } from 'react-router';
import { DefaultOpsgeniePage } from './DefaultOpsgeniePage';

export const OpsgeniePage = () => {
  const outlet = useOutlet();

  return outlet || <DefaultOpsgeniePage />;
};
