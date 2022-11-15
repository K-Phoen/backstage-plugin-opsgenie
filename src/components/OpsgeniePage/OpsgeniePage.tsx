import React from 'react';
import { useOutlet } from 'react-router';
import { DefaultOpsgeniePage } from './DefaultOpsgeniePage';

export type OpsgeniePageProps = {
  onCallListCardsCount?: number;
};

export const OpsgeniePage = ({ onCallListCardsCount }: OpsgeniePageProps) => {
  const outlet = useOutlet();

  return outlet || <DefaultOpsgeniePage onCallListCardsCount={onCallListCardsCount} />;
};
