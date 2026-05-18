import { Resource, createDefaults, editDefaults, formDefaults, listDefaults, SimpleForm,
	type ResourceActionDefs, type FieldSchema, SimpleFileField, SimpleFileInput, CardGrid, createReferenceField,
    createReferenceInput, BooleanLiveFilter, ReferenceLiveFilter, DateLiveFilter, NumberLiveFilter, TextLiveFilter
} from '@mahaswami/vc-frontend';
import { Create, Edit, List, Menu,
    type ListProps, TextField, TextInput, DateInput, BooleanField, BooleanInput, NumberInput} from "react-admin";
import { StudentsReferenceInput } from './students.js';
import { ClassesReferenceInput } from './classes.js';
import { UsersReferenceInput } from './users.js';
import { DivisionsReferenceInput } from './divisions.js';
import { TimeControlsReferenceInput } from './time_controls.js';
import {GameIcon} from "./games/GameIcon.tsx";
import {GameList, GamePlay, GamePlayWithBot, GameShow} from "./games/games.tsx";
import {Route} from "react-router-dom";

export const RESOURCE = "games"
export const ICON = GameIcon
export const PREFETCH: string[] = ["classes", "users", "divisions", "time_controls"]

export const GamesReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const GamesReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const gamesActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <BooleanLiveFilter source="is_feedback_requested" label="Feedback Requested" />,
    <ReferenceLiveFilter source="player1_student_id" reference="students" label="Player1 Student" />,
    <ReferenceLiveFilter source="player2_student_id" reference="students" label="Player2 Student" />,
    <DateLiveFilter source="event_date" label="Event" />,
    <DateLiveFilter source="created_date" label="Created" />,
    <ReferenceLiveFilter source="class_id" reference="classes" label="Class" />,
    <ReferenceLiveFilter source="user_id" reference="users" label="User" />,
    <ReferenceLiveFilter source="division_id" reference="divisions" label="Division" />,
    <ReferenceLiveFilter source="time_control_id" reference="time_controls" label="Time Control" />,
    <NumberLiveFilter source="player1_time_number" label="Player1 Time" />,
    <NumberLiveFilter source="player2_time_number" label="Player2 Time" />
]

export const GamesCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<TextField source="event" variant='h6' />}>
                <TextField source="feedback_status" />
                <BooleanField source="is_feedback_requested" />
            </CardGrid>
        </List>
    )
}

const GameForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)} display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
            <TextInput source="event" />
            <TextInput source="feedback_status" />
            <BooleanInput source="is_feedback_requested" />
            <TextInput source="method_of_entry" />
            <TextInput source="result" />
            <TextInput source="pgn" />
            <TextInput source="status" />
            <StudentsReferenceInput source="player1_student_id" />
            <StudentsReferenceInput source="player2_student_id" />
            <TextInput source="player1_name" />
            <TextInput source="player2_name" />
            <TextInput source="bot_difficulty" />
            <DateInput source="event_date" />
            <SimpleFileInput source="pgn_attachment_file_id" />
            <SimpleFileField source="pgn_attachment_file_id" title="pgn_attachment_file_name" />
            <DateInput source="created_date" />
            <ClassesReferenceInput source="class_id" />
            <UsersReferenceInput source="user_id" />
            <DivisionsReferenceInput source="division_id" />
            <TimeControlsReferenceInput source="time_control_id" />
            <NumberInput source="player1_time_number" />
            <NumberInput source="player2_time_number" />
            <TextInput source="last_move_time" />
        </SimpleForm>
    )
}

const GameEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <GameForm />
        </Edit>
    )
}

const GameCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <GameForm />
        </Create>
    )
}

const gamesFieldSchema: FieldSchema = {
    event: {},
    feedback_status: {},
    is_feedback_requested: {},
    method_of_entry: {},
    result: {},
    pgn: {},
    status: {},
    player1_student_id: { resource: 'students' },
    player2_student_id: { resource: 'students' },
    player1_name: {},
    player2_name: {},
    bot_difficulty: {},
    event_date: {},
    pgn_attachment_file_id: {},
    created_date: {},
    class_id: { resource: 'classes' },
    user_id: { resource: 'users' },
    division_id: { resource: 'divisions' },
    time_control_id: { resource: 'time_controls' },
    player1_time_number: {},
    player2_time_number: {},
    last_move_time: {}
};
const gamesSearchableFields: string[] = [
    'player1_name',
    'player2_name',
    'event',
    'feedback_status',
    'method_of_entry',
    'result',
    'pgn',
    'status',
    'bot_difficulty',
    'last_move_time'
];

export const GamesResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => record.event}
        fieldSchema={ gamesFieldSchema}
        actionDefs={ gamesActionDefs}
        searchableFields={ gamesSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<GameList/>}
        create={<GameCreate/>}
        edit={<GameEdit/>}
        show={<GameShow/>}
        hasLiveUpdate
        hasFilterChooser
        cardList={<GamesCardList/>}
        hasColumnChooser
        sort={{ field: 'player1_name', order: 'ASC' }}
    >
        <Route path={":id/play"} element={<GamePlay/>}/>,
        <Route path={":id/play/bot"} element={<GamePlayWithBot/>}/>
    </Resource>
)
export const GamesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Games" leftIcon={<ICON />} />
)
