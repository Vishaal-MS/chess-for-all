import { getStudentsForClient} from "./students";
import {getClassesForCoach} from "./classes";
import {getEnrollmentsForStudents, getStudentsForClasses} from "./enrollments";
import { remoteLog } from "@mahaswami/vc-frontend";

export async function addClientDetails(dataProvider, topClients) {
    try {
        //For Each record in topClients add classes and students property
        topClients.map(async (client) => {
            const students = await getStudentsForClient(dataProvider, client.id);
            client.students = students ? students.size.toString() : '0';
            const studentIds = Array.from(students);
            const enrollments = await getEnrollmentsForStudents(dataProvider, studentIds);
            const classIds = new Set(enrollments.map(enrollment => enrollment.class_id));
            const classes = Array.from(classIds);
            client.classes = classes ? classes.length.toString() : "0";
        });
        return topClients;
    } catch (error) {
        remoteLog("Error sending on addClientDetails: ", error);
    }
}

export async function addCoachDetails(dataProvider, topCoaches) {
    try {
        //For Each record in topClients add classes and students property
        topCoaches.map(async (coach) => {
            const classes = await getClassesForCoach(dataProvider, coach.id);
            coach.classes = classes ? classes.length.toString() : '0';
            const class_ids = classes.map(classRecord => classRecord.id);
            const students = await getStudentsForClasses(dataProvider, class_ids);
            coach.students = students ? students.length.toString() : '0';
        });
        return topCoaches;
    } catch (error) {
        remoteLog("Error sending on addCoachDetails: ", error);
    }
}