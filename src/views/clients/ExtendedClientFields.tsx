import {
    BooleanInput,
    DateInput,
    FormDataConsumer,
    NumberInput,
    required,
    SelectInput,
    TextInput,
    useRecordContext,
    useUnique
} from "react-admin";
import {Fragment, useState} from "react";
import {Box, Grid} from '@mui/material';
import {validatePhoneNumber} from "../../helpers/phoneNumberValidation.ts";
import {isExecutiveCoachingFlavored, isSchoolStandardLinked} from "../../businessLogic.ts";
import {getLocalStorage} from "@mahaswami/vc-frontend";
import {ClientTypes, genderChoices} from "./../../helpers/constants.ts";
import {countryChoices} from "../../helpers/AllCountries.ts";
import {getDOBDateRange} from "../../backend/students.ts";
import {parentEmailValidation, studentEmailValidation} from "../../backend/clients.ts";
import {StudentStatusSelect} from "../students.tsx";
import {validateZipCode} from "../../utils.ts";
import {StandardsReferenceInput} from "../standards.tsx";

export const ExtendedClientFields = ({ clientType, isEditView }) => {

    const parentAndStudentSameEmailValidation = (value, allValues) => {
        if(!value) return undefined;
        if (value?.toLowerCase() === allValues["email"]?.toLowerCase()) {
            return 'The parent email and student email must not be the same.';
        }
        return undefined;
    };

    const record = useRecordContext();
    const unique = useUnique();
    const initialCountry = record ? record?.country : getLocalStorage('country');
    const [selectedCountry, setSelectedCountry] = useState(initialCountry);
    const {maxDOBDateStr, minDOBDateStr} = getDOBDateRange();
    return (
        <Box width='100%' display="grid" gap="1rem" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}>
            {clientType === ClientTypes.INDIVIDUAL && (
                <Fragment>
                    <FormDataConsumer<{ date_of_birth: Date, is_integrated_parental_engagement: Boolean }> >
                        {({formData}) => {
                            const dateOfBirth = formData?.student?.date_of_birth;
                            const isIntegratedParentalEngagement = Boolean(formData?.student?.is_integrated_parental_engagement);
                            const date = new Date(dateOfBirth);
                            const today = new Date();
                            const age = today.getFullYear() - date.getFullYear();
                            const isEdit = formData?.id
                            const isParentEdit = formData?.student?.parent_user_id
                            const parentUser = formData.student?.parent_user;
                            const parentDataIsPresent = parentUser?.first_name || parentUser?.last_name || parentUser?.email;
                            const isParentRequired = age <= 13 || isIntegratedParentalEngagement || parentDataIsPresent;
                            return (
                                <Fragment>
                                    {!isExecutiveCoachingFlavored() &&
                                        <Fragment>
                                                <TextInput
                                                    source="student.parent_user.first_name"
                                                    label="Parent First Name"
                                                    required={isParentRequired}
                                                />
                                                <TextInput
                                                    source="student.parent_user.last_name"
                                                    label="Parent Last Name"
                                                    required={isParentRequired}
                                                />
                                        </Fragment>}
                                        <TextInput source="email" type='email' validate={[required(), !isEdit && studentEmailValidation]} readOnly={isEdit}/>
                                    {!isExecutiveCoachingFlavored() && <Grid item xs={12} md={6}>
                                        <TextInput
                                            source="student.parent_user.email" readOnly={isParentEdit}
                                            type="email"
                                            label="Parent Email"
                                            required={isParentRequired}
                                            validate={[parentAndStudentSameEmailValidation, parentEmailValidation]}
                                        />
                                    </Grid>}
                                </Fragment>
                            );
                        }}
                    </FormDataConsumer>
                    {isExecutiveCoachingFlavored() ?
                        isEditView && <Grid item md={3}>
                            <StudentStatusSelect user={record?.student?.user} type={clientType}/>
                        </Grid>
                        :
                        <Grid item md={6} sx={{display: "flex", justifyContent: "space-between"}}>
                            <Grid item md={7} sx={{alignItems: "center", display: "flex"}}>
                                <BooleanInput label="Integrated Parental Engagement"
                                              source="student.is_integrated_parental_engagement"/>
                            </Grid>
                            <Grid item md={5}>
                                {isEditView && <StudentStatusSelect user={record?.student?.user} type={clientType}/>}
                            </Grid>
                        </Grid>}
                    {!isExecutiveCoachingFlavored() &&
                        <Grid item md={3}>
                            <DateInput
                                source="student.date_of_birth"
                                label="Date Of Birth"
                                slotProps={{htmlInput: {min: minDOBDateStr, max: maxDOBDateStr}}}
                            />
                        </Grid>}
                    <Grid item md={isExecutiveCoachingFlavored() && !isEditView ? 6 : 3}>
                        <SelectInput
                            source="student.gender"
                            label="Gender"
                            choices={genderChoices}
                        />
                    </Grid>
                    <FormDataConsumer>
                        {({ formData, ...rest }) => {
                            return (
                                <Grid item md={3}>
                                    <SelectInput label="Country" source={"country"} choices={countryChoices} required={formData?.student?.phone_number || formData?.student?.emergency_contact} onChange={(e) => { setSelectedCountry(e.target.value);}} defaultValue={selectedCountry}/>
                                </Grid>
                            );
                        }}
                    </FormDataConsumer>
                        <TextInput
                            source="student.emergency_contact"
                            label="Emergency Contact"
                            validate={validatePhoneNumber(selectedCountry)}
                        />
                        <TextInput
                            source="student.phone_number"
                            label="Phone Number"
                            validate={validatePhoneNumber(selectedCountry)}
                        />
                    {!isExecutiveCoachingFlavored() &&
                        <TextInput source="student.grade" label="Grade"/>
                    }
                    {!isExecutiveCoachingFlavored() &&
                        <TextInput source="student.method_of_going_home" label="Method Of Going Home"/>
                    }
                </Fragment>
            )}
            {clientType === ClientTypes.BUSINESS && (
                <Fragment>
                    <TextInput source="email" type='email' validate={[required(), unique()]} readOnly={isEditView}/>
                    <TextInput source="primary_contact_name" label="Business Contact Name" required/>
                    <FormDataConsumer>
                        {({ formData, ...rest }) => {
                            return <SelectInput label="Country" source={"country"} choices={countryChoices}
                                                 required={formData.primary_contact_number}
                                                 onChange={(country) => { setSelectedCountry(country.target.value);}}
                                                 defaultValue={selectedCountry}
                            />
                        }}
                    </FormDataConsumer>
                    <TextInput source="primary_contact_number" label="Business Contact Number" validate={validatePhoneNumber(selectedCountry)} />
                    <TextInput source="address_line" label="Address Line 1" />
                    <TextInput source="area" label="Address Line 2" />
                    <TextInput source="city" label="City" />
                    <TextInput source="state" label="State" />
                    <NumberInput source="zipcode" label="Zip Code" validate={(value) => validateZipCode(value , selectedCountry )} />
                    {isSchoolStandardLinked() &&
                        <StandardsReferenceInput source={'standard_id'} queryOptions={{meta: {scopingEscapeHatch: true}}} />
                    }
                </Fragment>
            )}
        </Box>
    );
};
