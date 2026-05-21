import {useEffect, useState} from "react";
import {closeDialog} from "@mahaswami/vc-frontend";
import {Box, Typography} from "@mui/material";
import {BooleanInput, Edit, Loading, required, useNotify, useRecordContext, Toolbar, SaveButton} from "react-admin";
import {Create, SimpleForm, AutocompleteInput, TextInput, DateInput,SelectInput, SelectArrayInput} from 'react-admin';
import {getSimpleDate, parseTime} from "../../utils";
import timezones from 'google-timezones-json';
import { FormDataConsumer } from 'react-admin';
import {useFormContext} from "react-hook-form";
import {differenceInDays} from "date-fns";
import {validateStartDate} from "../../backend/classes.ts";
import {ScheduleTypesReferenceInput} from "../schedule_types.tsx";

const DAILY = 1;
const ONCE_A_WEEK = 2;
const MULTI_DAYS_IN_WEEK = 3;
const ONCE = 4;

export const ScheduleForm = ({ mode, calenderRef }: { mode?: string, calenderRef: any }) => {
    const recordContext = useRecordContext();
    const timezonesArray = Object.keys(timezones).map(key => {
        return {
            id: key,
            name: key
        };
    });
    const generateTimeOptions = () => {
        const times = [];
        const selectedTimezone = getValues("timezone");
        const startDate = getValues("start_datetime");
        const parsedDate = startDate ? new Date(startDate) : new Date();
        const baseDate = !isNaN(parsedDate.getTime()) ? parsedDate : new Date();

        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const date = new Date(baseDate);
                date.setHours(hour,minute, 0, 0)
                const isoString = date.toLocaleString('en-US', {
                    timeZone: selectedTimezone,
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                });
                const displayLabel = date.toLocaleTimeString('en-US', {
                    timeZone: selectedTimezone,
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                });
                times.push({ id: isoString, name: displayLabel });
            }
        }
        return times;
    };

    const {getValues, setValue, formState} = useFormContext();
    const values = getValues();
    const isRequired = formState.isDirty;
    if (calenderRef)
        calenderRef.current = formState.isDirty;
    if (typeof values.days === 'string') {
        setValue('days', values.days?.split(','))
    }

    const endDateValidation = (value: any) => {
        const { start_date } = getValues();
        const startDate = new Date(start_date);
        const endDate = new Date(value);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        const totalDays = differenceInDays(endDate, startDate);

        if (endDate < startDate) {
            return 'End date must be after start date.';
        } else if (totalDays > 180) {
            return 'Date range cannot exceed 6 months (180 days).';
        }
        return undefined;
    };

    const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;


    const scheduleTypeValidation = (value, allValues) => {
        const startDate = new Date(allValues.start_date);
        const endDate = new Date(allValues.end_date);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        const totaldays = differenceInDays(endDate, startDate);
        if (value === ONCE && totaldays > 0) {
            return "Multiple-day schedule is not compatible with 'Once' schedule type.";
        }
        if ((value === MULTI_DAYS_IN_WEEK || value === ONCE_A_WEEK || value === DAILY) && totaldays === 0) {
            return "Single-day is only compatible with 'Once' schedule type.";
        }
        return undefined
    }
    const now = new Date();
    const startDate = new Date(recordContext?.start_date);
    const minStartDate = mode === 'edit' ? (startDate > now ? now : startDate) : now;
    const startDateValidation = mode !== 'edit' ? [validateStartDate] : []
    return (
        <Box width={"100%"} >
            <Box sx={{flexDirection:"row",display:'flex', width: "100%"}}>
                <DateInput
                    slotProps={{htmlInput: {min: getSimpleDate(minStartDate)}}}
                    source="start_date" label="Start Date"
                    sx={{marginRight:2}} validate={isRequired ? [required(), ...startDateValidation] : undefined}
                />
                <DateInput
                    slotProps={{htmlInput: {min: getSimpleDate(new Date())}}}
                    source="end_date" label="End Date"
                    validate={[...(isRequired ? [required()] : []), endDateValidation]} />
            </Box>
            <Box sx={{flexDirection:"row",display:'flex', width: "100%"}}>
                <SelectInput source={"timezone"} choices={timezonesArray} sx={{marginRight:1, width: '50%'}} label={"Time Zone"} defaultValue={currentTimeZone} validate={isRequired ? required() : undefined}/>
                <Box sx={{flexDirection: 'row', display: 'flex', width: "50%"}}>
                    <SelectInput source={"start_datetime"}  label="Start Time" sx={{marginLeft:1, minWidth: 0}}
                                 choices={generateTimeOptions()} validate={isRequired ? required() : undefined}
                                 />
                    <SelectInput source={"end_datetime"}  label="End Time" sx={{marginLeft:1, minWidth: 0}} choices={generateTimeOptions()}
                             validate={isRequired ? required() : undefined}
                             />
                </Box>
            </Box>
            <Box sx={{flexDirection:"row",display:'flex', width: "100%"}}>
                <FormDataConsumer>
                    {({ formData, ...rest }) => {
                        const startDate = formData?.start_date ? new Date(formData.start_date) : null;
                        const endDate = formData?.end_date ? new Date(formData.end_date) : null;
                        const scheduleTypeId = formData?.schedule_type_id;

                        const totalDays = startDate && endDate && differenceInDays(endDate, startDate);
                        const isSameDate = totalDays === 0;
                        const isMultiDays = totalDays && totalDays > 0;

                        useEffect(() => {
                            if (isSameDate && !scheduleTypeId) {
                                setValue('schedule_type_id', ONCE); // ONCE = 4
                            } else if(isMultiDays && !scheduleTypeId) {
                                setValue('schedule_type_id', MULTI_DAYS_IN_WEEK); // MULTI_DAYS_IN_WEEK = 3
                            }
                            if(scheduleTypeId === ONCE || scheduleTypeId === DAILY) {
                                setValue('days', null); // Reset days
                            }
                        }, [isSameDate,isMultiDays, scheduleTypeId, setValue]);

                        const commonValidate = isRequired ? required() : undefined;
                        const daysChoices = [
                            { id: 'monday', name: 'Monday' },
                            { id: 'tuesday', name: 'Tuesday' },
                            { id: 'wednesday', name: 'Wednesday' },
                            { id: 'thursday', name: 'Thursday' },
                            { id: 'friday', name: 'Friday' },
                            { id: 'saturday', name: 'Saturday' },
                            { id: 'sunday', name: 'Sunday' },
                        ];
                        return (
                            <>
                                <ScheduleTypesReferenceInput
                                    source="schedule_type_id"
                                    link={false}
                                    queryOptions={{ meta: { scopingEscapeHatch: true } }}
                                    {...rest}
                                >
                                    <AutocompleteInput optionText="name" label="Schedule Type" validate={isRequired ? [required(),scheduleTypeValidation] : undefined}/>
                                </ScheduleTypesReferenceInput>
                                {(scheduleTypeId && scheduleTypeId !== DAILY && scheduleTypeId !== ONCE) && ( // DAILY = 1, ONCE = 4
                                    scheduleTypeId === ONCE_A_WEEK ? ( // ONCE_A_WEEK = 2
                                        <SelectInput source="days" label="Schedule Days" choices={daysChoices}
                                                     validate={commonValidate} sx={{ marginLeft: 2 }} {...rest}/>
                                    ) : (
                                        <SelectArrayInput
                                            source="days"
                                            label="Schedule Days"
                                            choices={daysChoices}
                                            validate={commonValidate}
                                            sx={{ marginLeft: 2 }}
                                            {...rest}
                                        />)
                                )}
                            </>
                        );}}
                </FormDataConsumer>
            </Box>
            <Box sx={{flexDirection:"row",display:'flex', width: "100%"}}>
                <BooleanInput disabled={mode === 'edit' ? true : undefined} sx={{width: '100%'}} source={"is_google_calendar_enabled"} defaultValue={true} label={"Integrate Google Calendar"}/>
                <TextInput multiline rows={3} source="details" sx={{marginLeft:1, minWidth: 0}}/>
            </Box>
        </Box>
    )
}

export const ScheduleCreate = (props) => {
    const [eventDetails, setEventDetails] = useState({});
    const [isFormLoading, setIsFormLoading] = useState(false);
    const {classId} = props;
    const notify = useNotify();
    const CLIENT_ID = '638191528071-4nn9j7ee8hdacdjfbvm51hj9o8j1goni.apps.googleusercontent.com'; //TODO Move it to config

    const transformScheduleBeforeSave = async (data) => {
        data.days = data.days != null &&  Array.isArray(data.days) ? data.days.join(',') : data.days;
        return {...data, class_id: classId, time_of_start: parseTime(data.start_datetime), time_of_end: parseTime(data.end_datetime)};
    }

    const onSuccess = async () => {
        closeDialog();
    };
    const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

    return(
        <Box>
                <div className="App" style={{position: 'relative', opacity: isFormLoading ? 0.5 : 1, pointerEvents: isFormLoading ? 'none' : 'auto'}}>
                    {isFormLoading && <Loading
                        sx={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}
                        loadingPrimary='' loadingSecondary=''/>}
                        <Typography variant="h6">Add Schedule</Typography>
                        <Create resource={"class_schedules"}  mutationOptions={{onSuccess}} transform={transformScheduleBeforeSave}>
                        <SimpleForm sx={{py: '0.5rem'}}>
                            <ScheduleForm mode={"create"}/>
                        </SimpleForm>
                        </Create>
                </div>
        </Box>
    );
}

export const ScheduleEdit = ({id}: {id: number}) => {
    const scheduleUpdateTransform = (value) => {
        value.days = value.days != null && Array.isArray(value.days) ? value.days.join(',') : value.days;
        return {...value, time_of_start: parseTime(value.start_datetime), time_of_end: parseTime(value.end_datetime)};
    }
    return (
        <Box>
            <Typography variant="h6">Edit Schedule</Typography>
            <Edit transform={scheduleUpdateTransform} mutationMode="optimistic" resource={"class_schedules"} id={id} redirect={false} mutationOptions={{onSuccess:()=> closeDialog()}}>
                <SimpleForm sx={{py: '0.5rem'}} toolbar={<Toolbar><SaveButton /></Toolbar>}>
                    <ScheduleForm mode={"edit"}/>
                </SimpleForm>
            </Edit>
        </Box>
    )
}