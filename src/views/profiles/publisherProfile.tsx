import {ChessAIInput} from "../../fields/ai_lesson/ChessAIInput.tsx";
import {
    Button, Create, Edit,
    Loading,
    Show,
    SimpleForm,
    SimpleShowLayout, TopToolbar,
} from "react-admin";
import {remoteLog} from "@mahaswami/vc-frontend";
import {currentTenantId} from "../../businessLogic.ts";
import {useEffect, useState} from "react";
import {ChessAIField} from "../../fields/ai_lesson/ChessAIField.tsx";
import {ModeEditTwoTone} from "@mui/icons-material";
import {RecordTitle} from "../../components/Title.tsx";
import VisibilityIcon from '@mui/icons-material/Visibility';
import {TenantConfigNames} from "../../helpers/constants.ts";

export const PublisherProfile = () => {
    const dataProvider = window.swanAppFunctions.dataProvider;
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reloadKey, setReloadKey] = useState(0);
    const [editMode, setEditMode] = useState(false);

    const fetchData = async () => {
        try {
            const {data: profiles} = await dataProvider.getList("settings", {
                filter: {tenant_id: currentTenantId(), config_name: TenantConfigNames.PUBLISHER_PROFILE},
            });

            if (profiles.length > 0) {
                setRecord(profiles[0]);
            }

        } catch (error) {
            remoteLog("Error fetching my_profile:", error);
            console.error("Error fetching my_profile:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [reloadKey]);

    if (loading) return <Loading/>;

    const PublishTopToolbar = () => (
        <TopToolbar>
            <Button label={"EDIT"} startIcon={<ModeEditTwoTone fontSize="small"/>} variant={"outlined"}
                    onClick={() => setEditMode(true)}
            >
            </Button>
        </TopToolbar>
    )

    const ShowActions = () => (
        <TopToolbar>
            <Button label="Show" startIcon={<VisibilityIcon/>} onClick={() => setEditMode(false)} />
        </TopToolbar>
    );


    if (record?.config_value && !editMode) {
        return (
            <Show actions={<PublishTopToolbar/>} resource="settings" id={record?.id}
                  title={<RecordTitle resourceName={"My Profile Show"}/>}>
                <SimpleShowLayout>
                    <ChessAIField source="config_value" record={record} label={""}/>
                </SimpleShowLayout>
            </Show>
        );
    }

    if (record?.config_value && editMode) {
        return (
            <Edit actions={<ShowActions/>}
                title={<RecordTitle resourceName={"My Profile Edit"}/>}
                resource="settings"
                id={record.id}
                mutationMode={"pessimistic"}
                mutationOptions={{
                    onSuccess: async () => {
                        setEditMode(false);
                        setLoading(true)
                        await fetchData()
                    },
                }}
            >
                <SimpleForm>
                    <ChessAIInput source="config_value" label={false} fullWidth/>
                </SimpleForm>
            </Edit>
        );
    }

    return (
        <Create
            title={<RecordTitle resourceName="My Profile Create"/>}
            resource="settings"
            mutationOptions={{
                onSuccess: () => {
                    setReloadKey(prev => prev + 1);
                },
            }}
        >
            <SimpleForm defaultValues={{tenant_id: currentTenantId(), config_name: TenantConfigNames.PUBLISHER_PROFILE}}>
                <ChessAIInput source="config_value" label={false} fullWidth/>
            </SimpleForm>
        </Create>
    );
};
