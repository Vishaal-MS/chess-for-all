import {getPageTitle} from "../utils.ts";
import {appTitlePrefix} from "../configuration.tsx";
import {Typography} from "@mui/material";
import {useRecordContext} from "react-admin";

export const ListTitle = ( resourceName ) => {
    const tenantName = appTitlePrefix();
    const resource = resourceName.resourceName
    const title = getPageTitle({ tenantName, resource });

    return <Typography variant="h6">{title}</Typography>;
};

export const RecordTitle = ({resourceName, source}: { resourceName: string, source: string }) => {
    const tenantName = appTitlePrefix();
    const resource = resourceName
    const record = useRecordContext();
    const recordName = record?.[source] ?? record?.name ?? '';
    const title = getPageTitle({ tenantName, resource, recordName });

    return <Typography variant="h6">{title} &nbsp;</Typography>;
};