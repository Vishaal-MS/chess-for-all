import {Grid} from "@mui/material";
import {
    AutocompleteInput,
    BooleanInput,
    DateInput,
    FormDataConsumer,
    ReferenceInput,
    required,
    SelectInput,
    TextInput,
    useRecordContext
} from "react-admin";
import {countryChoices} from "../../helpers/AllCountries.ts";
import {parentEmailValidation, studentEmailValidation} from "../../backend/clients.ts";
import {ClientTypes, genderChoices} from "../../helpers/constants.ts";
import {useState} from "react";
import {validatePhoneNumber} from "../../helpers/phoneNumberValidation.ts";
import {getLocalStorage} from "@mahaswami/vc-frontend";
import {getDOBDateRange} from "../../backend/students.ts";
import {isRegularSchoolFlavored} from "../../businessLogic.ts";
import {StudentStatusSelect} from "./../students.tsx";


export const ExtendedStudentFields = ({mode, standardId}) => {
    const regularSchoolFlavor = isRegularSchoolFlavored();
    const editMode = mode === 'edit';
    const parentAndStudentSameEmailValidation = (value, allValues) => {
       if (!value) return undefined;
        if (value?.toLowerCase() === allValues['user'].email?.toLowerCase()) {
            return 'The parent email and student email must not be the same.';
        }
        return undefined;
    };

    const record = useRecordContext();
    const initialCountry = record ? record?.country : getLocalStorage('country');
    const [selectedCountry, setSelectedCountry] = useState(initialCountry);

    const {maxDOBDateStr, minDOBDateStr} = getDOBDateRange();
    return(
        <>
            <Grid container columnSpacing={1}>
                <Grid item xs={12} md={6}>
                    <TextInput source="user.first_name" label="First Name" validate={required()}/>
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextInput source="user.last_name" label="Last Name" validate={required()}/>
                </Grid>
                <FormDataConsumer<{ date_of_birth: Date}>>
                    {({ formData, ...rest }) => {
                        //If the Date of Birth is not empty and the age based on date of birth is less than 13 capture the parent name and phone number
                        const dateOfBirth = formData.date_of_birth;
                        const date = new Date(dateOfBirth);
                        const today = new Date();
                        const age = today.getFullYear() - date.getFullYear();
                        const isEdit = formData?.id
                        const isParentEdit = formData?.parent_user_id;
                        const parentUser = formData?.parent_user;
                        const parentDataIsPresent = parentUser?.first_name || parentUser?.last_name || parentUser?.email;
                        const isParentRequired = age <= 13 || formData.is_integrated_parental_engagement || parentDataIsPresent || regularSchoolFlavor || standardId;
                        //If the age is less than 13, show the parent name and phone number
                        return (
                            <>
                                <Grid item xs={12} md={6}>
                                    <TextInput
                                        source="parent_user.first_name"
                                        label="Parent First Name" 
                                        required={ isParentRequired}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextInput
                                        source="parent_user.last_name"
                                        label="Parent Last Name" 
                                        required={isParentRequired}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextInput source="user.email" label="Email" type='email' validate={[required(), !isEdit && studentEmailValidation]} readOnly={isEdit}/>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextInput
                                        source="parent_user.email" readOnly={isParentEdit}
                                        label="Parent Email"
                                        type="email"
                                        required={isParentRequired}
                                        validate={[parentEmailValidation, parentAndStudentSameEmailValidation]}
                                    />
                                </Grid>
                            </>
                        );
                    }}
                </FormDataConsumer>
                {regularSchoolFlavor ?
                    editMode && <Grid item md={3}>
                        <StudentStatusSelect user={record?.user} type={ClientTypes.BUSINESS}/>
                    </Grid> :
                    <Grid item md={6} sx={{display: 'flex'}}>
                        <Grid item md={8} sx={{display: 'flex', alignItems: "center"}}>
                            <BooleanInput sx={{'& .MuiFormControlLabel-label': {fontSize: '1rem'}}} label="Integrated Parental Engagement" source="is_integrated_parental_engagement"/>
                        </Grid>
                        <Grid item md={5}>
                            {editMode && <StudentStatusSelect user={record?.user} type={ClientTypes.BUSINESS}/>}
                        </Grid>
                    </Grid>
                }
                <Grid item md={regularSchoolFlavor && !editMode ? 6 : 3} xs={regularSchoolFlavor && 12}>
                    <DateInput source={"date_of_birth"} label="Date Of Birth" required
                               slotProps={{htmlInput: {min: minDOBDateStr, max: maxDOBDateStr}}}/>
                </Grid>
                <Grid item md={regularSchoolFlavor ? 6 : 3} xs={regularSchoolFlavor && 12}>
                    <SelectInput source={"gender"} label={"Gender"} choices={genderChoices} required/>
                </Grid>
                <FormDataConsumer>
                    {({ formData, ...rest }) => {
                      return (
                        <Grid item md={isRegularSchoolFlavored()? 6 : 3}>
                            <SelectInput label="Country" source={"country"} required={formData.emergency_contact || formData.phone_number} choices={countryChoices} onChange={(e) => { setSelectedCountry(e.target.value);}} defaultValue={selectedCountry}/>
                        </Grid>
                      );
                    }}
                </FormDataConsumer>
                <Grid item xs={12} md={isRegularSchoolFlavored()? 6 : 3}>
                    <TextInput source="emergency_contact" label="Emergency Contact" validate={validatePhoneNumber(selectedCountry)}/>
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextInput source="phone_number" label="Phone Number" validate={validatePhoneNumber(selectedCountry)}/>
                </Grid>
                <Grid item xs={12} md={6}>
                    {standardId ?
                        <ReferenceInput source={"standard_grade_id"} reference={"standard_grades"} filter={{standard_id: standardId}} link={false}>
                            <AutocompleteInput optionText={"name"} label="Grade" validate={[required()]}/>
                        </ReferenceInput> :
                        <TextInput source="grade" label="Grade"/>
                    }
                </Grid>
                {!isRegularSchoolFlavored() && <Grid item xs={12} md={6}>
                    <TextInput source="method_of_going_home" label="Method Of Going Home"/>
                </Grid>}
            </Grid>
        </>
    )
}
