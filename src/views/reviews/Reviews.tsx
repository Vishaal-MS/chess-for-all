import {
    Button, FunctionField, List, ReferenceField, TextField,
    useListContext, useRecordContext, useRefresh, useUnselectAll
} from "react-admin";
import {ListTitle} from "../../components/Title.tsx";
import {
    dataProvider,
    DataTable,
    getLocalStorage, listDefaults,
    PER_PAGE,
    remoteLog,
    SensibleDefaultPagination, tableDefaults
} from "@mahaswami/vc-frontend";
import {IconButton, Rating, Tooltip} from "@mui/material";
import {MarkEmailReadRounded, MarkEmailUnreadRounded} from "@mui/icons-material";
import {formatDateWithShortYear} from "../../utils.ts";
import {currentTenantId, isSuperAdmin} from "../../backend/common_logics";
import {UserRoles} from "../../helpers/constants.ts";
import {Empty} from "../common/empty.tsx";
import {SubscribablesReferenceField} from "../subscribables.tsx";
import {UsersReferenceField} from "../users.tsx";

export const ReviewsList = (props) => {
    const userRole = getLocalStorage('role');
    const publisherFilter = userRole !== UserRoles.SUPER_ADMIN ?
        { publisher_tenant_id: currentTenantId(), type: 'review' } : {};

    return (
        <List { ...listDefaults(props)} filter={publisherFilter} empty={<Empty emptyText={"No Reviews yet"}/>}
              queryOptions={{meta: { scopingEscapeHatch: true }}} sort={{field: "review_date", order: "DESC"}}
              exporter={false}>
            <DataTable { ...tableDefaults('reviews')} bulkActionButtons={<BulkButtonMarkAsRead/>} expand={<ReviewDetail/>} rowSx={(record) => ({
                cursor: 'pointer', '& .MuiTypography-root': {fontWeight: record.is_read ? 400 : 700},
            })}>
                <DataTable.Col label={"Curriculum"} field={() =>
                    <SubscribablesReferenceField source={"subscribable_id"} link={false}>
                        <TextField source="curriculum.name"/>
                    </SubscribablesReferenceField>
                } />
                <DataTable.Col source="title" label="Review" render={record => record?.type === 'review' ?
                    <TextField source="title"/> : '' }/>
                <DataTable.Col label="Rating" render={record => record?.rating !== '0' ?
                    (<Rating value={record.rating} readOnly />) : [] }>
                </DataTable.Col>
                { isSuperAdmin() && <DataTable.Col source="title" label="Message" render={record => record?.type === 'message' ?
                    <TextField source="title"/> : '' } /> }
                <DataTable.Col label="Subscriber" field={() => <ReferenceField reference='tenants' source="subscriber_tenant_id" link={false}/> }/>
                <DataTable.Col label="User" source="user_id" field={UsersReferenceField} />
                <DataTable.Col label={"Date"} render={record => formatDateWithShortYear(record.review_date)} />
                { isSuperAdmin() && <DataTable.Col label="Publisher" field={() =>
                    <ReferenceField source="publisher_tenant_id" reference="tenants" link={false} />
                }/> }
                {!isSuperAdmin() && <DataTable.Col
                    render={(record) =>
                        record.is_read ? (
                            <Tooltip title={"Mark as Unread"}>
                                <IconButton
                                    sx={{p: 0.5}}
                                    color="primary"
                                    onClick={() => handleForRead(record.id, false)}
                                >
                                    <MarkEmailUnreadRounded fontSize="small"/>
                                </IconButton>
                            </Tooltip>
                        ) : (
                            <Tooltip title={"Mark as Read"}>
                                <IconButton sx={{p: 0.5}} color="primary" onClick={() => handleForRead(record.id, true)}>
                                    <MarkEmailReadRounded fontSize="small"/>
                                </IconButton>
                            </Tooltip>
                        )
                    }
                />}
            </DataTable>
        </List>
    );
};

const handleForRead = async (id: number, isRead: boolean) => {
    try {
        await dataProvider.update("reviews", {id, data: {is_read: isRead, read_date: new Date()},});
        window.location.reload()
    } catch (error) {
        console.error("Error marking review / message as read:", error);
        remoteLog("Error marking review / message as read: ", error);
    }
};

export const ReviewDetail = () => {
    const record = useRecordContext();
    return (
        <div dangerouslySetInnerHTML={{__html: record.review}}/>
    );
};

export const BulkButtonMarkAsRead = () => {
    const {selectedIds} = useListContext();
    const unselectAll = useUnselectAll("reviews");
    const refresh = useRefresh();
    const dataProvider = window.swanAppFunctions.dataProvider;
    const handleMarkAsRead = async () => {
        try {
            await Promise.all(
                selectedIds.map((selectedId) =>
                    dataProvider.update("reviews", {id: selectedId, data: { is_read: true }})
                )
            );
            unselectAll();
            refresh();
        } catch (error) {
            console.error("Error marking reviews as read:", error);
        }
    };
    return (<Button label={"Mark As Read"} startIcon={<MarkEmailReadRounded fontSize="small"/>}
                    onClick={() => handleMarkAsRead()}/>)
}

export const MessagesList = (props) => {
    return (
        <List {...listDefaults(props)} title={<ListTitle resourceName="Messages"/>} resource="reviews" filter={{type: 'message', publisher_tenant_id: currentTenantId()}}
              queryOptions={{meta: {scopingEscapeHatch: true}}} sort={{field: "review_date", order: "DESC"}}
              pagination={<SensibleDefaultPagination/>} perPage={PER_PAGE} exporter={false} empty={<Empty emptyText={"No Messages yet"}/>} >
            <DataTable bulkActionButtons={<BulkButtonMarkAsRead/>} expand={<ReviewDetail/>}
                      rowSx={(record) => ({cursor: 'pointer', '& .MuiTypography-root': {fontWeight: record.is_read ? 400 : 700}
            })}>
                <DataTable.Col label={"Curriculum"} field={() =>
                    <SubscribablesReferenceField source={"subscribable_id"} link={false}>
                        <TextField source="curriculum.name"/>
                    </SubscribablesReferenceField>
                } />
                <DataTable.Col source="title" label={"Message"} />
                <DataTable.Col label="User" source="user_id" field={UsersReferenceField} />
                <DataTable.Col label={"Date"} render={record => formatDateWithShortYear(record.review_date)} />
                { isSuperAdmin() && <DataTable.Col label="Publisher" field={() =>
                    <ReferenceField source="publisher_tenant_id" reference="tenants" link={false} /> }/> }
                {!isSuperAdmin() && <DataTable.Col label={false}
                    render={(record) =>
                        record.is_read ? (
                            <Tooltip title={"Mark as Unread"}>
                                <IconButton
                                    sx={{p: 0.5}}
                                    color="primary"
                                    onClick={() => handleForRead(record.id, false)}
                                >
                                    <MarkEmailUnreadRounded fontSize="small"/>
                                </IconButton>
                            </Tooltip>
                        ) : (
                            <Tooltip title={"Mark as Read"}>
                                <IconButton
                                    sx={{p: 0.5}}
                                    color="primary"
                                    onClick={() => handleForRead(record.id, true)}
                                >
                                    <MarkEmailReadRounded fontSize="small"/>
                                </IconButton>
                            </Tooltip>
                        )
                    }
                />}
            </DataTable>
        </List>
    )
}