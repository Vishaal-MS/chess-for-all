import { Resource, createDefaults, editDefaults, formDefaults, listDefaults, SimpleForm,
	type ResourceActionDefs, type FieldSchema, MoneyField, MoneyInput, CardGrid, recordRep,
    createReferenceField, createReferenceInput, BooleanLiveFilter, ReferenceLiveFilter, DateLiveFilter,
    MoneyLiveFilter, TextLiveFilter
} from '@mahaswami/vc-frontend';
import { Group } from '@mui/icons-material';
import { Create, Edit, List, Menu,
    type ListProps, TextInput, DateField, DateInput, BooleanField, BooleanInput} from "react-admin";
import {CurriculumsReferenceField} from "./curriculums.tsx";
import {SubscribableList, SubscribableShow} from "./subscriptions/subscribables.tsx";

export const RESOURCE = "subscribables"
export const ICON = Group
export const PREFETCH: string[] = ["curriculum", "tenants"]

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
        list={<SubscribableList/>}
        create={<SubscribableCreate/>}
        edit={<SubscribableEdit/>}
        show={<SubscribableShow/>}
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
