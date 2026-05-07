import * as React from 'react';
import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';
import Inbox from '@mui/icons-material/Inbox';
import {
    useTranslate,
    useResourceContext,
    useGetResourceLabel,
    useResourceDefinition,
} from 'ra-core';
import { CreateButton } from 'react-admin';


//NOTE: This is a modified version from react-admin allowing custom override of empty text and actions
export const Empty = (props: EmptyProps) => {
    const { className, actions, emptyText, showIcon = true, showCreateIfApplicable = false } = props;
    const resource = useResourceContext(props);
    const { hasCreate } = showCreateIfApplicable && useResourceDefinition(props);

    const translate = useTranslate();

    const getResourceLabel = useGetResourceLabel();
    const resourceName = translate(`resources.${resource}.forcedCaseName`, {
        smart_count: 0,
        _: resource ? getResourceLabel(resource, 0) : undefined,
    });

    const emptyMessage = translate('ra.page.empty', { name: resourceName });
    const inviteMessage = translate('ra.page.invite');

    return (
        <Root className={className}>
            <div className={EmptyClasses.message}>
                {showIcon && <Inbox className={EmptyClasses.icon} />}
                <Typography fontSize={"0.85rem"} variant="h6" paragraph>
                   {/* {translate(`resources.${resource}.empty`, {
                        _: emptyMessage,
                    })}*/}
                    {emptyText ? emptyText : emptyMessage}
                </Typography>
                {hasCreate && (
                    <Typography variant="body1">
                        {translate(`resources.${resource}.invite`, {
                            _: inviteMessage,
                        })}
                    </Typography>
                )}                
            </div>
            <div className={EmptyClasses.toolbar}>
                {actions}
                {hasCreate && (
                        <CreateButton variant="contained" />
                )}

            </div>
        </Root>
    );
};

export interface EmptyProps {
    resource?: string;
    hasCreate?: boolean;
    className?: string;
    actions?: React.ReactNode;
    emptyText: string;
    showIcon?: boolean;
    showCreateIfApplicable?: boolean;
}

const PREFIX = 'RaEmpty';

export const EmptyClasses = {
    message: `${PREFIX}-message`,
    icon: `${PREFIX}-icon`,
    toolbar: `${PREFIX}-toolbar`,
};

const Root = styled('span', {
    name: PREFIX,
    overridesResolver: (props, styles) => styles.root,
})(({ theme }) => ({
    flex: 1,
    [`& .${EmptyClasses.message}`]: {
        textAlign: 'center',
        opacity: theme.palette.mode === 'light' ? 0.5 : 0.8,
        margin: '0 1em',
        color:
            theme.palette.mode === 'light'
                ? 'inherit'
                : theme.palette.text.primary,
    },

    [`& .${EmptyClasses.icon}`]: {
        width: '9em',
        height: '9em',
    },

    [`& .${EmptyClasses.toolbar}`]: {
        textAlign: 'center',
        marginTop: '2em',
    },
}));