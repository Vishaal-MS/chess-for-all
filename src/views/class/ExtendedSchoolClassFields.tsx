import {
    AutocompleteInput,
    ReferenceInput,
    required,
} from "react-admin";
import {useEffect, useState} from "react";
import {useWatch} from "react-hook-form";
import {isRegularSchoolFlavored} from "../../businessLogic.ts";

export const ExtendedSchoolClassFields = () => {
    const dataProvider = window.swanAppFunctions.dataProvider;
    const [state, setState] = useState({
        clientId: null,
        standardId: null
    })
    const values = useWatch();

    const clientId = values?.client_id || null;
    useEffect(() => {
        const fetchClientData = async () => {
            try {
                if (isRegularSchoolFlavored()) {
                    const {data: clients} = await dataProvider.getList('clients', {
                        filter: {client_type_id: 1}
                    });
                    const client = clients[0] || null;
                    if (client) {
                        setState(prevState => ({...prevState, clientId: client?.id, standardId: client.standard_id}));
                    }
                } else if (clientId){
                    const {data: client} = await dataProvider.getOne('clients', {id: clientId});
                    const standardId = client.standard_id;
                    setState(prevState => ({...prevState, clientId: client?.id, standardId: standardId}));
                } else {
                   setState(prevState => ({...prevState, clientId: null, standardId: null}));
                }
            } catch (error) {
                console.error("Error fetching client data:", error);
            }
        }
        fetchClientData();
    }, [state.clientId, clientId]);

    const {clientId: currentClientId, standardId} = state;

    return (
        <>
            <ReferenceInput source={'client_id'} reference={'clients'} filter={{client_type_id: 1, standard_id_neq: null}} >
                <AutocompleteInput optionText={'name'} defaultValue={currentClientId}
                                   sx={{display: isRegularSchoolFlavored() ? 'none' : 'flex'}}
                                   validate={[required()]}
                                   label="Client"/>
            </ReferenceInput>
            <ReferenceInput source="standard_grade_id" filter={{standard_id: standardId || ''}} reference="standard_grades">
                <AutocompleteInput optionText="name" label="Grade"/>
            </ReferenceInput>
        </>
    )
}