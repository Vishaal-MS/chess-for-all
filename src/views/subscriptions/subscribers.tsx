import {Datagrid, FunctionField, ReferenceField, TextField, AutocompleteInput, ReferenceInput} from 'react-admin';
import {PER_PAGE, SensibleDefaultPagination} from "@mahaswami/vc-frontend";
import {formatDateWithShortYear} from "../../utils.ts";
import {SearchInput} from "ra-ui-materialui";
import {isSuperAdmin} from "../../businessLogic.ts";
import { SwanList } from '../swan_crud/SwanCrud.tsx';

export const SubscribersList = () => {

    const SubscribersFilters = isSuperAdmin() ? [
        <SearchInput source="q" alwaysOn/>,
        <ReferenceInput reference="tenants" source="tenant_id" perPage={10000} alwaysOn sort={{field: 'name', order: 'ASC'}} >
            <AutocompleteInput optionText="name" label="Publisher" />
        </ReferenceInput>,
        <ReferenceInput source="subscriber_tenant_id" reference="tenants" perPage={10000} alwaysOn sort={{field: 'name', order: 'ASC'}}>
            <AutocompleteInput optionText="name" label="Subscriber"/>
        </ReferenceInput>
    ] : [<SearchInput source="q" alwaysOn/>];
    return (
        <SwanList filters={SubscribersFilters} pagination={<SensibleDefaultPagination />} perPage={PER_PAGE} exporter={false}>
            <Datagrid>
                <ReferenceField source="subscribable_id" reference="subscribables" link={false} label="Curriculum">
                    <ReferenceField source="curriculum_id" reference="curriculum" link={false}>
                        <TextField source="name" />
                    </ReferenceField>
                </ReferenceField>
                { isSuperAdmin() && <ReferenceField reference="subscribables" source="subscribable_id" label="Publisher" >
                    <ReferenceField reference="tenants" source="publisher_tenant_id" label="Publisher" link={false}>
                        <TextField source="name" label="Publisher"></TextField>
                    </ReferenceField>
                </ReferenceField> }
                <ReferenceField reference="tenants" source="subscriber_tenant_id" link={false} label="Subscriber">
                    <TextField source="name"></TextField>
                </ReferenceField>
                <TextField source="subscription_type"  label="Subscription Type" textTransform={"capitalize"}/>
                <FunctionField label="Start Date" render={record => formatDateWithShortYear(record.start_date)} />
                <FunctionField label="End Date" render={record => formatDateWithShortYear(record.end_date)} />
                {/* <ReferenceField source="tenant_id" reference="tenants" />*/}
            </Datagrid>
        </SwanList>
    );
}