import {
    Button,
    Create,
    Datagrid,
    DateField, DateInput, DeleteButton, Edit, EditButton, FunctionField,
    List,
    ReferenceField, SaveButton,
    Show,
    SimpleForm, SimpleShowLayout,
    TextField,
    TextInput, Toolbar, useNotify
} from "react-admin";
import {closeDialog, openDialog} from "@mahaswami/vc-frontend";
import React from "react";
import AddIcon from "@mui/icons-material/Add";
import {Box, IconButton, Typography, Tooltip} from "@mui/material";
import {isCoach, isRegularSchoolFlavored} from "../../businessLogic.ts";
import {formatDateWithShortYear} from "../../utils.ts";

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
            <Datagrid  sx={{ '& .RaDatagrid-rowCell:last-child': { padding: 0 } }} bulkActionButtons={false}
                       rowClick={(_id, _resource, record) => {
                           isCoach() && onEditParentNoteClick(record)
                           return false;
                       }}>
                {!isCoach() &&
                    <FunctionField label={isRegularSchoolFlavored() ? "Teacher" : "Coach"} render={() => {
                    return (<Box sx={{maxWidth: 120}}>
                            <ReferenceField reference={"coaches"} source={"coach_id"}>
                                <ReferenceField reference={"users"} source={"user_id"} link={false}>
                                    <TextField style={{fontSize: '0.8rem'}} source={"fullName"}/>
                                </ReferenceField>
                            </ReferenceField> {'- '}
                            <ReferenceField source={"class_id"} reference={"classes"} link={false}>
                                <TextField style={{fontSize: '0.8rem'}} sx={{color: 'gray'}} source={"name"}/>
                            </ReferenceField>
                        </Box>
                    )
                }}/>}
                <FunctionField label={"Date"} render={(recode) => <Typography style={{fontSize: '0.8rem'}}>{formatDateWithShortYear(recode.created_date)}</Typography>}/>
                <FunctionField label={"Note"} render={(record) => {
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
                <FunctionField
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
            </Datagrid>
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
                <ReferenceField reference={"users"} source={"coach_id"}>
                    <TextField source={"fullName"}/>
                </ReferenceField>
                <DateField source={"created_date"}/>
                <TextField source={"note"}/>
                <ReferenceField source={"parent_user_id"} reference={"users"}>
                    <TextField source={"fullName"}/>
                </ReferenceField>
                <ReferenceField source={"class_id"} reference={"classes"}>
                    <TextField source={"name"}/>
                </ReferenceField>
            </SimpleShowLayout>
        </Show>
    );
}
export default ParentNoteList;