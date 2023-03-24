import React from 'react';
import { useOutlet } from 'react-router';
import { DefaultOpsgeniePage } from './DefaultOpsgeniePage';

export type OpsgeniePageProps = {
  onCallListCardsCount?: number;
  onCallUseScheduleName?: boolean;
};

export const OpsgeniePage = ({ onCallListCardsCount, onCallUseScheduleName }: OpsgeniePageProps) => {
  const outlet = useOutlet();

  return outlet || <DefaultOpsgeniePage onCallListCardsCount={onCallListCardsCount} onCallUseScheduleName={onCallUseScheduleName} />;
};