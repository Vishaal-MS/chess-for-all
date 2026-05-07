import {Box, Grid} from '@mui/material';
import {
    AutocompleteArrayInput,
    Datagrid,
    FunctionField,
    Loading,
    Button as RAButton,
    ReferenceArrayField,
    ReferenceArrayInput,
    required,
    SelectInput,
    ShowBase,
    SingleFieldList,
    TextField,
    Title,
    TopToolbar,
    useGetRecordId,
    useRecordContext,
    useRefresh,
    ShowButton,
    BooleanInput, EditButton, useGetOne, Edit, Create, Show, List,
} from 'react-admin';

import { Button } from "@mui/material";
import Toolbar from '@mui/material/Toolbar';
import { useEffect, useState } from "react";
import { SearchInput, TextInput } from 'react-admin';
import {currentTenantId, isStudent} from "../../businessLogic";
import { AssignmentShow } from "../class/assignments.tsx";
import { Empty } from '../common/empty.tsx';
import {FullscreenPortal} from "../../components/FullscreenPortal.tsx";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {DuplicateDialog} from "../../components/DuplicateDialog.tsx";
import {
    DataTable,
    openDialog,
    PER_PAGE,
    remoteLog,
    SensibleDefaultPagination,
    useRealtimeComms
} from "@mahaswami/vc-frontend";

const filters = [
    <SearchInput source="q" alwaysOn sx={{
        '& .MuiFilledInput-input': {
            height: '2em',
        }}}/>,
    <ReferenceArrayInput source="tag_ids" reference="tags" alwaysOn queryOptions={{meta: {scopingEscapeHatch:true}}} perPage={1000} sort={{ field: 'name', order: 'ASC' }}>
        <AutocompleteArrayInput label="Tags" />
    </ReferenceArrayInput>,
    <SelectInput source="language" alwaysOn choices={getLanguagesMap()} />
];

export const LessonList = () => {

    return (
        <List title={<ListTitle resourceName="Lessons List"/>} filterDefaultValues={{ language: 'EN' }} storeKey={"myLessons"} filters={filters} pagination={<SensibleDefaultPagination />}
            perPage={PER_PAGE} sort={{field: 'name', order: 'ASC'}} exporter={false} empty={<Empty emptyText="No Lessons found." showCreateIfApplicable={true}/>}>
            <DataTable rowClick="edit">
                <DataTable.Col source="name"/>
                <DataTable.Col source="tag_ids" field={() =>
                    <ReferenceArrayField source="tag_ids" reference="tags" label="Tags" perPage={1000}>
                        <SingleFieldList linkType={false} />
                    </ReferenceArrayField>
                }/>
                <DataTable.Col source="language" field={LanguageChoiceField} />
            </DataTable>
        </List>
    );
}


export const LessonActions = ({props}) => {
    const record = useRecordContext();
    const dataProvider = window.swanAppFunctions.dataProvider;
   return ( <Toolbar>
       <Button
            label="Ask Question"
            onClick={() => {
                // do something
                props.onClickAskQuestion();
            }}
        />
    </Toolbar>);
}

export const LessonShow = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const lessonId = Number(useGetRecordId());
    const { assignmentId, classId, enrollmentId, ids: lessonIds, curriculumId, subscribableId, isFromSubscribedCurriculum } = location.state || {};
    const dataProvider = window.swanAppFunctions.dataProvider;
    const refresh = useRefresh();
    const [state, setState] = useState({
        loading: true,
        assignmentTitle: '',
        assignment: undefined
    })
    const realtimeComms = useRealtimeComms();



    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                const {data: assignment} = await dataProvider.getOne("assignments", {
                    id: assignmentId,
                    meta: {prefetch: ['students']}
                });
                const {data: user} = await dataProvider.getOne('users', {id: assignment.student?.user_id});
                setState({loading: false, assignmentTitle: user?.fullName, assignment: assignment })
            } catch (error) {
                remoteLog("Error sending on LessonShow fetchAssignment method: ", error);
            }
        }
        const handleUpdate = (content) => {
            const { assignment } = content;
            if (assignment) {
                setState(prevState => ({...prevState, assignment }));
            }
        };
        if (assignmentId) {
            fetchAssignment();
            if (!isStudent()) {
                // For Coach Sync progress in realtime
                const topic = `assignments/${assignmentId}`;
                realtimeComms.subscribe(topic, handleUpdate);
            }
        } else {
            setState(prevState => ({...prevState, loading: false}))
        }
        return () => {
            if (assignmentId && !isStudent()) {
                realtimeComms.unsubscribe(`assignments/${assignmentId}`, handleUpdate);
            }
        };
    }, [assignmentId]);

    if (state.loading )
        return <Loading />;

    const processUpdate = async (updatedAssignment) => {
        setState(prevState => ({...prevState, assignment: updatedAssignment}));
    }

    const assignmentTitle = state.assignmentTitle;
    const title = assignmentId ? assignmentTitle + "'s Assignment" : "Lesson Show";
    const assignment = state.assignment

    const ShowActions = () => (
        <TopToolbar>
            <RAButton onClick={() => navigate(`/classes/${classId}/show`)} style={{fontSize: 13}} startIcon={<KeyboardReturnIcon />}  label={"Return To Coach Workspace"}/>
        </TopToolbar>
    )

    if (assignmentId && assignment) {
        return (
            <ShowBase>
                <Title title={<RecordTitle resourceName={title}/>} />
                <FullscreenPortal isActive={isStudent()} onClose={() => navigate(-1)}>
                    <AssignmentShow assignment={assignment} title={assignmentTitle} processUpdate={processUpdate} lessonId={lessonId} />
                </FullscreenPortal>
            </ShowBase>
        )
    }
    const LessonActions = () => (
        <TopToolbar>
            <ReturnButtonMyLesson/>
            <FunctionField render={(record) => {
                return (
                    <RAButton label={"Duplicate"} startIcon={<ContentCopyIcon/>}
                              onClick={() => {
                                  openDialog(<DuplicateDialog width={'32rem'} record={record} resource={"lessons"}/>)
                              }}
                    />
                )
            }}/>
            <EditButton/>
        </TopToolbar>
    )

    const CurriculumLessonAction = () => {
        const url = isFromSubscribedCurriculum ? `/subscribables/${subscribableId}/show?from=subscribedCurriculums` : `/subscribables/${subscribableId}/show`;
        const {data: curriculum} = useGetOne('curriculum', {id: curriculumId});
        return (
        <TopToolbar>
            <RAButton
                onClick={() => navigate( isFromSubscribedCurriculum !== undefined ? url : `/curriculum/${curriculumId}/show`)}
                startIcon={<KeyboardReturnIcon />}
                label="Return to Curriculum Details"
            />
            {(isFromSubscribedCurriculum || curriculum?.tenant_id === currentTenantId()) && <CustomPrevNextButtons /> }
        </TopToolbar>
     )
    }

    return (
        <Show actions={classId ? <ShowActions />: lessonIds ? <CurriculumLessonAction/> : <LessonActions/>} title={<RecordTitle resourceName={title}/>}>
            <Box sx={{px: 2, py: 1}}>
                <Box display="flex" sx={{p: 5, flexDirection: 'column'}}>
                    <Box display="flex" justifyContent="center">
                        <TextField source="name" variant="h5" gutterBottom/>
                    </Box>
                </Box>
                <ChessAIField source="content" assignmentId={assignmentId} lessonId={lessonId} key={lessonId}/>
            </Box>
        </Show>
    );
}

const ReturnButtonMyLesson = () => {
    const navigate = useNavigate();
    return (
        <RAButton
            onClick={() => navigate('/lessons')}
            startIcon={<KeyboardReturnIcon/>}
            label="Return to My Lessons"
        />
    )
}

import { SimpleForm } from 'react-admin';

const ShowActions = () => (
    <TopToolbar>
         <ReturnButtonMyLesson/>
        <ShowButton label={"Preview"}/>
    </TopToolbar>
);

export const LessonEdit = () => (
    <Edit actions={<ShowActions />} title={<RecordTitle resourceName="Lesson Edit"/>} mutationMode="pessimistic">
        <LessonForm />
    </Edit>
);

import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import { useLocation, useNavigate } from "react-router-dom";
import { ListTitle, RecordTitle } from "../../components/Title.tsx";
import { ChessAIField } from '../../fields/ai_lesson/ChessAIField';
import { ChessAIInput } from '../../fields/ai_lesson/ChessAIInput';
import { useUnique } from '../../helpers/useUnique';
import { getLanguageDescription, getLanguagesMap } from '../../utils.ts';
import CustomPrevNextButtons from "../../components/CustomPrevNextButtons.tsx";
import {LanguageChoiceField} from "../lessons.tsx";


export const LessonCreate = () => (
    <Create title={<ListTitle resourceName="New Lesson"/>}>
        <LessonForm />
    </Create>
);

export const LessonForm = () => {
    const unique = useUnique();
    return(
        <SimpleForm>
            <Grid container spacing={1}>
                <Grid item xs={12} md={6}>
                    <TextInput source="name" validate={[required(), unique()]}/>
                </Grid>
                <Grid mt={2} item xs={12} md={6}>
                    <BooleanInput defaultValue={false} label="Limit To Show Single Section?" source="is_limit_to_show_single_section"/>
                </Grid>
                <Grid item xs={12} md={6}>
                    <SelectInput
                        source="language"
                        label="Language"
                        choices={getLanguagesMap()}
                        defaultValue={'EN'}
                        helperText={false}
                        validate={required()}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <ReferenceArrayInput source="tag_ids" reference="tags" queryOptions={{meta: {scopingEscapeHatch:true}}} perPage={1000} sort={{ field: 'name', order: 'ASC' }} >
                        <AutocompleteArrayInput label="Tags" />
                    </ReferenceArrayInput>
                </Grid>
            </Grid>
            <ChessAIInput source="content" validate={required()} fullWidth/>
        </SimpleForm>
    );
}