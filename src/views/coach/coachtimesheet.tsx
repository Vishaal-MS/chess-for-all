import {
    AutocompleteInput, BooleanField, BooleanInput, Button, Create, Edit, List, Show, DateField, DateInput, DeleteButton,
    downloadCSV, ExportButton, Loading, NumberField, NumberInput, useListContext, useRefresh, useUnselectAll,
    required, SaveButton, SelectInput, SimpleForm, SimpleShowLayout, TextField, TextInput, Toolbar, TopToolbar,
} from 'react-admin';
import {
    getCurrentUserCoachId, isAcademy, isDivisionAdmin, isDivisionCoach, isOrgAdmin, isOrgCoach,
} from "../../businessLogic";
import {useEffect, useState} from "react";
import {DataTable, PER_PAGE, remoteLog, SensibleDefaultPagination} from "@mahaswami/vc-frontend";
import FilterMultiChoiceInput from "../common/FilterMultiChoiceInput.tsx";
import {useNavigate} from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import {Divider, Grid, Typography} from "@mui/material";
import jsonExport from 'jsonexport/dist';
import {ListTitle, RecordTitle} from "../../components/Title.tsx";
import {formatDateWithShortYear} from "../../utils.ts";
import ArchiveIcon from '@mui/icons-material/Archive';
import {ClassesReferenceField, ClassesReferenceInput} from "../classes.tsx";
import {CoachesReferenceField, CoachesReferenceInput} from "../coaches.tsx";

export const TimeSheetList = () => {
    const dataProvider = window.swanAppFunctions.dataProvider;
    const [coachFilter,setCoachFilter] = useState({});
    const [coachChoices, setCoachChoices] = useState([]);
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const setFilters = async () => {
            const coachId = await getCurrentUserCoachId(dataProvider);
            coachId ? setCoachFilter( { coach_id: coachId}):setCoachFilter({});
        }
        const fetchCoaches = async () => {
            try {
                const {data: coaches} = await dataProvider.getList('coaches', {
                    meta: {prefetch: ['users']}
                })
                const choices = coaches.map(coach => ({ id: coach.id, name: coach.user?.fullName }))
                setCoachChoices(choices);
                const coachesMap = Object.fromEntries(coaches.map(coach => [coach.id, coach.user?.fullName]))
                setCoaches(coachesMap);
                setLoading(false)
            } catch (error) {
                remoteLog("Error on TimeSheetList fetchCoaches method: ", error);
            }
        };
        fetchCoaches();
        setFilters();
    },[]);

    if (loading) {
        return <Loading/>
    }
    const Filters = [
        isAcademyOrgAdminOrDivisionAdmin() ? (
            <FilterMultiChoiceInput source="coach_id" label="Coach" choices={coachChoices} alwaysOn/>
        ) : '',
         <ClassesReferenceField source="class_id" alwaysOn>
            <SelectInput optionText="name" />
        </ClassesReferenceField>,
        <SelectInput
            source="is_archived"
            label="Archived"
            choices={[
                { id: true, name: 'Yes' },
                { id: false, name: 'No' },
            ]}
            alwaysOn
        />,
    ].filter(Boolean);


    const CreateToolBar = () => {
        const navigate = useNavigate();
        const exporter = async (timesheets) => {
            try {
                const classIds = [...new Set(timesheets.map((timesheet) => timesheet.class_id))];
                const { data: classData } = await dataProvider.getMany("classes", { ids: classIds });
                const classMap = Object.fromEntries(classData.map(cls => [cls.id, cls.name]));
                const postsForExport = timesheets.map(timesheet => {
                    const { class_id, coach_id, timesheet_date, hours, description } = timesheet;
                    return {
                        Date : formatDateWithShortYear(timesheet_date),
                        Coach: coaches[coach_id],
                        Class: classMap[class_id],
                        Hours: hours,
                        Note: description,
                    };
                });

                jsonExport(postsForExport, {
                    headers: ['Date', 'Coach', 'Class', 'Hours', 'Note']
                }, (err, csv) => {
                    downloadCSV(csv, 'timesheets');
                });
            } catch (error) {
                remoteLog("Error on TimeSheetList exporter method: ", error);
            }
        };
        return (
            <TopToolbar style={{"minHeight": 40}}>
                <Button color="primary" onClick={() => navigate("/timesheets/create")}
                        startIcon={<AddIcon/>}
                        label={"create timesheet"}/>
                {isAcademyOrgAdminOrDivisionAdmin() && <ExportButton exporter={exporter}/>}
            </TopToolbar>
        )
    }

    return (
      <List disableSyncWithLocation title={<ListTitle resourceName="Timesheets List"/>} filter={coachFilter} actions={<CreateToolBar/>}
                  filters={Filters} pagination={<SensibleDefaultPagination />} perPage={PER_PAGE} filterDefaultValues={{is_archived: false}} >
        <DataTable bulkActionButtons={<ArchiveButton/>}>
            <ClassesReferenceField source="class_id" reference="classes" link={false} />
            {isAcademyOrgAdminOrDivisionAdmin() &&
               <CoachesReferenceField source="coach_id" link={false}>
                   <TextField source={"user.fullName"} />
               </CoachesReferenceField>
            }
            <DataTable.Col label={"Date"} source={"timesheet_date"} field={DateField} />
            <DataTable.Col label={"Description"} source={"description"}/>
            <DataTable.Col label={"Hours"} source={"hours"}/>
            <DataTable.Col label={false} field={() => <DeleteButton />} />
        </DataTable>
      </List>
    )
}


export const TimeSheetCreate = () => {
    return (
        <Create redirect="list">
            <CoachTimeSheetInputs view={"create"}/>
        </Create>
    );
};

export const TimeSheetEdit = () => {
    return (
        <Edit title={<RecordTitle resourceName="Timesheet Edit"/>}>
            <CoachTimeSheetInputs view={"edit"}/>
        </Edit>
    );
};


export const TimesheetShow = () => (
    <Show title={<RecordTitle resourceName="Timesheet Show"/>}>
        <SimpleShowLayout>
            <ClassesReferenceField source="class_id" link={false} />
            {isAcademyOrgAdminOrDivisionAdmin() &&
                <CoachesReferenceField source="coach_id" link={false}>
                    <TextField source={"user.fullName"} />
                </CoachesReferenceField>
            }
            <DataTable.Col source="timesheet_date" label="Date" field={DateField} />
            <DataTable.Col source="description" label="Description"/>
            <DataTable.Col source="hours" label="Hours" field={NumberField} />
            <DataTable.Col label="Created At"
                           render={record => new Date(record.created_date).toLocaleString()} />
            <DataTable.Col source={"is_archived"} field={BooleanField} />
        </SimpleShowLayout>
    </Show>
);

export const ArchiveButton = () => {
    const {selectedIds} = useListContext();
    const unselectAll = useUnselectAll("timesheets");
    const refresh = useRefresh();
    const dataProvider = window.swanAppFunctions.dataProvider;
    const handleArchive = async() =>  {
        try {
            await Promise.all(
                selectedIds.map((selectedId) =>
                    dataProvider.update("timesheets", { id: selectedId,  data: {is_archived: true} })
                )
            );
            unselectAll();
            refresh();
        } catch (error) {
            remoteLog("Error on TimeSheetList ArchiveButton: ", error);
        }
    }
    return(<Button label="Archive" startIcon={<ArchiveIcon/>} onClick={handleArchive} />);
}

export const validateDate = (value) => {
    const inputDate = new Date(value);
    if (isAcademyOrgAdminOrDivisionAdmin()) {
        return inputDate > new Date()
            ? "Date should not be future date"
            : undefined;
    }
    if (isAcademyOrgCoachOrDivisionCoach()) {
        const formatDate = (daysAgo) => {
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            return date.toISOString().split('T')[0];
        };

        const selectedDate = inputDate.toISOString().split('T')[0];
        const validDates = [0, 1, 2].map(formatDate);
        return validDates.includes(selectedDate)
            ? undefined
            : 'The date must be within 3 days  i.e Today, Yesterday, and day before Yesterday';
    }
}

export const isAcademyOrgAdminOrDivisionAdmin = () => {
    return isAcademy() && (isOrgAdmin() || isDivisionAdmin());
};

export const isAcademyOrgCoachOrDivisionCoach = () => {
    return isAcademy() && (isOrgCoach() || isDivisionCoach());
};

export const CoachTimeSheetInputs = ({view}) => {
    const TimeSheetToolbar = () => (
        <Toolbar>
            <SaveButton/>
        </Toolbar>
    )
    const getTitle = () => {
       return view === 'edit' ? "Timesheet Details" : "Create Timesheet";
    };
    return (
        <SimpleForm toolbar={<TimeSheetToolbar/>}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={6}>
                    <Typography variant="h6" gutterBottom>
                        {getTitle()}
                    </Typography>
                </Grid>
                {view === "edit" && (<Grid item xs={6} container justifyContent="flex-end">
                    <BooleanInput
                        label="Is Archived"
                        source="is_archived"
                        sx={{marginInlineStart: 'auto'}}
                    />
                </Grid>)}
                <Grid item xs={12}>
                    <Divider/>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <ClassesReferenceInput source="class_id" label="Class">
                        <AutocompleteInput optionText="name" validate={required()}/>
                    </ClassesReferenceInput>
                </Grid>
                {isAcademyOrgAdminOrDivisionAdmin() &&
                    <Grid item xs={12} sm={6}>
                        <CoachesReferenceInput source="coach_id" link={false} label="Coach">
                            <AutocompleteInput optionText="user.fullName" validate={required()}/>
                        </CoachesReferenceInput>
                    </Grid>
                }
                <Grid item xs={12} sm={6}>
                    <DateInput label="Date" source="timesheet_date"
                               defaultValue={view === "create" ? new Date() : undefined}
                               validate={[required(), validateDate]}/>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <NumberInput label="Hours"
                                 source="hours"
                                 validate={required()}
                                 min={1}
                                 max={24}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextInput label="Description" source="description" multiline rows={3} fullWidth/>
                </Grid>
            </Grid>
        </SimpleForm>
    )
}