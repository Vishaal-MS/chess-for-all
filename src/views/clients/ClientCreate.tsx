import {Create, TextInput, useNotify, useRedirect} from "react-admin";
import {createDefaults, formDefaults, hideLoading, remoteLog, showLoading, SimpleForm} from "@mahaswami/vc-frontend";
import {useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {ClientTypes} from "../../constants.ts";
import {Box} from "@mui/material";
import {ExtendedClientFields} from "./ExtendedClientFields.tsx";

const ClientCreate = (props: any) => {
    const notify = useNotify();
    const redirect = useRedirect();
    let [searchParams] = useSearchParams();
    const clientType = searchParams.get('client_type');
    const dataProvider = window.swanAppFunctions.dataProvider;
    const [state, setState] = useState({
        loading: true,
        clientTypeId: null
    });

    useEffect(() => {
        const fetchClientType = async () => {
            try {
                const {data: clientTypes} = await dataProvider.getList('client_types', {
                    filter: { name: clientType },
                    meta: {scopingEscapeHatch: true}
                });
                const clientTypeData = clientTypes[0];
                setState({clientTypeId: clientTypeData.id, loading: false})
            } catch (error) {
                remoteLog("Error sending on fetchClientType: ", error);
            }
        }
        fetchClientType();
    }, [clientType]);

    const handleSave = async (data) => {
        const clientId = data.id;
        try {
            notify('Client created successfully!');
            if (clientType === ClientTypes.INDIVIDUAL)
                redirect('list', 'clients');
            else
                redirect(`/clients/${clientId}/1`)
        } catch (error) {
            console.error(error)
            notify('Error creating client and address', { type: "error" });
        }
    };

    // state.loading === true ? showLoading() : hideLoading();

    const clientTypeId = state.clientTypeId;

    const transformCreate = (values: any) => {
        const data = {
            ...values,
            name: `${values.first_name} ${values.last_name}`,
            client_type_id: clientTypeId,
            first_name: undefined,
            last_name: undefined,
            student: undefined,
        };

        const meta = {
            first_name: values.first_name,
            last_name: values.last_name,
            student: values.student,
        };
        return { data, meta };
    };
    let title = clientType === ClientTypes.INDIVIDUAL ? "Set up an Individual" : ("Set Up a " + ClientTypes.BUSINESS);

    return (
        <Create {...createDefaults(props)} transform={transformCreate} mutationOptions={{onSuccess: handleSave}}>
            <SimpleForm { ...formDefaults(props)}>
                {clientType === ClientTypes.INDIVIDUAL ?
                    <Box width='100%' display="grid" gap="1rem" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}>
                        <TextInput source="first_name" required/>
                        <TextInput source="last_name" required/>
                    </Box>
                    : <TextInput source="name" required/>
                }
                <ExtendedClientFields clientType={clientType} />
            </SimpleForm>
        </Create>
    )
}

export default ClientCreate;