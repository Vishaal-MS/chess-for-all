import {
    AutocompleteInput,
    Button,
    Datagrid,
    FunctionField,
    List,
    ReferenceField, ReferenceInput, SelectInput,
    TextField,
    useListContext,
    useRecordContext, useRefresh, useUnselectAll
} from "react-admin";
import {ListTitle} from "../../components/Title.tsx";
import {dataProvider, getLocalStorage, PER_PAGE, remoteLog, SensibleDefaultPagination} from "@mahaswami/vc-frontend";
import {IconButton, Rating, Tooltip} from "@mui/material";
import {SearchInput} from "ra-ui-materialui";
import {MarkEmailReadRounded, MarkEmailUnreadRounded} from "@mui/icons-material";
import {formatDateWithShortYear} from "../../utils.ts";
import {currentTenantId, isSuperAdmin} from "../../businessLogic";
import {UserRoles} from "../../helpers/constants.ts";
import {Empty} from "../common/empty.tsx";

export const ReviewsList = () => {

    const getTypes = () => {
        const choices = [
            { id: 'message' , name: 'Message' },
            { id: 'review' , name: 'Review' }
        ]
        return choices;
    };

    const ReviewsFilters = isSuperAdmin() ? [
        <SearchInput source="q" alwaysOn/>,
        <ReferenceInput  source="publisher_tenant_id" reference="tenants" perPage={10000} alwaysOn sort={{field: 'name', order: 'ASC'}}>
            <AutocompleteInput optionText="name" label="Publisher"/>
        </ReferenceInput>,
        <ReferenceInput source="user_id" reference="users" perPage={10000} alwaysOn sort={{field: 'first_name', order: 'ASC'}}>
            <AutocompleteInput optionText="fullName" label="User"/>
        </ReferenceInput>,
        <SelectInput source="type" label="Type" choices={getTypes()} alwaysOn/>] : [<SearchInput source="q" alwaysOn/>];

    const userRole = getLocalStorage('role');
    const publisherFilter = userRole !== UserRoles.SUPER_ADMIN ?
        { publisher_tenant_id: currentTenantId(), type: 'review' } : {};

    return (
        <List title={<ListTitle resourceName="Reviews List"/>} resource="reviews" filter={publisherFilter} empty={<Empty emptyText={"No Reviews yet"}/>}
              queryOptions={{meta: {scopingEscapeHatch: true}}} sort={{field: "review_date", order: "DESC"}}
              pagination={<SensibleDefaultPagination/>} perPage={PER_PAGE} exporter={false} filters={ReviewsFilters}>
            <Datagrid bulkActionButtons={<BulkButtonMarkAsRead/>} expand={<ReviewDetail/>} rowSx={(record) => ({
                cursor: 'pointer', '& .MuiTypography-root': {fontWeight: record.is_read ? 400 : 700},
            })}>
                <ReferenceField reference={"subscribables"} queryOptions={{meta: {prefetch: ['curriculum']}}}
                                source={"subscribable_id"} link={false} label={"Curriculum"}>
                    <TextField source="curriculum.name"/>
                </ReferenceField>
                <FunctionField source="title" label="Review" render={record => record?.type === 'review' ?
                    <TextField source="title"/> : '' }/>
                <FunctionField label="Rating" render={record => record?.rating !== '0' ?
                    (<Rating value={record.rating} readOnly />) : [] }>
                </FunctionField>
                { isSuperAdmin() && <FunctionField source="title" label="Message" render={record => record?.type === 'message' ?
                    <TextField source="title"/> : '' } /> }
                <ReferenceField label="Subscriber" reference={"tenants"} source="subscriber_tenant_id" link={false}/>
                <ReferenceField label="User" reference={"users"} source="user_id" link={false}/>
                <FunctionField label={"Date"} render={record => formatDateWithShortYear(record.review_date)} />
                { isSuperAdmin() && <ReferenceField label="Publisher" source="publisher_tenant_id" reference="tenants" link={false}>
                    <TextField source="name"/>
                </ReferenceField> }
                {!isSuperAdmin() && <FunctionField
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

            </Datagrid>
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
                    dataProvider.update("reviews", {id: selectedId, data: {is_read: true, read_date: new Date()}})
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

export const MessagesList = () => {
    return (
        <List title={<ListTitle resourceName="Messages"/>} resource="reviews" filter={{type: 'message', publisher_tenant_id: currentTenantId()}}
              queryOptions={{meta: {scopingEscapeHatch: true}}} sort={{field: "review_date", order: "DESC"}}
              pagination={<SensibleDefaultPagination/>} perPage={PER_PAGE} exporter={false} empty={<Empty emptyText={"No Messages yet"}/>} >
            <Datagrid  bulkActionButtons={<BulkButtonMarkAsRead/>} expand={<ReviewDetail/>}
                      rowSx={(record) => ({cursor: 'pointer', '& .MuiTypography-root': {fontWeight: record.is_read ? 400 : 700}
            })}>
                <ReferenceField reference={"subscribables"} queryOptions={{meta: {prefetch: ['curriculum']}}}
                                source={"subscribable_id"} link={false} label={"Curriculum"}>
                    <TextField source="curriculum.name"/>
                </ReferenceField>
                <TextField source="title" label={"Message"}/>
                <ReferenceField label="User" reference={"users"} source="user_id" link={false}/>
                <FunctionField label={"Date"} render={record => formatDateWithShortYear(record.review_date)} />
                { isSuperAdmin() && <ReferenceField label="Publisher" source="publisher_tenant_id" reference="tenants" link={false}>
                    <TextField source="name"/>
                </ReferenceField> }
                {!isSuperAdmin() && <FunctionField
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
            </Datagrid>
        </List>
    )
}