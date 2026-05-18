import {DateField, EditGuesser, Loading, ReferenceField, ReferenceFieldProps, SelectInput, SimpleShowLayout,
    TextField, useRecordContext, useListContext, ReferenceInput, AutocompleteInput, List, Show
} from "react-admin"
import GameListActions from "./GameListActions"
import { Empty } from "../common/empty";
import {
    DataTable,
    getLocalStorage,
    PER_PAGE,
    remoteLog,
    removeLocalStorage,
    SensibleDefaultPagination
} from "@mahaswami/vc-frontend";
import { NotaBoardField } from "./NotaBoardField";
import { useEffect, useState } from "react";
import {useLocation, useNavigate } from "react-router-dom";
import {
    booleanChoices, FeedbackStatusLabels,
    GameResult,
    GAME_STATUS,
    GameStatusLabels
} from "../../helpers/constants";
import {
    getCurrentUserStudentId, getDivisionId,
    isCoach,
    isLargeAcademy,
    isStudent,
} from "../../businessLogic.ts";
import FilterMultiChoiceInput from "../common/FilterMultiChoiceInput.tsx";
import {ListTitle, RecordTitle} from "../../components/Title.tsx";
import PlayWithBotView from "./PlayWithBotView.tsx";
import {ClassesReferenceField} from "../classes.tsx";
import {GamePlayView} from "./GamePlayView.tsx";

export const GameList = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { classId, className, enrollmentId, student_id} = location.state || {};
    const [state, setState] = useState({loading: true, games: [], studentChooses: [], studentId: null});
    const dataProvider = window.swanAppFunctions.dataProvider;

    if (!classId && !isCoach()) {
        navigate(-1);
    }

    if (isCoach() && !classId) {
        removeLocalStorage("class_game_state");
    }

    useEffect(() => {

        const fetchStudents = async () => {
            try {

                const {data: games} = await dataProvider.getList("games", {
                    filter: {class_id: classId},
                    // meta: {prefetch: ["students"]},
                    pagination: {page: 1, perPage: 10000}
                });

                const player1StudentIds = games.map(g => g?.player1_student_id);
                const player2StudentIds = games.map(g => g?.player2_student_id);
                const combinedStudents = [...new Set([...player1StudentIds, ...player2StudentIds])];

                const {data: students} = await dataProvider.getList("students", {
                    filter: {id: combinedStudents},
                    meta: {prefetch: ["users"]},
                    pagination: {page: 1, perPage: 10000}
                });

                const studentChooses = students.map(s => {
                    return {
                        id: s?.id,
                        name: s.user.fullName,
                    }
                });

                const studentId = await getCurrentUserStudentId(dataProvider);
                setState(prev => ({...prev, games, studentId, studentChooses}));

            } catch (error) {
                console.log("ERROR: While fetching the students for filter", error);
                remoteLog("ERROR: While fetching the students for filter", error);
            } finally {
                setState(prev => ({...prev, loading: false}));
            }
        };

        fetchStudents();

    }, []);


    const eventChoices =
        state?.games?.map(game => game.event)
            .filter(Boolean)
            .filter((value, index, self) => self.indexOf(value) === index)
            .map(event => ({ id: event, name: event })) ?? [];

    const GameListFilters = [
        <AutocompleteInput source="event" label="Event" choices={eventChoices} alwaysOn sx={{ width: "14rem"}}/>
    ];

    if (!classId) {
        GameListFilters.push(
            <ReferenceInput source="class_id" reference="classes" alwaysOn label="Class">
                <SelectInput optionText="name" sx={{width: "15rem"}}/>
            </ReferenceInput>
        );
    } else {
        GameListFilters.push(<FilterMultiChoiceInput style={{'& .MuiFilledInput-input': {paddingTop: '1.3rem'}}}
            source="players_filter_by_ids" choices={state.studentChooses} label="Players" alwaysOn/>);
    }
    if (isCoach()) {
        GameListFilters.push(<SelectInput label="Feedback Pending?" sx={{width: "12rem"}} source={"is_feedback_requested"} choices={booleanChoices} alwaysOn/>);
    }

    let filter= {};
    let defaultFilterValues = {};

    if (isCoach() && !classId) {
        if (isLargeAcademy() && getDivisionId()) {
            filter = {division_id: getDivisionId()}
        }
        defaultFilterValues = {is_feedback_requested: true};
    } else if (isCoach() && classId) {
        defaultFilterValues = {is_feedback_requested: true};
        filter = {class_id: classId};
    } else if (isStudent()) {
        const studentIds = state?.studentId || [];
        defaultFilterValues = { players_filter_by_ids: studentIds };
        filter = {class_id: classId, status: [GAME_STATUS.IN_PROGRESS, GAME_STATUS.ENDED]};
    }

    if (state.loading) {
        return <Loading/>
    }
    const title = isCoach() && !classId ? "Games" : `${className} - Games `;
    const studentFilter = {players_filter_by_ids: [student_id]};
    return (
        <List filters={!enrollmentId ? GameListFilters : undefined}
            title={<ListTitle resourceName={title}/>}
            filter={filter} filterDefaultValues={enrollmentId ? studentFilter : defaultFilterValues}
            actions={<GameListActions />} disableSyncWithLocation
            exporter={false}
            empty={<Empty emptyText="No Games yet" actions={<GameListActions />}/>}
            pagination={<SensibleDefaultPagination />}
            perPage={PER_PAGE}
        >
            <Games classId={classId}/>
        </List>
    )
}

const Games = ({classId}) => {
    const { filterValues, data } = useListContext();
    let gameData = data;
    if (filterValues.players_filter_by_ids && filterValues.players_filter_by_ids.length > 0) {
        const playerIds = filterValues.players_filter_by_ids;
        gameData = data?.filter((game: any) => playerIds.includes(game.player1_student_id) || playerIds.includes(game.player2_student_id));
    }

    return (
        <DataTable data={gameData}>
            {!classId && isCoach() && <DataTable.Col source='class_id' field={ClassesReferenceField} />}
            <DataTable.Col label={"Players"} render={(record: any) =>
                `${record?.player1_name || "Player 1"} vs ${record?.player2_name || "Player 2"}`}/>
            <DataTable.Col source="event" />
            <DataTable.Col source="event_date" label="Date" field={DateField}/>
            {isCoach() &&
                <DataTable.Col label="Status" render={record => record?.status ? GameStatusLabels[record?.status] : ""}/>
            }
            <DataTable.Col label="Result" render={record => record?.result ? GameResult[record?.result]?.name : ""}/>
            {isCoach() && <DataTable.Col label="Feedback?"
                 render={record => record?.feedback_status ? FeedbackStatusLabels[record?.feedback_status] : ""}/>
            }
        </DataTable>
    );
};

export const GameShow = () => {
    const classGamesState = getLocalStorage("class_game_state");
    const { classId } = classGamesState && JSON.parse(classGamesState) || {};

    return (
        <Show actions={false} component={"div"} sx={{ p: 0 }} title={<GameTitle classId={classId}/>}
              queryOptions={{meta: { prefetch: ['classes', 'time_controls']}}}>
            <SimpleShowLayout sx={{ overflow: 'auto', p: 0}}>
                <NotaBoardField mode={"show"}/>
            </SimpleShowLayout>
        </Show>
    )
}


export const GamePlay = () => {
    const classGameState = getLocalStorage("class_game_state");
    const {classId} = classGameState && JSON.parse(classGameState) || {};
    return (
        <Show
            actions={false} 
            component={"div"} sx={{ p: 0 }}
            title={<GameTitle classId={classId}/>} 
            queryOptions={{ meta: {
                prefetch: ["time_controls", "users"]
            }}}
        >
            <GamePlayView classId={classId}/>
        </Show>
    )
}

const GameTitle = ({classId}) => {
    const record = useRecordContext();
    if (record) {
        let title= "";
        if (record.class) {
            if (isCoach() && !classId) {
                title = "Games - " + record?.class.name;
            } else {
                title = record?.class.name + " - Games";
            }
        } else {
            title = "Games";
        }
        return (<RecordTitle resourceName={title} source="event"/>);
    }
}

export const GamePlayWithBot = () => {

    return (
        <Show actions={false}
            component={"div"} sx={{ p: 0 }}
            queryOptions={{ meta: { prefetch: ["classes", "time_controls"] } }}
            title={<GameTitle />}>
           <PlayWithBotView />
        </Show>
    )
}

export const GameEdit = () => {
    return (
        <EditGuesser/>
    )
}

export const StudentField = (props: Omit<ReferenceFieldProps, "reference">) => (
    <ReferenceField reference="students" queryOptions={{ meta: {prefetch: ["users"]}}} {...props}>
        <TextField source="user.fullName" />
    </ReferenceField>
)
