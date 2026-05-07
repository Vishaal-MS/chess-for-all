import {useUpdate, useRecordContext, useNotify} from 'react-admin';
import {Switch, Tooltip, SwitchProps} from '@mui/material';

interface InlineBooleanButtonProps {
    resource: string;
    source: string;
    label?: string;
    props?: SwitchProps;
}

const InlineBooleanButton = ({resource, source, label, props = {}}: InlineBooleanButtonProps) => {
    const record = useRecordContext();
    const [update, {isLoading}] = useUpdate();
    const notify = useNotify();
    const {disabled: disabledProp, ...restProps} = props;

    if (!record) return null;

    const value = Boolean(record[source]);

    const handleToggle = () => {
        update(
            resource,
            {id: record.id, data: {[source]: !value}, previousData: record},
            {
                onSuccess: () => {
                    notify(`Updated ${label}`, {type: 'success'});
                },
                onError: () => {
                    console.log(`Error updating ${label}`, {type: 'error'});
                },
            }
        );
    };

    return (
        <Tooltip title={label || source}>
            <Switch
                checked={value}
                onChange={handleToggle}
                size="small"
                disabled={isLoading || disabledProp}
                {...restProps}
            />
        </Tooltip>
    );
};

export default InlineBooleanButton;
