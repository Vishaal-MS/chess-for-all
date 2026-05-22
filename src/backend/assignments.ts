import {isStudent, sendEmail } from "./common_logics.ts";
import {remoteLog} from "@mahaswami/vc-frontend";
import {v4 as uuidv4} from "uuid";
import {AssignmentBlockStatus, AssignmentStatus, TeachingMode} from "../helpers/constants.ts";
import {getStudentAssignmentEmailTemplate} from "../helpers/emailTemplates.ts";

const updateAssignmentStatus = async (assignmentId: number, assignmentPayload: any) => {
    try {
        const dataProvider = (window as any).swanAppFunctions.dataProvider;
        const {data: assignment} = await dataProvider.update('assignments', {
            id: assignmentId,
            data: assignmentPayload
        })
        return assignment;
    } catch (error) {
        remoteLog("Error sending on updateAssignmentStatus: ", error);
    }
}

export async function updateAssignment(lessonBlockId, assignmentId, trackDetail,
                                       realtimeComms?:any, processUpdate: any, assignmentBlocks: any, assignment: any) {
    if (isStudent()) {
        const dataProvider = window.swanAppFunctions.dataProvider;
        const {status: userStatus, fenPosition, mcq, answer, numPly, action} = trackDetail;
        try {
            if (assignmentId) {
                if (!assignmentBlocks || assignmentBlocks.length === 0) {
                    console.error('Assignment Blocks not found for ' + assignmentId);
                    return;
                }
                const assignmentBlock = assignmentBlocks.find(
                    (ab) => parseInt(ab.lesson_block_id) ===  parseInt(lessonBlockId));

                if (!assignmentBlock) {
                    //This block is not found in assignment blocks, Might be is a plain block, so ignored
                    console.log('Block is not found in assignment blocks, so ignored for update: ', lessonBlockId);
                    return;
                }
                
                const currentDate = new Date();
                const updatePayload: any = {
                    last_accessed_date: currentDate,
                    fen_position: fenPosition,
                    mcq,
                    answer
                };

                // This is a hack
                // Delayed the server before the complete call update.
                if (assignmentBlock.status == AssignmentBlockStatus.COMPLETED && !userStatus) {
                    await new Promise((resolve) => setTimeout(resolve, 200));
                }
                if (assignmentBlock.status == AssignmentBlockStatus.NOT_STARTED && !userStatus) {
                    updatePayload.status = AssignmentBlockStatus.IN_PROGRESS
                } else {
                    updatePayload.status = userStatus;
                }
                if (assignmentBlock.started_date == null) {
                    updatePayload["started_date"] = currentDate;
                }
                if (userStatus == AssignmentBlockStatus.COMPLETED || userStatus == AssignmentBlockStatus.CHECK_PENDING) {
                    updatePayload["completed_date"] = currentDate;
                }
                if (action == "restart" && assignmentBlock.status && assignmentBlock.status !== AssignmentBlockStatus.COMPLETED) {
                    updatePayload["retry_count"] = (assignmentBlock["retry_count"] || 0) + 1;
                }
                //NOTE: This early assignment allows paralell calls to have up to date assignmentBlock
                Object.assign(assignmentBlock, updatePayload);

                realtimeComms?.publish(`assignment_blocks/${assignmentId}`, {
                    action: "update",
                    block: assignmentBlock,
                });
                const {data: block} = await dataProvider.update('assignment_blocks', {
                    id: assignmentBlock.id,
                    data: updatePayload
                })
                Object.assign(assignmentBlock, block);
                const isOddNumber = numPly % 2 !== 0; // Bypass the Assignments update for System move
                if (userStatus === AssignmentBlockStatus.COMPLETED || userStatus === AssignmentBlockStatus.CHECK_PENDING || isOddNumber) {
                    await updateAssignmentCountAndStatus(assignmentId, assignmentBlocks, userStatus, processUpdate, assignment, realtimeComms);
                }
                console.log(`Assignment Block ${block.id} marked as ${block.status}.`);
            } else {
                console.error(`Assignment not found.`);
            }
        } catch (error) {
            remoteLog("Error updating assignment", error)
            console.error("Error updating assignment: ", error)
        }

        //TODO Once all assignments of the class are completed, set the student's enrollment status to completed
    }
}

async function updateAssignmentCountAndStatus(assignmentId, assignmentBlocks, blockStatus, postAssignmentCallback, assignment, realtimeComms) {
    const totalAssignment = assignmentBlocks.length;
    const completed = assignmentBlocks
        .filter(ab => [AssignmentBlockStatus.COMPLETED, AssignmentBlockStatus.IN_CORRECT, AssignmentBlockStatus.CHECK_PENDING].includes(ab.status));
    const isIncorrect = assignmentBlocks.some((block) => block.status === AssignmentBlockStatus.IN_CORRECT);
    const isCheckPending = assignmentBlocks.some((block) => block.status === AssignmentBlockStatus.CHECK_PENDING);
    const totalCompletedBlocksCount = completed.length;

    let assignmentPayload: any = {
        status: AssignmentBlockStatus.IN_PROGRESS,
        last_accessed_date: new Date(),
        completed_blocks: totalCompletedBlocksCount
    }

    if (totalAssignment == totalCompletedBlocksCount) {
        assignmentPayload.completed_date = new Date();
        if (isIncorrect) {
            assignmentPayload.status = AssignmentBlockStatus.IN_CORRECT;
        } else if (isCheckPending) {
            assignmentPayload.status = AssignmentBlockStatus.CHECK_PENDING;
        } else {
            assignmentPayload.status = AssignmentBlockStatus.COMPLETED;
        }
    }
    const updatedAssignment = {...assignment, ...assignmentPayload};
    if (blockStatus == AssignmentBlockStatus.COMPLETED || blockStatus == AssignmentBlockStatus.CHECK_PENDING ) {
        realtimeComms?.publish(`assignments/${assignmentId}`, {
            action: "update",
            assignment: updatedAssignment,
        });
    }
    await postAssignmentCallback?.(updatedAssignment);
    await updateAssignmentStatus(assignmentId, assignmentPayload);

}

const sendStudentsAssignmentEmail = async (teachingMode: string, className: string, students: any, assignments: any) => {
    try {
        const host = window.location.origin;
        if (teachingMode === TeachingMode.IN_PERSON) {
            const emailPromises = students.map((student) => {
                const assignment = assignments.find((a: any) => a.student_id === student.id);
                const assignmentUrl = `/#/assignments/${assignment.tenant_id}/${assignment?.unique_direct_assignment_identifier}`;
                const messageTemplate = getStudentAssignmentEmailTemplate(className, student.user.fullName, assignmentUrl);
                return sendEmail({
                    to: student.user.email,
                    ...messageTemplate
                })
            });
            await Promise.all(emailPromises);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        remoteLog("Error sending on sendStudentsAssignmentEmail: ", error);
    }
};

export const assignAssignments = async (classProgress: any, classData: any, teachingMode: any, students: any, isAssessment: boolean) => {
    try {
        const dataProvider = window.swanAppFunctions.dataProvider
        if (students.length == 0) {
            throw new Error("Unexpected error. assign for Students called with empty array")
        }
        let {data: lessonBlockMappings} = await dataProvider.getList('lesson_block_mapping', {
            filter: { lesson_id: classProgress.lesson_id }, pagination: { page: 1, perPage: 10000 },
            meta: { scopingEscapeHatch: true, prefetch:['lesson_blocks'] }
        })
        lessonBlockMappings = lessonBlockMappings.filter(lesson => {
            const block = lesson?.lesson_block;
            if (!block) return false;
            if (block.block_type === 'pgn') {
                return false;
            }
            if (block.block_type === 'animated_tutorial') {
                return block.animated_tutorial && block.animated_tutorial.trim() !== "";
            }
            return true;
        }); 
        const assignments: any = [];
        const assignmentPromises = students.map(async (student) => {
            const uniqueDirectAssignmentId = teachingMode === TeachingMode.IN_PERSON ? uuidv4() : null;
            const assignmentData =  {
                class_id: classProgress.class_id,
                lesson_id: classProgress.lesson_id,
                student_id: student.id,
                unique_direct_assignment_identifier: uniqueDirectAssignmentId,
                assigned_timestamp: new Date(),
                status: AssignmentStatus.NOT_STARTED,
                total_blocks: lessonBlockMappings?.length,
                completed_blocks: 0,
                is_assessment: isAssessment || false,
            };
            const { data: assignment } = await dataProvider.create('assignments', {data: assignmentData});
            assignments.push(assignment);
            const assignmentId = assignment.id;

            // Create all valid assignment_blocks in parallel
            const blockPromises = lessonBlockMappings.map(lesson => {
                    const blockData = {
                        assignment_id: assignmentId,
                        lesson_block_id: lesson.lesson_block_id,
                        status: AssignmentBlockStatus.NOT_STARTED
                    }
                    return dataProvider.create('assignment_blocks', { data: blockData });
                });

            await Promise.all(blockPromises);
        });
        await Promise.all(assignmentPromises);
        await dataProvider.update('class_progress', {
            id: classProgress.id,
            data: {...classProgress, is_assigned: true}
        })
        await sendStudentsAssignmentEmail(teachingMode, classData.name, students, assignments);
    } catch (error) {
        remoteLog("Error sending on assignAssignments: ", error);
    }
}

export async function updateAssignmentTimeSpent(assignmentId: number, timeSpent: number | null, lastTimeSpent: number | string) {
    try {
        if (!timeSpent) return;
        const dataProvider = window.swanAppFunctions.dataProvider;
        let finalActiveTimeInSec = timeSpent;
        if (lastTimeSpent) {
            finalActiveTimeInSec += Number(lastTimeSpent);
        }
        await dataProvider.update('assignments', {
            id: assignmentId,
            data: { time_spent: finalActiveTimeInSec },
        });
    
    } catch (error) {
        remoteLog(`Error updating assignment Time Spent: ${error}`)
        console.error(`Error updating assignment Time Spent: ${error}`)
    }
}

export async function getAssignmentById(assignmentId: number) {
    try {
        const dataProvider = window.swanAppFunctions.dataProvider;
        const {data: assignment} = await dataProvider.getOne('assignments', { id: assignmentId });
        return assignment;
    } catch (err) {
        console.error("Failed to getAssignmentById: ", err)
        remoteLog("Error sending on getAssignmentById: ", err);
    }
}

export async function getAssignmentBlocksByAssignmentId(assignmentId: number) {
    try {
        const dataProvider = window.swanAppFunctions.dataProvider;
        const {data: assignmentBlocks} = await dataProvider.getList('assignment_blocks', {
            filter: {
                assignment_id: Number(assignmentId),
            },
        });
        return assignmentBlocks;
    } catch (err) {
        console.error("Failed to getAssignmentBlocksByAssignmentId: ", err)
        remoteLog("Error sending on getAssignmentBlocksByAssignmentId: ", err);
    }
}

export async function getClassProgressWithClassIdAndLessonId(classId: number, lessonId: number) {
    const dataProvider = window.swanAppFunctions.dataProvider;
    try {
        const {data: classProgress} = await dataProvider.getList("class_progress", {
            filter: {
                lesson_id: lessonId,
                class_id: classId
            },
            meta : {prefetch: ['lessons', "background_music"], scopingEscapeHatch: true},
        });
        return classProgress[0];
    } catch (err) {
        console.error("Failed to getClassProgressWithClassIdAndLessonId: ", err)
        remoteLog("Error sending on getClassProgressWithClassIdAndLessonId: ", err);
    }
}


