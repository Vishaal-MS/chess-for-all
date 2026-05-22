import {
    DateField, List, ReferenceManyField, SimpleList,
    TextInput, SelectInput, SelectField,
    useRecordContext, FormDataConsumer, BooleanInput, Edit, Create
} from "react-admin";
import {Box, Grid, Typography} from "@mui/material";
import { isDivisionAdmin, isExecutiveCoachingFlavored, isRegularSchoolFlavored } from "../../backend/common_logics";
import {DataTable, editDefaults, formDefaults, listDefaults} from "@mahaswami/vc-frontend";
import {ListTitle} from "../../components/Title.tsx";
import {UserRoles, getRoleChoices} from "../../helpers/constants.ts";
import {Empty} from "../common/empty";
import {genderChoices} from "../../helpers/constants.ts";
import {validatePhoneNumber} from "../../helpers/phoneNumberValidation.ts";
import { getLocalStorage, SimpleForm } from "@mahaswami/vc-frontend";
import {countryChoices} from "../../helpers/AllCountries.ts";
import {useState} from "react";
import {coachEmailValidation} from "../../backend/coaches.ts";
import {CurriculumsReferenceField} from "../curriculums.tsx";
import {ClientsReferenceField} from "../clients.tsx";
import {TeachingModesReferenceField} from "../teaching_modes.tsx";

export const CoachList = (props: any) => {

    return(
        <List { ...listDefaults(props)}>
            <DataTable bulkActionButtons={false}>
                <DataTable.Col source="user.first_name" label="First Name"/>
                <DataTable.Col source="user.last_name" label="Last Name"/>
                <DataTable.Col source="user.email" label="Email" />
                <DataTable.Col source="user.role" label="Role" field={(props) =>
                    <SelectField {...props} choices={getRoleChoices()} />} />
                <DataTable.Col source="contact_number" label="Contact Number"/>
            </DataTable>
        </List>
    )
}

export const CoachClassList = ({status}) => {
    return  (
        <ReferenceManyField reference="classes" target="coach_id" filter={{status: status}}>
            <SimpleList primaryText={
                <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                    <CurriculumsReferenceField source={"curriculum_id"} sx={{ fontSize: '16px', paddingRight:2}} />
                    <Typography variant="h6" sx={{ fontSize: '16px', paddingRight:2}}>For Client:
                        <ClientsReferenceField source={"client_id"} sx={{ marginLeft:1, fontSize: '16px', paddingRight:2}}/>
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '16px', paddingRight:2}}>Start Date:
                    <DateField source="start_date" label="Start Date" sx={{marginLeft:1, paddingRight:10}} />
                    </Typography>
                </Box>}
            />
        </ReferenceManyField>
    );
}

export const CoachCreate = (props: any) => {
    const [selectedCountry, setSelectedCountry] = useState(getLocalStorage('country'));
    return(
        <Create title={<ListTitle resourceName={`Create ${isRegularSchoolFlavored() ? 'Teacher & Admin' : 'Coach'}`}/>}>
            <SimpleForm {...formDefaults(props)}>
                <Grid container spacing={1}>
                    <Grid item md={6} xs={12}>
                        <TextInput source="first_name" label="First Name" required />
                    </Grid>
                    <Grid item md={6} xs={12}>
                        <TextInput source="last_name" label="Last Name" required />
                    </Grid>
                    <Grid item md={6} xs={12}>
                        <TextInput source="email" type='email' label="Email" required validate={coachEmailValidation}/>
                    </Grid>
                    <Grid item md={6} xs={12} sx={{display: isDivisionAdmin() ? "none" : "block"}}>
                        <SelectInput source="role" label="Role" required choices={getRoleChoices()}
                                     defaultValue={isDivisionAdmin() ? UserRoles.DIVISION_COACH : ""}/>
                    </Grid>
                    <Grid item md={6} xs={12}>
                        <SelectInput source={"gender"} label={"Gender"} choices={genderChoices}/>
                    </Grid>
                    <Grid item md={isDivisionAdmin() ? 6 : 3} xs={12}>
                        <FormDataConsumer>
                            {({ formData, ...rest }) => {
                                return (
                                    <SelectInput label="Country" source={"country"} choices={countryChoices} required={formData.contact_number} onChange={(country) => { setSelectedCountry(country.target.value);}} defaultValue={selectedCountry}/>
                                );
                            }}
                        </FormDataConsumer>
                    </Grid>
                    <Grid item md={isDivisionAdmin() ? 6 : 3} xs={12}>
                        <TextInput source="contact_number" label="Phone Number" validate={validatePhoneNumber(selectedCountry)}/>
                    </Grid>
                    <Grid item md={6} xs={12}>
                        <TextInput source="years_of_experience" label="Experience"/>
                    </Grid>
                    <Grid item md={6} xs={12}>
                        <TextInput source="special_skills" label="Special Skills" />
                    </Grid>
                </Grid>
            </SimpleForm>
        </Create>
    )
}

export const CoachEdit = (props: any) => {
    const coachId = Number(props?.id);
    return (
        <Edit {...editDefaults(props)}>
            <SimpleForm>
                <CoachEditForm coachId={coachId}/>
            </SimpleForm>
      </Edit>
    );
};

export const CoachEditForm = ({coachId}) => {

    const record = useRecordContext();
    const initialCountry = record ? record?.country : getLocalStorage('country');
    const [selectedCountry, setSelectedCountry] = useState(initialCountry);
    const emptyText = `No classes for the ${isRegularSchoolFlavored() ? 'teacher' : 'coach'}`;
    const isStandardLinkedOrExecutive = isRegularSchoolFlavored() || isExecutiveCoachingFlavored();

    return (
        <>
            <Grid container spacing={1}>
                <Grid item sm={6} xs={12}>
                    <TextInput source="user.first_name" label="First Name" required/>
                </Grid>
                <Grid item sm={6} xs={12}>
                    <TextInput source="user.last_name" label="Last Name" required/>
                </Grid>
                <Grid item sm={6} xs={12}>
                    <TextInput source="user.email" label={"Email"} required readOnly/>
                </Grid>
                <Grid item sm={3} xs={12} sx={{display: isDivisionAdmin() ? "none" : "block"}}>
                    <SelectInput source="user.role" label={"Role"} required choices={getRoleChoices()}/>
                </Grid>
                <Grid item sm={2} xs={12} sx={{display: "flex", justifyContent: "start", alignItems: "center", ml: "1rem"}}>
                    <BooleanInput label="Active?" source="user.is_active" />
                </Grid>
                <Grid item sm={6} xs={12}>
                    <SelectInput source={"gender"} label={"Gender"} choices={genderChoices}/>
                </Grid>
                <Grid item sm={3} xs={12}>
                    <SelectInput label="Country" source={"country"} choices={countryChoices} onChange={(country) => {
                        setSelectedCountry(country.target.value);
                    }} defaultValue={selectedCountry}/>
                </Grid>
                <Grid item sm={3} xs={12}>
                    <FormDataConsumer>
                        {({formData, ...rest}) => {
                            return (
                                <TextInput source="contact_number" label="Phone Number" required={formData.country}
                                           validate={validatePhoneNumber(selectedCountry)}/>
                            );
                        }}
                    </FormDataConsumer>
                </Grid>
                <Grid item sm={6} xs={12}>
                    <TextInput source="years_of_experience" label="Experience"/>
                </Grid>
                <Grid item sm={6} xs={12}>
                    <TextInput source="special_skills" label="Special Skills"/>
                </Grid>
            </Grid>
            <Box sx={{mt: 4, width: '100%'}}>
                <Typography sx={{ml: 2}}>Classes</Typography>
                <List title={false} empty={<Empty showIcon={false} emptyText={emptyText}/>}
                      resource="classes" actions={false} exporter={false} pagination={false}
                      filter={{coach_id: coachId}} >
                    <DataTable rowClick={false}>
                        <DataTable.Col source="name"/>
                        {!isStandardLinkedOrExecutive &&
                            <TeachingModesReferenceField source="teaching_mode_id" label="Coaching Mode"
                                        link={false} queryOptions={{meta: {scopingEscapeHatch: true}}}
                        />}
                        <DataTable.Col source="start_date" label="Start Date" field={DateField} />
                        <DataTable.Col source="end_date" label="End Date" field={DateField} />
                        <DataTable.Col source="status" sx={{textTransform: 'capitalize'}}/>
                    </DataTable>
                </List>
            </Box>
        </>
   );
};