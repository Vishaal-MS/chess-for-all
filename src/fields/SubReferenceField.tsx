import React from 'react';
import { ReferenceField } from 'react-admin';
export const SubReference = ({ translateChoice, children, ...props }) => (
    <ReferenceField {...props}>{children}</ReferenceField>
);
