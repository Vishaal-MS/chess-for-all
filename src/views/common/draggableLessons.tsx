import React, {useEffect, useMemo} from "react";
import {Box, Grid, Typography} from "@mui/material";
import {
    Datagrid,
    ReferenceField,
    TextField,
    FunctionField,
    DeleteButton,
    Loading,
    Button,
    Edit, SimpleForm, ReferenceInput, AutocompleteInput,
    FormDataConsumer, useRefresh, Toolbar, SaveButton,
    BooleanInput
} from "react-admin";
import { useListContext } from 'react-admin';
import { useState } from 'react';
import {useNotify } from 'react-admin';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {Empty} from "./empty.tsx";
import {closeDialog, openDialog, remoteLog} from "@mahaswami/vc-frontend";
import {
    getStandardId,
    isAllowPublishing,
    isAnySchoolFlavorActive,
    isRegularSchoolFlavored,
    isSchoolStandardLinked,
    isAllowedVoiceOver
} from "../../businessLogic.ts";
import EditIcon from '@mui/icons-material/Edit';

export const ClassLessonsSorter = ({recordId, disableRedirect, isSchoolClass}) => {
    const dataProvider = window.swanAppFunctions.dataProvider;
    const {data: listData, isPending,  resource } = useListContext();
    const notify = useNotify();
    const [orderedRows, setOrderedRows] = useState([]);
    const [droppableId, setDroppableId] = useState('hello');
    const [isLoadingLessons, setIsLoadingLessons] = useState(true);
    const refresh = useRefresh();

    useEffect(() => {
        const fetchData = async () => {
            if (listData && !isPending) {
                const data = listData.map((dt, index) => (
                    {...dt, __index__: index }));
                setOrderedRows(data);
                setDroppableId('droppable'); //Hack to avoid Strict Mode error in the library
                setIsLoadingLessons(false);
            }
        }
        fetchData();
    }, [listData, isPending]);

    const handleDragEnd = (result) => {
        // If the drag is canceled or there's no movement
        if (!result.destination) {
            return;
        }

        const { source, destination } = result;
        // Reorder the rows
        const reorderedRows = Array.from(orderedRows);
        const [removed] = reorderedRows.splice(source.index, 1);
        reorderedRows.splice(destination.index, 0, removed);

        //Update the index in the reordered rows
        reorderedRows.forEach((row, index) => {
            row.__index__ = index;
            row.position_number = index + 1; // update position after reorder
        });

        setOrderedRows(reorderedRows); // Update local state for reordering

        // Update the backend with the new order
        //Wait for all updates to finish and then notify
        try {
            const updatePromises = reorderedRows.map((row) => {
                return dataProvider.update(resource, {
                    id: row.id,
                    data: {...row}
                });
            });
            Promise.all(updatePromises)
                .then(() => {
                    notify('Lessons reordered successfully', { type: 'success' });
                }).catch((error) => {
                    console.error("Error updating order", error);
                    notify('Error updating order', { type: 'warning' });
                });
        } catch (error) {
            remoteLog("Error sending on ClassLessonsSorter handleDragEnd method: ", error);
        }
    };

    // Used to override the filterToQuery of autocomplet input for code filter
    // default: { q: searchText }
    const codeFilterQuery = (codeSearchText: string) => ({ "code_inc_any": codeSearchText })

    const handleEdit = (record) => {
        const EditSectionAndCognitiveSkill = () => {
            const onSuccess = () => {
                closeDialog();
                refresh();
            }
            let standardId = "";
            if (isRegularSchoolFlavored()) {
                standardId = getStandardId();
            }
            return(
                <Edit resource="curriculum_lessons" title=" " id={record.id} mutationMode="pessimistic" actions={false} redirect={false} mutationOptions={{onSuccess}} queryOptions={{meta: {prefetch: ['curriculum']}}}>
                    <SimpleForm toolbar={<Toolbar><SaveButton /> </Toolbar>}>
                      <FormDataConsumer>
                        {({formData}) => {
                            const section1Filter =  {id_neq_any: [formData?.mapping2_standard_section_id, formData?.mapping3_standard_section_id]}
                            const section2Filter =  {id_neq_any: [formData?.mapping1_standard_section_id, formData?.mapping3_standard_section_id]}
                            const section3Filter =  {id_neq_any: [formData?.mapping1_standard_section_id, formData?.mapping2_standard_section_id]}
                            const cognitiveSkill1Filter =  {id_neq_any: [formData?.mapping2_cognitive_skill_id, formData?.mapping3_cognitive_skill_id]}
                            const cognitiveSkill2Filter =  {id_neq_any: [formData?.mapping1_cognitive_skill_id, formData?.mapping3_cognitive_skill_id]}
                            const cognitiveSkill3Filter =  {id_neq_any: [formData?.mapping1_cognitive_skill_id, formData?.mapping2_cognitive_skill_id]}
                            standardId = standardId ? standardId : formData?.curriculum?.standard_id || "";

                            return (
                                <>
                                    <Box sx={{display: "flex", flexDirection: "row", flexWrap: "wrap"}} minWidth="70vw">
                                        <BooleanInput resource={resource} source="is_limit_to_show_single_section"
                                            label="Limit To Show Single Section?" />
                                        <BooleanInput resource={resource} source="is_game_sound_enabled"
                                                      label="Game Sound?" />
                                        <BooleanInput resource={resource} source="is_voice_over_enabled"
                                            label={"Voice Over?"} sx={{display: isAllowedVoiceOver() ? "block": "none"}}/>
                                    </Box>
                                    {isAllowPublishing() && <Box sx={{display: "flex", flexDirection: "row", flexWrap: "wrap"}}>
                                        <BooleanInput resource='curriculum_lessons' source='is_preview_enabled'
                                                      label='Marketplace Preview?'/>
                                    </Box> }
                                    {(isSchoolStandardLinked() || isRegularSchoolFlavored()) &&
                                    <>
                                    <Typography variant={'h5'}>Sections & Cognitive Skills</Typography>
                                    <ReferenceInput source={'mapping1_standard_section_id'} reference={'standard_sections'} filter={{standard_id: standardId, ...section1Filter}} perPage={10000}
                                                    queryOptions={{meta: {scopingEscapeHatch: true}}}>
                                        <AutocompleteInput label={"Section 1"} source={"code_inc_any"} filterToQuery={codeFilterQuery} limitTags={3}/>
                                    </ReferenceInput>
                                    <ReferenceInput source={'mapping2_standard_section_id'} reference={'standard_sections'} filter={{standard_id: standardId, ...section2Filter }} perPage={10000}
                                                    queryOptions={{meta: {scopingEscapeHatch: true}}}>
                                        <AutocompleteInput label={"Section 2"} source={"code_inc_any"} limitTags={3} filterToQuery={codeFilterQuery}/>
                                    </ReferenceInput>
                                    <ReferenceInput source={'mapping3_standard_section_id'} reference={'standard_sections'} filter={{standard_id: standardId, ...section3Filter}} perPage={10000}
                                                    queryOptions={{meta: {scopingEscapeHatch: true}}}>
                                        <AutocompleteInput label={"Section 3"} source={"code_inc_any"} limitTags={3} filterToQuery={codeFilterQuery}/>
                                    </ReferenceInput>

                                    <ReferenceInput source={'mapping1_cognitive_skill_id'} reference={'cognitive_skills'} filter={{...cognitiveSkill1Filter}} perPage={1000}
                                                    queryOptions={{meta: {scopingEscapeHatch: true}}}>
                                        <AutocompleteInput label={"Cognitive Skill 1"} source={"name"} limitTags={3}/>
                                    </ReferenceInput>
                                    <ReferenceInput source={'mapping2_cognitive_skill_id'} reference={'cognitive_skills'} filter={{...cognitiveSkill2Filter}} perPage={1000}
                                                    queryOptions={{meta: {scopingEscapeHatch: true}}}>
                                        <AutocompleteInput label={"Cognitive Skill 2"} source={"name"} limitTags={3}/>
                                    </ReferenceInput>
                                    <ReferenceInput source={'mapping3_cognitive_skill_id'} reference={'cognitive_skills'} filter={{...cognitiveSkill3Filter}} perPage={1000}
                                                    queryOptions={{meta: {scopingEscapeHatch: true}}}>
                                        <AutocompleteInput label={"Cognitive Skill 3"} source={"name"} limitTags={3}/>
                                    </ReferenceInput>
                                    </>}
                                </>
                            )
                        }}
                      </FormDataConsumer>
                    </SimpleForm>
                </Edit>
            )
        }

        openDialog(<EditSectionAndCognitiveSkill />)
    }

    if(isLoadingLessons) return <Loading/>; // Handle loading state
    return (
        <Box sx={{width: '100%'}}>
        <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={droppableId} direction="vertical">
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
            <Datagrid sx={{
                  "& .RaDatagrid-tableWrapper": {
                      maxHeight: 'calc(100vh - 22rem)',
                      overflow: 'auto'
                  }
               }} data={orderedRows} bulkActionButtons={false} empty={<Empty emptyText="No Lessons yet"/>} rowClick={false}>
                <FunctionField label="Lesson" render={record => {
                    return (
                    <Draggable key={record.id} draggableId={record.id.toString()} index={record.__index__}>
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                            >
                                <Typography variant={"h7"}>{record.lesson.name}</Typography>
                            </div>
                            )}
                    </Draggable>)}}/>
                <ReferenceField source={"lesson.tenant_id"} reference={"tenants"} link={false} label="Publisher">
                    <TextField source="name"/>
                </ReferenceField>
                {(isSchoolClass && isAnySchoolFlavorActive()) &&
                    <FunctionField label={"Sections"}
                        render={record => {
                            const code1 = record?.mapping1_standard_section?.code || '';
                            const code2 = record?.mapping2_standard_section?.code || '';
                            const code3 = record?.mapping3_standard_section?.code || '';

                            return [code1, code2, code3].filter(Boolean).join(', ');
                        }}
                    />
                }
                {(isSchoolClass && isAnySchoolFlavorActive()) &&
                    <FunctionField label={"Cognitive Skills"}
                                   render={record => {
                                       const name1 = record?.mapping1_cognitive_skill?.name || '';
                                       const name2 = record?.mapping2_cognitive_skill?.name || '';
                                       const name3 = record?.mapping3_cognitive_skill?.name || '';

                                       return [name1, name2, name3].filter(Boolean).join(', ');
                                   }}
                    />
                }
                {(resource === 'curriculum_lessons') &&
                    <FunctionField  render={(record) => {
                        return (
                            <Button sx={{height: "1.5rem", '& .MuiButton-icon': {margin: 0}}} onClick={() => handleEdit(record)} variant="text">
                                <EditIcon/>
                            </Button>
                        )
                    }}/>
                }
                <DeleteButton label={false} redirect={!disableRedirect && (resource === 'class_progress' ? `/classes/${recordId}/2` : `curriculum/${recordId}`)}/>
            </Datagrid>
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
        </Box>
       )
}
