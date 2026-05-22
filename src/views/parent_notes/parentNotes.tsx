import {
    Create, DateField, DeleteButton, Edit, List, SaveButton, Show,
    SimpleShowLayout, TextField, TextInput, Toolbar, useNotify
} from "react-admin";
import {closeDialog, DataTable, openDialog, SimpleForm} from "@mahaswami/vc-frontend";
import {Box, Typography, Tooltip} from "@mui/material";
import {isCoach, isRegularSchoolFlavored} from "../../backend/common_logics.ts";
import {formatDateWithShortYear} from "../../utils.ts";
import {UsersReferenceField} from "../users.tsx";
import {ClassesReferenceField} from "../classes.tsx";
import {CoachesReferenceField} from "../coaches.tsx";

const ParentNoteCustomToolbar = () => (
    <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <SaveButton />
    </Toolbar>
);

const ParentNoteList = ({classId, coachId, parentId, studentId}) => {
    const filter = {class_id: classId, ...(parentId ? {parent_user_id: parentId} : {student_id: studentId})};

    const onAddParentNoteClick = () => {
        openDialog(<ParentNoteCreate
            defaultValues={{
                parent_user_id: parentId,
                class_id: classId,
                coach_id: coachId,
                student_id: studentId,
                created_date: new Date()
            }}/>
        );
    };

    const onEditParentNoteClick = (record: any) => {
        if (!record) return;

        openDialog(<ParentNoteEdit
            id={record.id}
            defaultValues={{
                parent_user_id: parentId,
                class_id: classId,
                coach_id: coachId
            }}/>
        );
    };
    const CustomEmpty = () => (
        <div style={{ padding: 20, textAlign: "center" }}>
            <Typography fontSize={"1rem"} variant="h6">No Parent notes yet</Typography>
        </div>
    );

    return (
        <List actions={false} empty={<CustomEmpty/>}
              filter={filter} sort={{ field: 'created_date', order: 'DESC' }} title=" " resource={"parent_notes"} pagination={false} exporter={false}>
            <DataTable bulkActionButtons={false}
                       rowClick={(_id, _resource, record) => {
                           isCoach() && onEditParentNoteClick(record)
                           return false;
                       }}>
                {!isCoach() &&
                    <DataTable.Col label={isRegularSchoolFlavored() ? "Teacher" : "Coach"} render={() => {
                    return (<Box sx={{maxWidth: 120}}>
                            <CoachesReferenceField source={"coach_id"}>
                                <TextField style={{fontSize: '0.8rem'}} source={"user.fullName"}/>
                            </CoachesReferenceField> {'- '}
                            <ClassesReferenceField source={"class_id"} link={false}>
                                <TextField style={{fontSize: '0.8rem'}} sx={{color: 'gray'}} source={"name"}/>
                            </ClassesReferenceField>
                        </Box>
                    )
                }}/>}
                <DataTable.Col label={"Date"} render={(recode) =>
                    <Typography style={{fontSize: '0.8rem'}}>{formatDateWithShortYear(recode.created_date)}</Typography>}/>
                <DataTable.Col label={"Note"} render={(record) => {
                    return (
                        <Tooltip title={record.note || "No note available"}>
                            <Typography
                            sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                                maxWidth: 450,
                                fontSize: '0.8rem',
                            }}
                            >{record.note}</Typography>
                        </Tooltip>
                    )
                }}/>
                {isCoach() &&
                <DataTable.Col
                    label=""
                    className={"delete-button"}
                    render={(record) => (
                        <Box sx={{display: 'flex', justifyContent: 'flex-end', padding: 0, margin: 0, minWidth: 'auto',}}>
                            <DeleteButton
                                record={record}
                                redirect={false}
                                label=""
                                sx={{minWidth: 0, padding: '2px', margin: 0}}
                            />
                        </Box>
                    )}
                />}
            </DataTable>
        </List>
    );
}

export const ParentNoteCreate = (props: any) => {
    const notify = useNotify();
    const onSuccess = () => {
        closeDialog();
        notify(`Parent note added successfully`, {type: 'success'});
    }
    return (
        <Create
            redirect={false}
            resource="parent_notes"
            mutationOptions={{
                onSuccess: () => onSuccess()
            }}>
            <ParentNotesForm {...props}/>
        </Create>
    );
}

export const ParentNoteEdit = (props: any) => {
    const notify = useNotify();
    const onSuccess = () => {
        closeDialog();
        notify(`Parent note updated successfully`, {type: 'success'});
    }
    return (
        <Edit id={props.id}
              redirect={false}
              mutationMode="pessimistic"
              actions={<></>}
              resource={"parent_notes"}
              mutationOptions={{
                  onSuccess: () => onSuccess()
              }}
        >
            <ParentNotesForm {...props}/>
        </Edit>
    );
}


export const ParentNotesForm = (props: any) => {
    return (
        <SimpleForm {...props} toolbar={<ParentNoteCustomToolbar />} >
            <TextInput multiline minRows={3} source={"note"}/>
        </SimpleForm>
    )
}

export const ParentNoteShow = (params) => {
    return (
        <Show resource={"parent_notes"} {...params} >
            <SimpleShowLayout>
                <UsersReferenceField source={"coach_id"} />
                <DateField source={"created_date"}/>
                <TextField source={"note"}/>
                <UsersReferenceField source={"parent_user_id"} />
                <ClassesReferenceField source={"class_id"} />
            </SimpleShowLayout>
        </Show>
    );
}
export default ParentNoteList;