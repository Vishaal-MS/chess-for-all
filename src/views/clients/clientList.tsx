import {
    Button,
    List,
    Toolbar,
    AutocompleteInput
} from "react-admin";
import {DataTable, listDefaults, openDialog, PER_PAGE, SensibleDefaultPagination} from "@mahaswami/vc-frontend";
import AddIcon from '@mui/icons-material/Add';
import {useNavigate} from "react-router-dom";
import {Box, Typography} from "@mui/material";
import {
    isRegularSchoolFlavored,
    isSchoolStandardLinked,
    isExecutiveCoachingFlavored, getStandardId
} from "../../backend/common_logics.ts";
import {getSetupLabel, getClientLabel} from "../../helpers/constants.ts";
import {StandardsReferenceField} from "../standards.tsx";
import {StandardGradesReferenceInput} from "../standard_grades.tsx";
import {Fragment} from "react";
import {StudentEdit} from "./students.tsx";
import {AddStudents} from "./addStudents.tsx";

export const ClientList = (props: any) => {
    const navigate = useNavigate();
    const omitedColumns = isExecutiveCoachingFlavored() ? ['primary_contact_name', 'primary_contact_number'] : [];

    const ListActions = () => (
        <Toolbar sx={{float: 'right'}}>
            {isRegularSchoolFlavored() ? <SchoolStudentAddActions/> :
                <Fragment>
                    <ClientIndividualAction/>
                    {!isExecutiveCoachingFlavored() && <ClientBusinessAction/>}
                </Fragment>
            }
        </Toolbar>
    )

    const handleOnClick = (clientType) => {
        navigate({
            pathname: '/clients/create',
            search: `?client_type=${clientType}`
        })
    }

    const ClientIndividualAction = () => {
        let label = getSetupLabel().SET_UP_A_LABEL
        return(
            <Button label={label} onClick={() => handleOnClick('Individual')}><AddIcon /></Button>
        )
    }

    const ClientBusinessAction = () => {
        return(
            <Button label="Set up a Business" onClick={() => handleOnClick('Business')} ><AddIcon /></Button>
        )
    }
    const CustomEmptyList = () => (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            height="calc(100vh - 200px)"
        >
            <Typography sx={{color: 'grey'}} variant="h4" gutterBottom>
                {isRegularSchoolFlavored() ? "No Students Yet" : "No Clients Yet"}
            </Typography>
            <Toolbar sx={{justifyContent: 'center', gap: 2}}>
                {isRegularSchoolFlavored() ? <SchoolStudentAddActions/> :
                    <Fragment>
                        <ClientIndividualAction/>
                        {!isExecutiveCoachingFlavored() && <ClientBusinessAction/>}
                    </Fragment>
                }

            </Toolbar>
        </Box>
    );
    const clientLabel = getClientLabel().CLIENT_LABEL
    const SchoolStudentAddActions =  () => {
        const dataProvider = window.swanAppFunctions.dataProvider;
        const navigate = useNavigate();

        const handleAddStudent = async () => {
            try {
                const {data: clients} = await dataProvider.getList('clients');
                const client = clients[0] || null;
                openDialog(<AddStudents client={client} width="70vw"/>)
            } catch (error) {
                console.error('Error fetching clients:', error);
            }

        }

        return(
            <Toolbar sx={{float: 'right'}}>
                <Button label="Add Student" onClick={handleAddStudent}><AddIcon /></Button>
            </Toolbar>
        )
    }

    const handleEditSchoolStudent = (studentId) => {
        openDialog(<StudentEdit studentId={studentId} width="70vw"/>);
        return false;
    }

    if (isRegularSchoolFlavored()) {
        const statndardId = getStandardId();
        const filters = [
            <StandardGradesReferenceInput source="standard_grade_id" filter={{ standard_id: statndardId}} alwaysOn>
                <AutocompleteInput label='Grade' sx={{ width: '16vw'}} optionText='name' />
            </StandardGradesReferenceInput>
        ];

        return (
            <List { ...listDefaults(props) } filters={filters} empty={<CustomEmptyList />} resource={"students"} actions={<ListActions />}
                  pagination={<SensibleDefaultPagination/>} perPage={PER_PAGE} queryOptions={{meta: {prefetch: ['users', 'standard_grades']}}}>
                <DataTable bulkActionButtons={false} rowClick={handleEditSchoolStudent}>
                    <DataTable.Col source={'user.first_name'} label={'First Name'}/>
                    <DataTable.Col source={'user.last_name'} label={'Last Name'}/>
                    <DataTable.Col source={'user.email'} label={'Email'}/>
                    <DataTable.Col source={'standard_grade.name'} label={'Grade'} />
                </DataTable>
            </List>
        )
    }

    return (
        <List { ...listDefaults(props)} actions={<ListActions/>} empty={<CustomEmptyList/>}
              pagination={<SensibleDefaultPagination/>} perPage={PER_PAGE}
              exporter={false} queryOptions={{meta: {prefetch: ['client_types']}}}>
            <DataTable bulkActionButtons={false} omit={omitedColumns}>
                <DataTable.Col source="name" />
                <DataTable.Col source="email"/>
                <DataTable.Col label={"Type"} render={(record: any) => {
                    if (record.standard_id) {
                        return "School";
                    } else {
                        return record.client_type?.name;
                    }
                }}/>
                <DataTable.Col source="primary_contact_name" label="Business Contact Name" />
                <DataTable.Col source="primary_contact_number" label="Business Contact Number" />
                {isSchoolStandardLinked() && <StandardsReferenceField source="standard_id" link={false} />}
            </DataTable>
        </List>
    )
}
