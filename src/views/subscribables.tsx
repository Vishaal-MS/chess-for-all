import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, MoneyField, MoneyInput, CardGrid, recordRep, createReferenceField, createReferenceInput, BooleanLiveFilter, ReferenceLiveFilter, DateLiveFilter, MoneyLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Group } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, DateField, DateInput, BooleanField, BooleanInput} from "react-admin";
import {CurriculumLessonsReferenceInput, CurriculumsReferenceField} from "./curriculums.tsx";

export const RESOURCE = "subscribables"
export const ICON = Group
export const PREFETCH: string[] = ["curricula", "publisher_tenants"]

export const SubscribablesReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const SubscribablesReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const subscribablesActionDefs: ResourceActionDefs = {};

export const OneTimeAmountMoneyField = (props: any) => <MoneyField {...props} currency="USD" />;
export const MonthlyAmountMoneyField = (props: any) => <MoneyField {...props} currency="USD" />;

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="curriculum_id" reference="curricula" label="Curriculum" />,
    <DateLiveFilter source="published_date" label="Published" />,
    <BooleanLiveFilter source="is_active" label="Active" />,
    <MoneyLiveFilter source="one_time_amount" label="One Time" currency="USD" />,
    <ReferenceLiveFilter source="publisher_tenant_id" reference="publisher_tenants" label="Publisher Tenant" />,
    <MoneyLiveFilter source="monthly_amount" label="Monthly" currency="USD" />,
    <BooleanLiveFilter source="is_unlisted" label="Unlisted" />
]

export const SubscribablesList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)} hiddenColumns={['rating', 'monthly_amount', 'is_unlisted']} >
                <DataTable.Col source="curriculum_id" field={CurriculumsReferenceField}/>
                <DataTable.Col source="published_date" field={DateField}/>
                <DataTable.Col source="is_active" field={BooleanField}/>
                <DataTable.Col source="one_time_amount" field={OneTimeAmountMoneyField}/>
                <DataTable.Col source="rating" />
                <DataTable.Col source="monthly_amount" field={MonthlyAmountMoneyField}/>
                <DataTable.Col source="is_unlisted" field={BooleanField}/>
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const SubscribablesCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<CurriculumsReferenceField source="curriculum_id" variant='h6' link={false} />}>
                <DateField source="published_date" />
                <BooleanField source="is_active" />
            </CardGrid>
        </List>
    )
}

const SubscribableForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)} display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
            <CurriculumLessonsReferenceInput source="curriculum_id" />
            <DateInput source="published_date" />
            <BooleanInput source="is_active" />
            <MoneyInput source="one_time_amount" currency="USD" />
            <TextInput source="rating" />
            <MoneyInput source="monthly_amount" currency="USD" />
            <BooleanInput source="is_unlisted" />
        </SimpleForm>
    )
}

const SubscribableEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <SubscribableForm />
        </Edit>
    )
}

const SubscribableCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <SubscribableForm />
        </Create>
    )
}

const SubscribableShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
                <CurriculumsReferenceField source="curriculum_id" />
                <DateField source="published_date" />
                <BooleanField source="is_active" />
                <MoneyField source="one_time_amount" currency="USD" />
                <TextField source="rating" />
                <MoneyField source="monthly_amount" currency="USD" />
                <BooleanField source="is_unlisted" />
            </SimpleShowLayout>
        </Show>
    )
}

const subscribablesFieldSchema: FieldSchema = {
    curriculum_id: { resource: 'curricula' },
    published_date: {},
    is_active: {},
    one_time_amount: { type: 'money', currency: 'USD' },
    publisher_tenant_id: { resource: 'publisher_tenants' },
    rating: {},
    monthly_amount: { type: 'money', currency: 'USD' },
    is_unlisted: {}
};
const subscribablesSearchableFields: string[] = [
    'rating'
];

export const SubscribablesResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => recordRep('curricula', record.curriculum)}
        fieldSchema={ subscribablesFieldSchema}
        actionDefs={ subscribablesActionDefs}
        searchableFields={ subscribablesSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<SubscribablesList/>}
        create={<SubscribableCreate/>}
        edit={<SubscribableEdit/>}
        show={<SubscribableShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<SubscribablesCardList/>}
        hasColumnChooser
        sort={{ field: 'rating', order: 'ASC' }}
    />
)
export const SubscribablesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Subscribables" leftIcon={<ICON />} />
)
