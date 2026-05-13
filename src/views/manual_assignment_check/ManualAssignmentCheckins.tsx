import {
    DateField, EditBase, FunctionField, Link, List,
    Loading, SelectInput, Show, TextField,
    TextInput, useNotify, useRefresh,
} from "react-admin";
import {
    closeDialog,
    DataTable,
    openDialog,
    PER_PAGE,
    remoteLog,
    SensibleDefaultPagination, SimpleForm
} from "@mahaswami/vc-frontend";
import {ListTitle} from "../../components/Title.tsx";
import {useEffect, useState} from "react";
import {AssignmentBlockStatus, AssignmentStatus} from "../../helpers/constants.ts";
import {TextField as MuiTextField, Box, Card, Button, CardContent, CardHeader, Chip, Stack, Typography} from "@mui/material";
import {ArrowLeft, ArrowRight, Clear, Done} from "@mui/icons-material";
import {useFormContext} from "react-hook-form";
import {Empty} from "../common/empty.tsx";
import {formatStatus} from "../../utils.ts";
import {ClassesReferenceInput} from "../classes.tsx";
import {LessonsReferenceInput} from "../lessons.tsx";
import {UsersReferenceField} from "../users.tsx";

export const ManualAssignmentCheckins = () => {

    const [state, setState] = useState({isLoading: true, assignmentIds: [], refreshKey: new Date()});
    const dataProvider = window.swanAppFunctions.dataProvider;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const {data: assignmentBlocks} = await dataProvider.getList("assignment_blocks", {
                    pagination: {page: 1, perPage: 100000},
                    filter: {status: AssignmentBlockStatus.CHECK_PENDING},
                });
                const assignmentIds = [...new Set(assignmentBlocks.map(ab => ab.assignment_id))];
                setState({isLoading: false, assignmentIds});
            } catch (error) {
                console.log("Fetch Manual Assignment Check: ", error);
                remoteLog("Error Manual Assignment Checkins", error)
            } finally {
                setState(prev => ({...prev, isLoading: false}));
            }
        }

        fetchData();
    }, [state.refreshKey]);

    const AssignmentFilters = [
        <ClassesReferenceInput source="class_id" reference="classes" alwaysOn label="Class" />,
        <LessonsReferenceInput source="lesson_id" reference="lessons" alwaysOn label="Lesson" />,
    ];

    const {isLoading, assignmentIds} = state;

    if (isLoading) {
        return <Loading/>;
    }

    const updateRefreshKey = (key: any) => {
        setState({...state, refreshKey: key});
    }
    const showAssignmentDialog = (record) => {
        openDialog(<AssignmentBlockCheckins assignmentRecord={record} refreshFn={updateRefreshKey} width="80vw"/>);
    }

    return (
        <List pagination={<SensibleDefaultPagination/>} empty={<Empty emptyText={"No Manual Assignment Checkins Yet"}/>}
              disableSyncWithLocation perPage={PER_PAGE}
              resource="assignments" filters={AssignmentFilters} exporter={false} filter={{id: assignmentIds}}
              title={<ListTitle resourceName="Manual Assignment Check-ins"/>}
              queryOptions={{meta: {prefetch: ['classes', "students", "lessons"]}}}>
            <DataTable bulkActionButtons={false}
                      rowClick={(id, resource, record) => {
                          showAssignmentDialog(record);
                          return false;
                      }}>
                <DataTable.Col label="Class"
                    render={(record: any) =>
                        <Link to={`/classes/${record.class.id}/show`} onClick={(e) => e.stopPropagation()}>
                            {record.class.name}
                        </Link>
                    }
                />
                <DataTable.Col source="lesson.name" label="Lesson"/>
                <DataTable.Col source="student.user_id" label="Student" field={UsersReferenceField} />
                <DataTable.Col source="status" label="Status" render={record => formatStatus(record.status)}/>
                <DataTable.Col source="assigned_timestamp"/>
            </DataTable>
        </List>
    );
}

const handleUpdateAssignment = async (updatedBlocks: any[], assignmentRecord: any) => {
    const dataProvider = (window as any).swanAppFunctions.dataProvider;
    let assignmentPayload = {status: AssignmentStatus.IN_PROGRESS};
    const completedBlocks = updatedBlocks.filter((block) => block.status === AssignmentBlockStatus.COMPLETED);
    const isIncorrect = updatedBlocks.some((block) => block.status === AssignmentBlockStatus.IN_CORRECT);
    const isCheckPending = updatedBlocks.some((block) => block.status === AssignmentBlockStatus.CHECK_PENDING);

    // Update assignment status
    if (completedBlocks?.length === assignmentRecord.total_blocks) {
        assignmentPayload.status = AssignmentStatus.COMPLETED;
        assignmentPayload.completed_blocks = completedBlocks?.length;
    } else if (isIncorrect) {
        assignmentPayload.status = AssignmentStatus.IN_CORRECT;
    } else if (isCheckPending) {
        assignmentPayload.status = AssignmentStatus.CHECK_PENDING;
    }

    await dataProvider.update("assignments", {
        id: assignmentRecord.id,
        data: assignmentPayload,
    });
};

const AssignmentBlockCheckins = ({assignmentRecord, refreshFn}: any) => {
    const [state, setState] = useState({
        isLoading: true,
        isShowNavigation: false,
        assignmentBlocks: [] as any[],
        allBlocks: [] as any[],
    });
    const [currentIndex, setCurrentIndex] = useState(0);
    const dataProvider = (window as any).swanAppFunctions.dataProvider;
    const notify = useNotify();
    const refresh = useRefresh();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const {data: assignmentBlocks} = await dataProvider.getList(
                    "assignment_blocks",
                    {
                        pagination: {page: 1, perPage: 100000},
                        filter: {assignment_id: Number(assignmentRecord.id)},
                        meta: {prefetch: ["lesson_blocks"]},
                    }
                );

                const filteredAssignmentBlocks = assignmentBlocks.filter(
                    (ab: any) =>
                        ab.lesson_block.block_type === "pqa" &&
                        ab.status === AssignmentBlockStatus.CHECK_PENDING
                );

                setState({
                    isLoading: false,
                    assignmentBlocks: filteredAssignmentBlocks,
                    allBlocks: assignmentBlocks,
                    isShowNavigation: filteredAssignmentBlocks?.length > 1,
                });
            } catch (error) {
                console.log("Fetch Assignment Blocks: ", error);
                remoteLog("Error While Fetch Assignment Blocks", error);
            } finally {
                setState((prev) => ({...prev, isLoading: false}));
            }
        };

        fetchData();
    }, []);

    const {isLoading, assignmentBlocks, allBlocks, isShowNavigation} = state;

    const handleAssignmentCheck = async (blockId: number, newComment: string, status: string) => {
        try {
            // Update Assignment Block Status and comment
            const {data: updatedAssignmentBlock} = await dataProvider.update("assignment_blocks", {
                     id: blockId,
                    data: {comment: newComment, status: status},
                }
            );
            const updatedBlocks = allBlocks.map((block) =>
                block.id === blockId ? {...block, ...updatedAssignmentBlock} : block
            );
            setState((prev) => ({...prev, allBlocks: updatedBlocks}));
            // Update assignment
            await handleUpdateAssignment(updatedBlocks, assignmentRecord);

            notify("Assignment Checkin Completed", {type: "success"});
            refreshFn(new Date());
            if (isShowNavigation) {
                refresh();
                setCurrentIndex((prev) => prev < assignmentBlocks.length - 1 ? prev + 1 : prev);
            } else {
                closeDialog(); // if single checkin pending close the dialog.
            }
        } catch (error) {
            console.error("Error updating comment:", error);
            notify("Error updating comment", {type: "error"});
        }
    };

    if (isLoading) {
        return <Loading/>;
    }

    const currentBlock = assignmentBlocks[currentIndex];

    if (!currentBlock) {
        return <Typography>No Checkin Pending</Typography>;
    }

    return (
        <Show>
            <Box>
                <Card key={currentBlock.id} sx={{"& .MuiCardContent-root:last-child" : {pb: 0}}}>
                    <CardHeader
                        title={assignmentRecord.class.name}
                        subheader={assignmentRecord.lesson.name}
                    />
                    <CardContent sx={{py: 0}}>
                        {/*Assignment block details*/}
                        <Stack gap="0.5rem">
                            <CommonField key={0} label="Question" value={currentBlock.lesson_block?.question}/>
                            <CommonField key={1} label="Expected Answer" value={currentBlock.lesson_block?.expected_answer}/>
                            <CommonField key={2} label="Student Answer" value={currentBlock.answer}/>
                        </Stack>
                        {/*Assignment Checkin status update*/}
                        <EditBase resource="assignment_blocks" id={currentBlock.id}>
                            <SimpleForm toolbar={false}>
                                <FunctionField
                                    label={"Status"}
                                    render={(record) => (
                                        <Box sx={{display: "flex", gap: "1rem", alignItems: "center"}}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Status
                                            </Typography>
                                            <Chip size={"small"} sx={{my: "0.5rem"}} label={formatStatus(record.status)}/>
                                        </Box>
                                    )}
                                />
                                <TextInput multiline fullWidth minRows={3} source="comment" label="Comments" variant="outlined"/>
                                <CheckinActions blockId={currentBlock.id} onCheck={handleAssignmentCheck}/>
                            </SimpleForm>
                        </EditBase>
                         {/*Navigation*/}
                        { isShowNavigation &&
                            <Box sx={{display: "flex", justifyContent: "flex-end", alignItems: "center", mb: "1rem", mr: "1rem"}}>
                                <Button disabled={currentIndex === 0}
                                    sx={{ mr: "0.5rem",  py: "0rem"}} startIcon={<ArrowLeft/>}
                                    onClick={() => setCurrentIndex((i) => i - 1)}
                                >
                                    Previous
                                </Button>
                                <Typography variant="caption">
                                    {currentIndex + 1} / {assignmentBlocks.length}
                                </Typography>
                                <Button disabled={currentIndex === assignmentBlocks.length - 1}
                                    sx={{ ml: "0.5rem",  py: "0rem"}} endIcon={<ArrowRight/>}
                                    onClick={() => setCurrentIndex((i) => i + 1)}
                                >
                                    Next
                                </Button>
                            </Box>
                        }
                    </CardContent>
                </Card>
            </Box>
        </Show>
    );
};

const CheckinActions = ({blockId, onCheck}: any) => {
    const {getValues} = useFormContext();
    return (
        <Box sx={{ display: "flex", width: "100%", justifyContent: "flex-end", gap: "1rem", mb: "1rem"}}>
            <Button color="success" size="small" sx={{"& .MuiButton-endIcon" : {ml: "0.2rem"}}}
                    endIcon={<Done />} variant="contained"
                    onClick={() =>
                        onCheck(blockId, getValues("comment") || "", AssignmentBlockStatus.COMPLETED)
                    }
            >
                Correct
            </Button>
            <Button color="error" size="small" sx={{"& .MuiButton-endIcon" : {ml: "0.2rem"}}}
                endIcon={<Clear />} variant="contained"
                onClick={() =>
                    onCheck(blockId, getValues("comment") || "", AssignmentBlockStatus.IN_CORRECT)
                }
            >
                Incorrect
            </Button>
        </Box>
    );
};

const CommonField = ({label, value}: { label: string, value: string }) => {
    return (
        <Box>
            <Typography variant="subtitle2" color="text.secondary"> {label} </Typography>
            <MuiTextField sx={{m: 0}} value={value || "—"}
                          variant="outlined" fullWidth multiline maxRows={4}
                          size="small" InputProps={{readOnly: true}}
            />
        </Box>
    );
}
