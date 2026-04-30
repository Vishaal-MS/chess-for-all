import { useState, useEffect } from 'react';
import { People } from '@mui/icons-material';
import { Box, Avatar as MuiAvatar, CircularProgress } from '@mui/material';
import {
    Create,
    CreateProps,
    Edit,
    EditButton,
    EditProps,
    List,
    Menu,
    Show,
    ShowProps,
    SimpleFormProps,
    TextField,
    TextInput,
    TopToolbar,
    type ListProps,
    DateField,
    BooleanField,
    BooleanInput,
    SelectField,
    SelectInput,
    required,
    useUnique,
    AutocompleteInput,
    ReferenceInput, ReferenceField,
    useRecordContext,
} from "react-admin";
import {
    createDefaults,
    editDefaults,
    formDefaults,
    listDefaults,
    showDefaults,
    tableDefaults,
    Resource,
    RowActions,
    CardGrid,
    DateLiveFilter,
    TextLiveFilter,
    createReferenceField,
    createReferenceInput,
    getLocalStorage,
    ChoicesLiveFilter,
    BooleanLiveFilter,
    eventBus,
    useStepUp,
    StepUpAuthWall,
    getAuthService,
    DataTable,
    SimpleForm,
    SimpleShowLayout,
    RoleScopeInput,
    RoleScopeField,
} from '@mahaswami/vc-frontend';

export const RESOURCE = "users"
export const ICON = People
export const PREFETCH: string[] = []

export const UsersReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const UsersReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
let roleChoices = [] as any
eventBus.on("app_loaded", () => {
    roleChoices = getRoleChoices();
});
export const getRoleChoices = () => {
    if (!window.appPermissions?.roles) {
        return [];
    }
    const choices = [] as any[];
    const keys = Object.keys(window.appPermissions.roles);
    keys.sort();

    keys.forEach(role => {
        const value = window.appPermissions.roles![role];
        if (getLocalStorage('role')  === 'super_admin') {
            choices.push({ id: role, name: value.name });
        } else {
            if ( role != 'super_admin' ) {
                choices.push({ id: role, name: value.name });
            }
        }
    })
    return choices;
};
const filters = [
    <TextLiveFilter source="search" show/>,
    <ChoicesLiveFilter source="role" label="Role" />,
    <BooleanLiveFilter source="is_active" label="Active" />,
    <DateLiveFilter source="creation_date" label="Creation" />
]

export const UsersList = (props: ListProps) => {
    const isSuperAdmin = getLocalStorage('role') === 'super_admin';
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(props)}>
                <DataTable.Col source='image_file_id' label="Profile" field={ProfileField} />
                <DataTable.Col source="email" />
                <DataTable.Col source="is_active" field={BooleanField}/>
                {isSuperAdmin && (
                    <DataTable.Col source="tenant.name" />
                )}
                <DataTable.Col source="role" field={(props: any) => <SelectField {...props} choices={roleChoices} />}/>
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const ProfileField = (props: {
    source: string;
    record?: any;
    width?: number;
    height?: number;
    title?: string;
}) => {
    const record = useRecordContext<any>({ record: props.record });
    let sourceURL = record?.[props.source]?.[0]?.src;

    if (!record) {
        return null;
    }

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <MuiAvatar
                src={sourceURL ?? undefined}
                sx={{
                    width: props.width,
                    height: props.height,
                    fontSize: props.height ? '0.6rem' : undefined,
                }}
                title={props.title}
            >
                {record.first_name?.charAt(0).toUpperCase()}
                {record.last_name?.charAt(0).toUpperCase()}
            </MuiAvatar>
            {record.first_name} {record.last_name}
        </Box>
    );
};

export const UsersCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<TextField source="first_name" variant='h6' />}>
                <TextField source="last_name" />
                <TextField source="email" />
            </CardGrid>
        </List>
    )
}

const UserForm = (props: Omit<SimpleFormProps, "children">) => {
    const isSuperAdmin = getLocalStorage('role') === 'super_admin';
    const unique = useUnique();
    return (
        <SimpleForm {...formDefaults(props)}>
            <Box width="100%" display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap="1rem">
                <TextInput source="first_name" validate={required()} />
                <TextInput source="last_name" validate={required()} />
                <TextInput source="email" autoComplete="off"  validate={[required(), unique()]} />
                <TextInput source="mobile_number" />
                <BooleanInput source="is_active" defaultValue={true} />
                {isSuperAdmin && (
                    <ReferenceInput perPage={1000}  sort={{ field: 'name', order: 'ASC' }} label="Tenant" source="tenant_id" reference="tenants">
                        <AutocompleteInput optionText="name" validate={[required()]}/>
                    </ReferenceInput>
                )}
                <SelectInput source="role" choices={getRoleChoices()} validate={[required()]} />
                <ReferenceInput source="auth_policy_id" reference="auth_policies">
                    <AutocompleteInput optionText="name" validate={required()} />
                </ReferenceInput>
                <RoleScopeInput />
            </Box>
        </SimpleForm>
    );
};

const UserCreate = (props: CreateProps) => {
    return (
        <Create {...createDefaults(props)}>
            <UserForm />
        </Create>
    );
};

const UserEdit = (props: EditProps) => {
    return (
        <Edit {...editDefaults(props)}>
            <UserForm/>
        </Edit>
    );
};

const UserShowActions = () => (
    <TopToolbar>
        <EditButton />
    </TopToolbar>
);

const UserShow = (props: ShowProps) => {
    const isSuperAdmin = getLocalStorage('role')  === 'super_admin';
    return (
        <Show {...showDefaults(props)} actions={<UserShowActions />}>
            <SimpleShowLayout
                display="grid"
                gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}
                gap="1rem">
                <TextField source="first_name" />
                <TextField source="last_name" />
                <TextField source="email" />
                <TextField source="mobile_number" />
                <BooleanField source="is_active" />
                <DateField source="creation_date" />
                <TextField source="creation_location" />
                {isSuperAdmin && (
                    <ReferenceField label="Tenant" source="tenant_id" reference="tenants" />
                )}
                <SelectField source="role" choices={roleChoices} />
                <ReferenceField source="auth_policy_id" reference="auth_policies" />
                <RoleScopeField />
            </SimpleShowLayout>
        </Show>
    );
};

const UsersListWithStepUp = (props: ListProps) => {
    const { granted, grant } = useStepUp('admin_security');
    const [authConfig, setAuthConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAuthService().getMFAStatus()
            .then(setAuthConfig)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    if (authConfig?.require_reauth_for_settings && !granted) {
        return <StepUpAuthWall authConfig={authConfig} scope="admin_security" onGranted={grant} />;
    }

    return <UsersList {...props} />;
};

export const UsersResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        searchableFields={['first_name', 'last_name', 'email']}
        recordRepresentation={(record: any) => record.first_name}
        fieldSchema={{
            first_name: { required: true },
            last_name: { required: true },
            email: { required: true, unique: true },
            mobile_number: {},
            role: { type: 'choice', ui: 'select', choices: roleChoices },
            is_active: {},
            creation_date: {},
            creation_ip_address: {},
            creation_location: {},
            image_file_id: {},
            auth_policy_id: { resource: 'auth_policies' },
        }}
        filters={filters}
        list={<UsersListWithStepUp/>}
        cardList={<UsersCardList/>}
        create={<UserCreate/>}
        edit={<UserEdit/>}
        show={<UserShow/>}
        filtersPlacement="top"
        hasDialog
    />
)

export const UsersMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Users" leftIcon={<ICON />} />
);
