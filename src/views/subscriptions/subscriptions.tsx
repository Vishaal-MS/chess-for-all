import {
    Datagrid,
    DateField,
    List,
    ReferenceField,
    TextField,
    FunctionField,
    Button,
    Loading,
    TopToolbar, Create
} from 'react-admin';
import React, {useEffect} from "react";
import {formatAmount, getLanguagesMap} from "../../utils";
import {DateInput, ReferenceInput, SelectInput, SimpleForm,SearchInput} from "react-admin";
import {useRedirect} from "react-admin";
import {
    currentTenantId,
    isDivisionAdmin
} from "../../businessLogic";
import {DataTable, PER_PAGE, SensibleDefaultPagination} from "@mahaswami/vc-frontend";
import {ListTitle} from "../../components/Title.tsx";
import {CurriculumListView} from "../curriculum/curriculumListView.tsx";
import {Box, Typography} from "@mui/material";

const ListActions = () => {
    return(
        <TopToolbar sx={{alignItems: "center", justifyContent: "space-between"}}>
            <AddNewSubscription/>
        </TopToolbar>
    );
}


const AddNewSubscription = () => {
    const redirect = useRedirect();
    const handleClick = () => {
        redirect("/subscribables");
    }
    return(
        <Button sx={{ marginRight: '1.5rem' }} label="marketplace" onClick={handleClick} />
    )
}

const handleSubscriptionClick = (record: any, subscribables: any) => {
    const subscribable = subscribables.find(subscribable => subscribable.curriculum_id === record.id)
    return `/subscribables/${subscribable.id}/show?from=subscribedCurriculums`;
}

interface StateType {
    loading: boolean;
    mySubscribedCurriculumIds: number[];
    subscribables: any;
    settingsData: any[];
    subscriptions: any[];
}

export const SubscriptionsList = () => {
    const [state, setState] = React.useState<StateType>({
        loading: true,
        mySubscribedCurriculumIds: [],
        subscribables: [],
        settingsData: [],
        subscriptions: []
    })

    useEffect(() => {
        const fetchSubscribedCurriculums = async () => {
            const dataProvider = window.swanAppFunctions.dataProvider;
            const { data: subscriptions } = await dataProvider.getList('subscriptions', {
                filter: { subscriber_tenant_id: currentTenantId() },
                meta: { prefetch: ['subscribables'] },
                pagination: { page: 1, perPage: 10000 }
            });
            const subscribableIds = subscriptions.map(subscription => subscription.subscribable_id);
            const {data: subscribables} = await dataProvider.getList('subscribables', {
                filter: { id: subscribableIds },
                meta: {scopingEscapeHatch: true, prefetch: ['curriculum', 'tenants']},
                pagination: { page: 1, perPage: 10000 }
            });
            const {data: settings} = await dataProvider.getList("settings", {
                meta: { scopingEscapeHatch: true },
                pagination: { page: 1, perPage: 10000}
            });
            const subscribedCurriculumIds = subscribables.map(subscribable => subscribable.curriculum_id);
            setState({loading: false, mySubscribedCurriculumIds: subscribedCurriculumIds, subscribables , settingsData: settings, subscriptions});
        }
        fetchSubscribedCurriculums()
    }, [])

    const { loading, mySubscribedCurriculumIds, subscribables, settingsData, subscriptions } = state;
    
    if (loading) {
        return <Loading/>
    }

    const filters = [
        <SearchInput source="q" alwaysOn sx={{
            '& .MuiFilledInput-input': {
                height: '2em',
            }}}/>,
        <SelectInput source="language" alwaysOn choices={getLanguagesMap()} sx={{
            '& .MuiFilledInput-input': {
                minWidth: '160px',
            }}} />,
    ];

    const CustomEmptyList = () => (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center"
             height="calc(100vh - 200px)" >
            <Typography sx={{color: 'grey'}} variant="h4" gutterBottom>
                No Subscriptions Yet
            </Typography>
            <AddNewSubscription/>
        </Box>
    );

    return (
        <List title={<ListTitle resourceName='Subscribed Curriculums List'/>} resource='curriculum'
            queryOptions={{ meta: { scopingEscapeHatch: true, scopingEscapeDivision: true}}}
            empty={<CustomEmptyList/>}
            pagination={<SensibleDefaultPagination />} perPage={PER_PAGE}
            actions={!isDivisionAdmin() && <ListActions/>} 
            filter={{id: mySubscribedCurriculumIds}}
            filterDefaultValues={{ language: 'EN' }}
            sort={{ field: 'name', order: 'ASC' }}
            sx={{ marginTop: isDivisionAdmin() ? "3rem" : 0}}
            filters={filters}
            disableSyncWithLocation
        >
            <DataTable bulkActionButtons={false} rowClick={(_id, _resource, record) => handleSubscriptionClick(record, subscribables)}>
                <CurriculumListView currentView="subscriptions" settings={settingsData} subscribables={subscribables} subscriptions={subscriptions}/>
            </DataTable>
        </List>
    );
}

export const SubscriptionInvoiceList = () => (
    <List>
        <Datagrid>
            <ReferenceField source="subscription_id" reference="subscriptions" label={"Curriculum"}>
                <ReferenceField source="subscribable_id" reference="subscribables" link={false}>
                    <ReferenceField source="curriculum_id" reference="curriculum" link={false}>
                        <TextField source="name"/>
                    </ReferenceField>
                </ReferenceField>
            </ReferenceField>
            <ReferenceField source="subscription_id" reference="subscriptions" label={"Subscriber"}>
                <ReferenceField source="subscriber_tenant_id" reference="tenants" link={false} >
                        <TextField source="name"/>
                </ReferenceField>
            </ReferenceField>
            <DateField source="invoice_date" label={"Invoice Date"}/>
            <FunctionField label="Amount" render={record => formatAmount(record.amount)} />
            <TextField source="status" sx={{textTransform: 'capitalize'}}/>
        </Datagrid>
    </List>
);

const ContentFilter = (props) => {
    return (
        <SearchInput source="q" alwaysOn/>
    )
}

export const SubscriptionCreate = (props) => {
    return(
        <Create {...props} title={<ListTitle resourceName="Create Subscriptions"/>}>
            <SimpleForm>
                <List resource={"subscribables"} filters={<ContentFilter/>} exporter={false}>
                </List>
                <DateInput source="start_date" label="Start Date"/>
                <DateInput source="end_date" label="End Date"/>
                <ReferenceInput source="tenant_id" reference={"tenants"} perPage={1000}>
                    <SelectInput optionText="name"/>
                </ReferenceInput>
            </SimpleForm>
        </Create>
    )
}
