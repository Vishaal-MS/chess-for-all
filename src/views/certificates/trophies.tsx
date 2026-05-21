import {
    TextInput, ImageInput, ImageField,
    List, Edit, SimpleShowLayout, TextField, DateField,
    Show
} from 'react-admin';
import { Grid,Card, Box ,Typography} from '@mui/material';
import {Toolbar, Button} from 'react-admin';
import {isExecutiveCoachingFlavored, isProCoach} from "../../businessLogic";
import {DataTable, PER_PAGE, SensibleDefaultPagination, SimpleForm} from "@mahaswami/vc-frontend";
import {TrophyTypesReferenceField} from "../trophy_types.tsx";
import {CoachesReferenceField} from "../coaches.tsx";
import {StudentsReferenceField} from "../students.tsx";
import {ClientsReferenceField} from "../clients.tsx";
import {CurriculumsReferenceField} from "../curriculums.tsx";

const TrophyListActions = () => (
    <Toolbar>
        <Button variant="contained" sx={{marginRight:1}} label="New Trophy" onClick={() => {alert('This is coming soon. We\'re working on it!')}} />
        <Button variant="contained" label="Order Trophies" onClick={() => {alert('Ordering trophies is coming soon. We\'re working on it!')}} />
    </Toolbar>
);

export const TrophyList = () => (
    <List actions={<TrophyListActions/>} pagination={<SensibleDefaultPagination />} perPage={PER_PAGE}>
        <DataTable>
            <DataTable.Col source="trophy_type_id" label={"Type"} field={TrophyTypesReferenceField} />
            {!isProCoach() && <DataTable.Col source="coach_id" field={() => 
                <CoachesReferenceField source="coach_id" link={false}>
                    <TextField source="user.fullName" label="Name"/>
                </CoachesReferenceField>
            }/>}
            <DataTable.Col source="student_id" field={() =>
                <StudentsReferenceField source="student_id" link={false}>
                    <TextField source="user.fullName" label="Name"/>
                </StudentsReferenceField>}
            />
            <DataTable.Col source="client_id" field={ClientsReferenceField} />
            <DataTable.Col source="ordered_date" label="Ordered Date" field={DateField} />
            <DataTable.Col source="received_date" label="Received Date"field={DateField} />
            <DataTable.Col source="issued_date" label="Issued Date" field={DateField} />
            <DataTable.Col source="status" sx={{textTransform: 'capitalize'}} />
        </DataTable>
    </List>
);

export const TrophiesEdit = () => {

    return(
        <Edit>
            <SimpleForm>
                <CoachesReferenceField source="coach_id" label="Coach" />
                <StudentsReferenceField source="student_id" label={isExecutiveCoachingFlavored() ? "Executive" : "Student"} />
                <CurriculumsReferenceField source="curriculum_id" label="Curriculum" />
                <ClientsReferenceField source="client_id" label="Client" />
                <TextInput source="issued_date" label="Issued Date" />
                <ImageInput source="image_file_id" label="Certificate Image">
                    <ImageField source="src" title="title" />
                </ImageInput>
            </SimpleForm>
        </Edit>
    );
}

export const TrophyShow = () => {
    return(
        <Show>
            <SimpleShowLayout>
                <Grid container spacing={2} style={{padding: "12px"}}>
                    <Grid item xs={6}>
                        <Card sx={{alignItems: 'center', padding: 3, boxShadow: 2,height: 500}}>
                            <ImageField source="image_file_id" src="src" title="title" label="" sx={{ '& .RaImageField-image': { width:'100%',height: 400, objectFit: 'contain' },
                                '& .RaImageField-list':{justifyContent: 'center'}}}/>
                        </Card>
                    </Grid>
                    <Grid item xs={6}>
                        <Card sx={{alignItems: 'center', padding: 3, boxShadow: 2,height: 500}}>
                            <Box sx={{display: 'flex', flexDirection: 'row',textAlign: 'center',justifyContent: 'center'}}>
                                <StudentsReferenceField source="student_id" link={false}>
                                    <ImageField source="user.image_file_id" src="src" title="title"
                                                sx={{ '& .RaImageField-image': { width:'100%',height:200,objectFit: 'contain' },}}/>
                                </StudentsReferenceField>
                            </Box>
                            <Box sx={{display: 'flex', flexDirection: 'row',textAlign: 'center', justifyContent:'center',marginTop:4}}>
                                <StudentsReferenceField source="student_id">
                                    <Typography variant="h5"> Awarded To:
                                    <TextField source="user.fullName" label="Name" variant={"h5"} sx={{margin:2}}/></Typography>
                                </StudentsReferenceField>
                            </Box>
                            <Box sx={{display: 'flex', flexDirection: 'row',textAlign: 'center', justifyContent:'center'}}>
                                <CoachesReferenceField source="coach_id" reference="coaches" link={false}>
                                    <Typography variant="h5">Coach :
                                    <TextField source="user.fullName" label="Name" variant={"h5"} sx={{margin:2}}/></Typography>
                                </CoachesReferenceField>
                            </Box>
                            <Box sx={{display: 'flex', flexDirection: 'row',textAlign: 'center', justifyContent:'center'}}>
                                <Typography variant="h5">Issued On :
                                    <TextField source="issued_date" label="Name" variant={"h5"} sx={{margin:2}}/>
                                </Typography>
                            </Box>
                            <Box sx={{display: 'flex', flexDirection: 'row',textAlign: 'center', justifyContent:'center'}}>
                                <Typography variant="h5">
                                    <TextField source="details" label="Name" variant={"h5"} sx={{margin:2}}/>
                                </Typography>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            </SimpleShowLayout>
        </Show>
    );}