import { remoteLog } from "@mahaswami/vc-frontend";

export const getStudentIdsByEnrollments = async (record: any, classId: number) => {
    try {
        const dataProvider = window.swanAppFunctions.dataProvider;
        const  onlyUnique = (value, index, array) =>  {
            return array.indexOf(value) === index;
        }
        const {data: enrollments} = await dataProvider.getList('enrollments', { filter: { class_id: classId }})
        const enrollmentsStudentIds = enrollments.map((student: any) => student.student_id).filter(onlyUnique);
        const {data: assignments} =  await dataProvider.getList("assignments",{filter: {class_id: classId, lesson_id: record.lesson_id }})
        const assignedStudentIdsData = assignments.map((student: any) => student.student_id).filter(onlyUnique);
        const studentIds = enrollmentsStudentIds.filter((studentId: any) => !assignedStudentIdsData.includes(studentId));
        return {
            student_ids: studentIds,
            assigned_student_data_count: assignedStudentIdsData.length
        };
    } catch (error) {
        remoteLog("Error sending on getStudentIdsByEnrollments: ", error);
    }
}


