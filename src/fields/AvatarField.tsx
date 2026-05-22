import { Avatar as MuiAvatar } from '@mui/material';
import { useRecordContext } from 'react-admin';

export const AvatarField = (props: {
    record?: any;
    width?: number;
    height?: number;
    title?: string;
}) => {
    const record = useRecordContext<any>(props);
    const defaultSize = 32;

    // If we come from Different Reference, the record is defined (to pass the User as a prop),
    // but neither of those fields are and this lead to an error when creating contact.
    if (!record?.image_file_id && record.first_name && record.last_name) {
        return (
            <MuiAvatar 
                sx={{
                    width: props.width || defaultSize,
                    height: props.height || defaultSize,
                    fontSize: "1rem",
                }}
                title={props.title}
            >
                {record?.first_name?.charAt(0).toUpperCase()}
                {record?.last_name?.charAt(0).toUpperCase()}
            </MuiAvatar>
        );
    }

    return (
        <MuiAvatar
            src={record?.image_file_id[0]?.src ?? undefined}
            sx={{
                width: props.width || defaultSize,
                height: props.height || defaultSize,
                fontSize: props.height ? '0.6rem' : undefined,
            }}
            title={props.title}
        >
            {record.fullName?.charAt(0).toUpperCase()}
        </MuiAvatar>
    );
};
