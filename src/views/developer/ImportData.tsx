import {Box, FormControl, IconButton, InputLabel, MenuItem, Select, Typography} from "@mui/material";
import {DragAndDropCsvFile} from "../common/dragAndDropCsvFile.tsx";
import {useState} from "react";
import {Button, Loading, useNotify} from "react-admin";
import {
    currentTenantId,
    getStandardId,
    isAnySchoolFlavorActive,
    isRegularSchoolFlavored, isSchoolStandardLinked
} from "../../businessLogic.ts";
import {removeLocalStorage, setLocalStorage} from "@mahaswami/vc-frontend";
import DownloadIcon from "@mui/icons-material/Download";
import { saveAs } from "file-saver";
import {assignmentsCSV, enrollmentsCSV, classProgressCSV, classesCSV, studentsCSV, clientsCSV, curriculumCSV,
         curriculumLessonsCSV, lessonsCSV, lessonBlocksCSV} from '../sample_files/demo_data_files'

export const ImportData = () => {
    const [curriculumData, setCurriculumData] = useState(null);
    const [curriculumLessonsData, setCurriculumLessonsData] = useState(null);
    const [clientsData, setClientsData] = useState(null);
    const [studentsData, setStudentsData] = useState(null);
    const [classesData, setClassesData] = useState(null);
    const [enrollmentsData, setEnrollmentsData] = useState(null);
    const [classProgressData, setClassProgressData] = useState(null);
    const [assignmentsData, setAssignmentsData] = useState(null);
    const [lessonData,  setLessonData] = useState(null);
    const [lessonBlocksData, setLessonBlocksData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState('');
    const notify = useNotify();

    if (loading) {
        return (<Loading />);
    }

    const requiredColumns = {
        curriculum: ['name'],
        curriculumLessons: ['curriculum_name', 'lesson_name'],
        clients: ['name', 'email'],
        students: ['client_name', 'first_name', 'last_name', 'email', 'gender', 'date_of_birth'],
        classes: ['name', 'start_date', 'end_date', 'teaching_mode_name'],
        enrollments: ['class_name', 'student_email'],
        classProgress: ['class_name', 'lesson_name', 'status', 'start_date', 'is_assigned'],
        assignments: ['class_name', 'lesson_name', 'student_email', 'status', 'assigned_timestamp'],
        lessons: ['name', 'content', 'language'],
        lessonBlocks: ['name', 'block_type', 'is_game_engine_active', 'starting_board', 'board_title', 'animated_tutorial', 'goals'],
    }
    const getDateFromOffset = (input) => {
        const now = new Date();
        if ((typeof input === "number" && !isNaN(input)) || (typeof input === "string" && !isNaN(Number(input)) && input.trim() !== "")) {
            const offset = Number(input);
            const date = new Date();
            date.setDate(date.getDate() + offset);
            return date.toISOString();
        }
        if (typeof input === "string") {
            const date = new Date(input);
            if (!isNaN(date.getTime())) {
                return date.toISOString();
            }
        }
        return now.toISOString();
    };

    function chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    async function processInBatches(items, batchSize, processor) {
        const chunks = chunkArray(items, batchSize);
        for (const batch of chunks) {
            await Promise.all(batch.map(item => processor(item)));
        }
    }

    const classValidation = async (classes, subscribers, subscribables, curriculums) => {
        const dataProvider = window.swanAppFunctions.dataProvider;
        // check duplicate className in classesData
        if (classesData && classesData.length > 0) {
            const classNames = classesData.map(c => c.name?.toLowerCase());
            const duplicateClasses = classNames.filter((item, index) => classNames.indexOf(item) !== index);
            if (duplicateClasses.length > 0) {
                console.error("Duplicate class names found ", duplicateClasses);
                notify(`Duplicate class names found: ${duplicateClasses.join(', ')}`, {type: "error"});
                return true;
            }
        }
        // check duplicate enrollmentsData
        if(enrollmentsData && enrollmentsData?.length > 0) {
            const enrollmentNames = enrollmentsData?.map(e => e.class_name?.toLowerCase() + e.student_email?.toLowerCase());
            const duplicateEnrollments = enrollmentNames.filter((item, index) => enrollmentNames.indexOf(item) !== index);
            if (duplicateEnrollments.length > 0) {
                console.error("Duplicate enrollments found", duplicateEnrollments);
                notify(`Duplicate enrollments found: ${duplicateEnrollments.join(', ')}`, {type: "error"});
                return true;
            }
        }
        // check duplicate classProgressData
        if(classProgressData && classProgressData?.length > 0) {
            const progressNames = classProgressData?.map(p => p.class_name?.toLowerCase() + p.lesson_name?.toLowerCase());
            const duplicateProgress = progressNames.filter((item, index) => progressNames.indexOf(item) !== index);
            if (duplicateProgress.length > 0) {
                console.error(`Duplicate class progress found`, duplicateProgress)
                notify(`Duplicate class progress found: ${duplicateProgress.join(', ')}`, {type: "error"});
                return true;
            }
        }
        // check duplicate assignmentsData
        if(assignmentsData && assignmentsData.length > 0) {
            const assignmentNames = assignmentsData?.map(a => a.class_name?.toLowerCase() + a.lesson_name?.toLowerCase() + a.student_email?.toLowerCase());
            const duplicateAssignments = assignmentNames.filter((item, index) => assignmentNames.indexOf(item) !== index);
            if (duplicateAssignments.length > 0) {
                console.error(`Duplicate assignments found`, duplicateAssignments)
                notify(`Duplicate assignments found: ${duplicateAssignments.join(', ')}`, {type: "error"});
                return true;
            }
        }
        // check Invalid class names in enrollmentsData from classesData
        if (enrollmentsData && enrollmentsData.length > 0 && classesData && classesData.length > 0) {
            const classNames = classesData.map(c => c.name?.toLowerCase());
            const enrollmentClassNames = enrollmentsData.map(e => e.class_name?.toLowerCase());
            const invalidEnrollments = enrollmentClassNames.filter(name => !classNames.includes(name));
            if (invalidEnrollments.length > 0) {
                console.error(`Invalid class names in enrollments`, invalidEnrollments)
                notify(`Invalid class names in enrollments: ${invalidEnrollments.join(', ')}`, {type: "error"});
                return true;
            }
        }
        // check Invalid class names in classProgressData from classesData
        if (classProgressData && classProgressData.length > 0 && classesData && classesData.length > 0) {
            const classNames = classesData.map(c => c.name?.toLowerCase());
            const progressClassNames = classProgressData.map(p => p.class_name?.toLowerCase());
            const invalidProgress = progressClassNames.filter(name => !classNames.includes(name));
            if (invalidProgress.length > 0) {
                console.error(`Invalid class names in class progress`, invalidProgress)
                notify(`Invalid class names in class progress: ${invalidProgress.join(', ')}`, {type: "error"});
                return true;
            }
        }
        // check Invalid class names in assignmentsData from classesData
        if (assignmentsData && assignmentsData.length > 0 && classesData && classesData.length > 0) {
            const classNames = classesData.map(c => c.name?.toLowerCase());
            const assignmentClassNames = assignmentsData.map(a => a.class_name?.toLowerCase());
            const invalidAssignments = assignmentClassNames.filter(name => !classNames.includes(name));
            if (invalidAssignments.length > 0) {
                console.error(`Invalid class names in assignments`, invalidAssignments)
                notify(`Invalid class names in assignments: ${invalidAssignments.join(', ')}`, {type: "error"});
                return true;
            }
        }

        const {data: students} = await dataProvider.getList('students', {
                pagination: {page: 1, perPage: 10000},
                meta: {prefetch: ['users']}
            });
        const {data: classProgressRecords} = await dataProvider.getList('class_progress', {
            pagination: {page: 1, perPage: 100000},
            meta: {prefetch: ['lessons', 'classes']}
        });
        const {data: enrollmentsRecords} = await dataProvider.getList('enrollments', {
            pagination: {page: 1, perPage: 100000},
            meta: {prefetch: ['students', 'classes']}
        });

        // check classesData existing_name contain in classes name, if not contain throw error
        if (classesData && classesData.length > 0) {
            const classNames = classes.map(c => c.name?.toLowerCase());
            const classDataExistNames = classesData.map(c => c.existing_name?.toLowerCase().trim()).filter(name => name);
            const invalidClasses = classDataExistNames.filter(name => !classNames.includes(name));
            if (invalidClasses.length > 0) {
                console.error(`Classes exist name not found`, invalidClasses)
                notify(`Classes exist name not found: ${invalidClasses.join(', ')}`, {type: "error"});
                return true;
            }
            // check classesData name contain in classes name, if contain throw error
            const classDataNames = classesData.filter(record => !record.existing_name).map(c => c.name?.toLowerCase());
            const invalidClassesData = classNames.filter(name => classDataNames.includes(name));
            if (invalidClassesData.length > 0) {
                console.error(`Class name already exist`, invalidClassesData)
                notify(`Class name already exist: ${invalidClassesData.join(', ')}`, {type: "error"});
                return true;
            }
        }

        if(enrollmentsData?.length > 0 && enrollmentsRecords && enrollmentsRecords.length > 0 && students && students.length > 0) {
            const enrollmentClassNames = enrollmentsData.map(c => c.class_name?.toLowerCase().trim());
            // Merge enrollmentsRecords with user info from students
            const customizedEnrollments = enrollmentsRecords
                .filter(e => enrollmentClassNames.includes(e.class?.name?.toLowerCase()))
                .map(enroll => {
                    const foundStudent = students.find(s => s.id === enroll.student?.id);
                    if (foundStudent?.user) {
                        return { ...enroll, user: foundStudent.user };
                    }
                    return null;
                }).filter(Boolean);
            const classEnrollmentMap = new Map();
            customizedEnrollments.forEach(enroll => {
                const className = enroll.class?.name?.toLowerCase();
                const studentEmail = enroll.user?.email?.toLowerCase().trim();

                if (!className || !studentEmail) return;

                if (!classEnrollmentMap.has(className)) {
                    classEnrollmentMap.set(className, new Set());
                }
                classEnrollmentMap.get(className).add(studentEmail);
            });
            const enrollmentsByClass = {};
            for (const [className, emailSet] of classEnrollmentMap.entries()) {
                enrollmentsByClass[className] = Array.from(emailSet);
            }
            const AlreadyExistEnrollments = [];
            enrollmentsData.forEach(enroll => {
                const className = enroll.class_name?.toLowerCase().trim();
                const studentEmail = enroll.student_email?.toLowerCase().trim();
                if (enrollmentsByClass[className]) {
                    const emails = enrollmentsByClass[className];
                    if (emails.includes(studentEmail)) {
                        AlreadyExistEnrollments.push(`className: ${className}, studentEmail: ${studentEmail}`);
                    }
                }
            });
            if (AlreadyExistEnrollments.length > 0) {
                console.error(`Enrollments already exist`, AlreadyExistEnrollments)
                notify(`Enrollments already exist: ${AlreadyExistEnrollments.join(', ')}`, {type: "error"});
                return true;
            }
        }
        if(classProgressData && classProgressData.length > 0 && classProgressRecords && classProgressRecords.length > 0) {
            const classProgressMap = new Map();
            classProgressRecords.forEach(progress => {
                const className = progress.class?.name?.toLowerCase();
                const lessonName = progress.lesson?.name?.toLowerCase();
                if (!className || !lessonName) return;

                if (!classProgressMap.has(className)) {
                    classProgressMap.set(className, []);
                }
                classProgressMap.get(className).push(lessonName);
            });
            const lessonsByClass = {};
            for (const [className, lessonSet] of classProgressMap.entries()) {
                lessonsByClass[className] = Array.from(lessonSet);
            }
            const alreadyExitProgress = [];
            classProgressData.forEach(progress => {
                const className = progress.class_name?.toLowerCase().trim();
                const lessonName = progress.lesson_name?.toLowerCase().trim();
                if (lessonsByClass[className]) {
                    const lessons = lessonsByClass[className];
                    if (lessons.includes(lessonName)) {
                        alreadyExitProgress.push(`className: ${className}, lessonName: ${lessonName}`);
                    }
                }
            });
            if (alreadyExitProgress.length > 0) {
                console.error(`Class progress already exist`, alreadyExitProgress)
                notify(`Class progress already exist: ${alreadyExitProgress.join(', ')}`, {type: "error"});
                return true;
            }
        }

        if (enrollmentsData && enrollmentsData.length > 0 && students) {
            if(!students || students.length === 0) {
                notify(`Students not exist`, {type: "error"});
                console.error(`Students not exist`)
                return true;
            }
            const studentEmails = students.map(s => s.user.email?.toLowerCase());
            const enrollmentStudentEmails = enrollmentsData.map(e => e.student_email?.toLowerCase().trim());
            const invalidEnrollments = enrollmentStudentEmails.filter(email => !studentEmails.includes(email));
            if (invalidEnrollments.length > 0) {
                console.error(`Enrollments student email does not exist`, invalidEnrollments)
                notify(`Enrollments student email does not exist: ${invalidEnrollments.join(', ')}`, {type: "error"});
                return true;
            }
        }
        // checking classProgressData curriculum_name exist and lesson name exist in curriculumLessons
        if (classProgressData && classProgressData.length > 0 && curriculums) {
            if(curriculums?.length === 0 && subscribers?.length === 0) {
                notify(`Curriculums not exist`, {type: "error"});
                console.error(`Curriculums not exist`)
                return true;
            }
            const progressCurriculumNames = classProgressData.map(p => p.curriculum_name?.toLowerCase());
           let fetchedCurriculumLessons = [];
            let unqiueCurriculumIds = [];
            if((subscribers?.length > 0 && subscribables?.length > 0) || curriculums?.length > 0) {
                // check progressCurriculumNames exist in curriculums name
                const curriculumNames = [...curriculums.map(c => c.name?.toLowerCase()), ...subscribables.filter(s => s.curriculum_id)
                        .map(s => s.name?.toLowerCase())];
                const invalidCurriculums = progressCurriculumNames.filter(name => !curriculumNames.includes(name));
                if (invalidCurriculums.length > 0) {
                    console.error(`ClassProgress curriculum name does not exist in curriculum`, invalidCurriculums)
                    notify(`Invalid curriculum names in class progress: ${invalidCurriculums.join(', ')}`, {type: "error"});
                    return true;
                }
                const curriculumIds = subscribables.filter(s => s.curriculum_id).map(s => s.curriculum_id);
                const fetchedCurriculumsIds = curriculums.filter(c => progressCurriculumNames.includes(c.name?.toLowerCase())).map(c => c.id).filter(Boolean);
                unqiueCurriculumIds = [...new Set([...curriculumIds, ...fetchedCurriculumsIds])]
            }
            const {data: curriculumLessons} = await dataProvider.getList('curriculum_lessons', {
                filter: {curriculum_id: unqiueCurriculumIds},
                pagination: {page: 1, perPage: 100000},
                meta: {scopingEscapeHatch: true, prefetch: ['curriculum', 'lessons']}
            });
            fetchedCurriculumLessons = curriculumLessons;
            if (fetchedCurriculumLessons && fetchedCurriculumLessons.length > 0) {
                const curriculumMap = new Map();
                const invalidProgressLessons = [];
                progressCurriculumNames.forEach(curriculum => {
                    if(fetchedCurriculumLessons?.some(cl => cl.curriculum.name?.toLowerCase() === curriculum?.toLowerCase())) {
                        const curriculumLesson = fetchedCurriculumLessons.filter(cl => cl.curriculum.name?.toLowerCase() === curriculum?.toLowerCase());
                        curriculumMap.set(curriculum, curriculumLesson);
                    } else {
                        curriculumMap.set(curriculum, []);
                    }
                })

                classProgressData?.forEach(classProgress => {
                    const curriculumName = classProgress.curriculum_name?.toLowerCase();
                    if (curriculumMap.has(curriculumName)) {
                        const lessonName = classProgress.lesson_name?.toLowerCase();
                        const curriculumLessonObj = curriculumMap.get(curriculumName)
                        const curriculumLessonObjName = curriculumLessonObj?.map(c => c.lesson?.name?.toLowerCase());
                        if (!curriculumLessonObjName.includes(lessonName)) {
                            invalidProgressLessons.push(`Curriculum name: ${curriculumName}, Lesson name: ${lessonName}`);
                        }
                    }
                })
                if (invalidProgressLessons.length > 0) {
                    console.error(`Class progress lesson name does not exist in curriculum/Subscribed curriculum`, invalidProgressLessons)
                    notify(`Invalid lesson names in class progress:\n ${invalidProgressLessons.join('\n')}`, {type: "error",multiLine: true});
                    return true;
                }
            }
        }
        // check assignmentsData lesson name exist in classProgressData lesson_name
        if (assignmentsData && assignmentsData.length > 0 && classProgressData && classProgressData.length > 0) {
            const progressLessonNames = classProgressData.map(p => p.lesson_name?.toLowerCase());
            const assignmentLessonNames = assignmentsData.map(a => a.lesson_name?.toLowerCase().trim());
            const invalidAssignments = assignmentLessonNames.filter(name => !progressLessonNames.includes(name));
            if (invalidAssignments.length > 0) {
                console.error(`Assignments lesson name does not exist in class progress`, invalidAssignments)
                notify(`Invalid lesson names in assignments: ${invalidAssignments.join(', ')}`, {type: "error"});
                return true;
            }
        }

        // check assignmentsData student email exist in students user.email
        if (assignmentsData && assignmentsData.length > 0 && students && students.length > 0) {
            const studentEmails = students.map(s => s.user.email?.toLowerCase());
            const assignmentStudentEmails = assignmentsData.map(a => a.student_email?.toLowerCase().trim());
            const invalidAssignments = assignmentStudentEmails.filter(email => !studentEmails.includes(email));
            if (invalidAssignments.length > 0) {
                console.error(`Assignments student email does not exist`, invalidAssignments)
                notify(`Assignments student email does not exist: ${invalidAssignments.join(', ')}`, {type: "error"});
                return true;
            }
        }
        return false
    }

    // Handle Student Import
    const handleStudentImport = async (studentsData, clients) => {
        const dataProvider = window.swanAppFunctions.dataProvider;

        let errorMessages: string[] = [];
        const clientStandardMap = new Map();
        const clientNameMap = new Map();

        const handleError = () => {
            if (errorMessages.length > 0) {
                notify(errorMessages.join("\n"), {type: "error", multiLine: true});
            }
        };

        const {data: grades} = await dataProvider.getList("standard_grades", {
            pagination: {page: 1, perPage: 10000},
            meta: {scopingEscapeHatch: true}
        });
        const {data: existingStudents} = await dataProvider.getList("students", {
            pagination: {page: 1, perPage: 100000},
            meta: {prefetch: ["users"]}
        });

        const updateStudents = studentsData?.filter(s => s.existing_email); // Update Students
        const newStudents = studentsData?.filter(s => (s.email && !s.existing_email)); // Create Students
        const newCount = newStudents?.length || 0;
        const updateCount = updateStudents?.length || 0;

        if ((newCount + updateCount) !== studentsData.length) {
            errorMessages.push("Import Data Missing Required Values (Email or Existing Student Email)");
            handleError()
            return false;
        }

        // Finding email duplicate with in import data.
        const findDuplicateValuesByKey = (data: any, key: string) => {
            const emails = data.map(s => s[key]).filter(Boolean);
            return emails.filter((value, index) => emails.indexOf(value) !== index);
        };
        [
            {label: "Student Emails", values: findDuplicateValuesByKey(studentsData, "email")},
            {label: "Student Existing Emails", values: findDuplicateValuesByKey(studentsData, "existing_email")},
            {label: "Parent Emails", values: findDuplicateValuesByKey(studentsData, "parent_user_email")},

        ].forEach(({label, values}) => {
            if (values.length > 0) {
                if (errorMessages.length === 0) {
                    errorMessages.push("Import data contains duplicate Emails");
                }
                errorMessages.push(`${label}: ${values.join(", ")}`);
            }
        });

        if (errorMessages.length > 0) {
            handleError();
            return false;
        }

        // Finding duplicate e-mails already exist
        const findDuplicatesStudentInExisting = (list: any) => {
            return list.map(s => s?.email).filter(Boolean).filter(value => existingStudents.some(student => student?.user?.email === value));
        };
        const findDuplicatesParentInExisting = (list: any) => {
            return list.map(s => s?.parent_user_email).filter(Boolean).filter(value => existingStudents.some(student => student?.parent_user?.email === value));
        };
        const findNotExistUsers = (list: any) => {
            return list.map(s => s?.existing_email).filter(Boolean).filter(value => !existingStudents.some(student => student?.user?.email === value));
        };

        [
            {label: "Student Emails", values: findDuplicatesStudentInExisting(studentsData)},
            {
                label: "Parent Emails",
                values: findDuplicatesParentInExisting(studentsData)
            },
            {label: "Update Users Not Found Emails", values: findNotExistUsers(updateStudents)},
        ].forEach(({label, values}) => {
            console.log("Duplicated : ", label, values);
            if (values.length > 0) {
                if (errorMessages.length === 0) {
                    errorMessages.push("Data Already Exist");
                }
                errorMessages.push(`${label}: ${values.join(", ")}`);
            }
        });

        if (!isRegularSchoolFlavored()) {
            const invalidClientNames = studentsData.map(s => s?.client_name)
                .filter(name => !clients.some(c => c.name === name) && name?.toLowerCase() !== "self");

            if (invalidClientNames.length > 0) {
                errorMessages.push(`Invalid Client Names: ${invalidClientNames.join(", ")}`);
                handleError();
                return false;
            }

            clients.forEach(client => {
                const key = client.id;
                if (!clientNameMap.has(key)) {
                    clientNameMap[client.name] = client.id;
                }
                if (client.standard_id && !clientStandardMap.has(client.name)) {
                    clientStandardMap[client.name] = client.standard_id;
                }
            })
        }

        if (errorMessages.length > 0) {
            handleError();
            return false;
        }

        const studentsWithMode = studentsData.map(s => {
            if (s.existing_email) {
                return {...s, mode: "UPDATE"};
            }
            if (s.email && !s.existing_email) {
                return {...s, mode: "CREATE"};
            }
            return s;
        });
        await processInBatches(studentsWithMode, 25, async (student) => {
            try {
                const isCreateMode = student?.mode === "CREATE";
                let existingStudent;
                if (!isCreateMode) {
                    existingStudent = existingStudents.find(s => s.user.email === student.existing_email);
                }
                const clientId = isRegularSchoolFlavored() ? clients[0]?.id : clientNameMap[student.client_name];
                if (student.grade_code && grades.length > 0) {
                    const standardId = isRegularSchoolFlavored() ? clients[0]?.standard_id : clientStandardMap[student.client_name];
                    student.standard_grade_id = grades.filter(g => g.standard_id === standardId).find(g => g.code === student.grade_code && g.standard_id === standardId)?.id || null;
                }
                student.user = {
                    first_name: student.first_name,
                    last_name: student.last_name,
                    email: student.email || student.existing_email,
                };
                student.parent_user = {
                    first_name: student.parent_first_name,
                    last_name: student.parent_last_name,
                    email: student.parent_user_email
                };
                student.is_integrated_parental_engagement = String(student?.is_integrated_parental_engagement)?.toLowerCase() === 'true';
                student.emergency_contact = student?.emergency_contact || null;
                student.phone_number = student?.phone_number || null;
                student.method_of_going_home = student?.method_of_going_home || null;

                const { mode, existing_email, parent_user_email, client_name,
                        parent_last_name, parent_first_name, ...studentPayload  } = student;

                const studentName = student.first_name?.trim() + " " + student.last_name?.trim();
                if (client_name?.toLowerCase() === 'self') {
                    studentPayload.client_type_id = 2; //Individual
                    studentPayload.name = studentName;
                    if (isCreateMode) {
                        await dataProvider.create('clients', {data: {...studentPayload, student: studentPayload}});
                    } else {
                        studentPayload.user_id = existingStudent.user.id;
                        studentPayload.parent_user_id = existingStudent?.parent_user?.parent_user_id || null;
                        await dataProvider.update('clients', {
                            id: existingStudent.client_id,
                            data: {...studentPayload, student: studentPayload}
                        });
                    }
                } else {
                    studentPayload.client_id = clientId;
                    if (isCreateMode) {
                        await dataProvider.create('students', {data: studentPayload});
                    } else {
                        studentPayload.user_id = existingStudent.user.id;
                        studentPayload.parent_user_id = existingStudent?.parent_user?.parent_user_id || null;
                        await dataProvider.update('students', {id: existingStudent.id, data: {...studentPayload}});
                    }
                }
            } catch (error) {
                setLoading(false);
                removeLocalStorage("is_mail_blocked");
                console.error(`Failed to create student: ${error}`);
                notify(`Failed to create student: ${error}`, {type: "error"});
                return false;
            }
        });
        return true;
    }
    const clientValidation = async (clients) => {
        if (clientsData && clientsData.length > 0) {
            // check duplicate client names
            const clientNames = clientsData.map(c => c.name?.toLowerCase());
            const duplicateClientName = clientNames.filter((item, index) => clientNames.indexOf(item) !== index);
            if (duplicateClientName.length > 0) {
                console.error("Duplicate client names found ", duplicateClientName);
                notify(`Duplicate client names found: ${duplicateClientName.join(', ')}`, {type: "error"});
                return true;
            }
            //check duplicate email
            const clientEmails = clientsData.map(c => c.email?.toLowerCase());
            const duplicateClientEmail = clientEmails.filter((item, index) => clientEmails.indexOf(item) !== index);
            if (duplicateClientEmail.length > 0) {
                console.error("Duplicate client emails found ", duplicateClientEmail);
                notify(`Duplicate client emails found: ${duplicateClientEmail.join(', ')}`, {type: "error"});
                return true;
            }
            // check clientsData email exist in clients
            if (clients && clients.length > 0) {
                const emailList = clientsData?.filter(c => c.existing_name === "").map(c => c.email?.toLowerCase());
                const existingClientEmails = clients.map(c => c.email?.toLowerCase());
                const invalidClients = emailList.filter(email => existingClientEmails.includes(email));
                if (invalidClients.length > 0) {
                    console.error(`Client emails already exist`, invalidClients)
                    notify(`Client emails already exist: ${invalidClients.join(', ')}`, {type: "error"});
                    return true;
                }
                const clientExistingNames = clientsData?.filter(c => c.existing_name !== "").map(c => c.existing_name?.toLowerCase());
                const clientNames = clients.map(c => c.name?.toLowerCase());
                const invalidExistingClients = clientExistingNames.filter(name => !clientNames.includes(name));
                if (invalidExistingClients.length > 0) {
                    console.error(`Exiting Client names not found`, invalidExistingClients)
                    notify(`Exiting Client names not found: ${invalidExistingClients.join(', ')}`, {type: "error"});
                    return true;
                }
                const clientDataNames = clientsData?.filter(record => !record.existing_name).map(c => c.name?.toLowerCase());
                const invalidClientsData = clientDataNames.filter(name => clientNames.includes(name));
                if (invalidClientsData.length > 0) {
                    console.error(`Client name already exist`, invalidClientsData)
                    notify(`Client name already exist: ${invalidClientsData.join(', ')}`, {type: "error"});
                    return true;
                }
            }
        }
        return false
    }

    const curriculumValidation = async (standardSections, coginitiveSkills, standards, curriculums,lessons, tenants) => {
        const dataProvider = window.swanAppFunctions.dataProvider;
        if (curriculumData && curriculumData.length > 0) {
            const curriculumNames = curriculumData.map(c => c.name?.toLowerCase());
            const duplicateCurriculumNames = curriculumNames.filter((item, index) => curriculumNames.indexOf(item) !== index);
            if (duplicateCurriculumNames.length > 0) {
                console.error("Duplicate curriculum names found ", duplicateCurriculumNames);
                notify(`Duplicate curriculum names found: ${duplicateCurriculumNames.join(', ')}`, {type: "error"});
                return true;
            }
        }
        if (curriculumLessonsData && curriculumLessonsData.length > 0) {
            const curriculumLessonNames = curriculumLessonsData.map(c => c.curriculum_name?.toLowerCase() + c.lesson_name?.toLowerCase());
            const duplicateCurriculumLessonNames = curriculumLessonNames.filter((item, index) => curriculumLessonNames.indexOf(item) !== index);
            if (duplicateCurriculumLessonNames.length > 0) {
                console.error("Duplicate curriculum lesson names found ", duplicateCurriculumLessonNames);
                notify(`Duplicate curriculum lesson names found: ${duplicateCurriculumLessonNames.join(', ')}`, {type: "error"});
                return true;
            }
        }
        // check curriculumLessonsData curriculum_name exist in curriculumData name
        if (curriculumLessonsData && curriculumLessonsData.length > 0 && curriculumData && curriculumData.length > 0) {
            const curriculumNames = curriculumData.map(c => c.name?.toLowerCase());
            const curriculumLessonCurriculumNames = curriculumLessonsData.map(c => c.curriculum_name?.toLowerCase().trim());
            const invalidCurriculumLessons = curriculumLessonCurriculumNames.filter(name => !curriculumNames.includes(name));
            if (invalidCurriculumLessons.length > 0) {
                console.error(`CurriculumLesson File curriculum_name does not exist in Curriculum`, invalidCurriculumLessons)
                notify(`CurriculumLesson File curriculum_name does not exist in Curriculum: ${invalidCurriculumLessons.join(', ')}`, {type: "error"});
                return true;
            }
        }

        const {data: curriculumLessons} = await dataProvider.getList('curriculum_lessons', {
            pagination: {page: 1, perPage: 100000},
            meta: {prefetch: ['curriculum', 'lessons']}
        });

        if (curriculumData && curriculumData.length > 0) {
            const curriculumNames = curriculums.map(c => c.name?.toLowerCase());
            const curriculumDataExistNames = curriculumData.map(c => c.existing_name?.toLowerCase().trim()).filter(name => name);
            const invalidCurriculumsExistName = curriculumDataExistNames.filter(name => !curriculumNames.includes(name));
            if (invalidCurriculumsExistName.length > 0) {
                console.error(`Curriculum exist name not found`, invalidCurriculumsExistName)
                notify(`Curriculum exist name not found: ${invalidCurriculumsExistName.join(', ')}`, {type: "error"});
                return true;
            }
            const curriculumDataNames = curriculumData.filter(record => !record.existing_name).map(c => c.name?.toLowerCase());
            const invalidCurriculums = curriculumNames.filter(name => curriculumDataNames.includes(name));
            if (invalidCurriculums.length > 0) {
                console.error(`Curriculum name already exist`, invalidCurriculums)
                notify(`Curriculum name already exist: ${invalidCurriculums.join(', ')}`, {type: "error"});
                return true;
            }
            if (standards && standards.length > 0) {
                const standardNames = standards.map(s => s.name?.toLowerCase());
                const curriculumStandardNames = curriculumData.map(c => c.standard_name?.toLowerCase());
                const invalidCurriculums = curriculumStandardNames.filter(name => !standardNames.includes(name));
                if (invalidCurriculums.length > 0) {
                    console.error(`Curriculum standard name does not exist`, invalidCurriculums)
                    notify(`Curriculum standard name does not exist: ${invalidCurriculums.join(', ')}`, {type: "error"});
                    return true;
                }
            }
        }
        if (curriculumLessonsData && curriculumLessonsData.length > 0) {
            // check curriculumLessonsData publisher_name exist in tenants or contain "self"
            const tenantNames = tenants ? tenants?.map(t => t.name?.toLowerCase()?.trim()) : []
            const curriculumPublisherNames = curriculumLessonsData?.map(c => c?.publisher_name?.toLowerCase()).filter(name => name && name !== 'self');
            const invalidCurriculumPublisherNames = curriculumPublisherNames.filter(name => !tenantNames.includes(name));
            if (invalidCurriculumPublisherNames.length > 0) {
                console.error(`Invalid publisher name. Use 'self' or [TENANT NAME].`, invalidCurriculumPublisherNames)
                notify(`Invalid publisher name. Use 'self' or [TENANT NAME]: ${invalidCurriculumPublisherNames.join(', ')}`, {type: "error"});
                return true;
            }
            if (!lessons || lessons.length === 0) {
                notify(`Lessons not exist`, {type: "error"});
                console.error(`Lessons not exist`)
                return true;
            }

            const currentId = currentTenantId();
            const invalidLessonName = [];
            for (const c of curriculumLessonsData) {
                const publisher = c.publisher_name?.toLowerCase();
                let tenantIdToCheck: number | null = null;
                if (publisher === "self") {
                    tenantIdToCheck = currentId;
                } else {
                    const tenant = tenants.find(t => t.name?.toLowerCase().trim() === publisher);
                    if (tenant) {
                        tenantIdToCheck = tenant.id;
                    }
                }
                const lessonNamesForTenant = lessons.filter(l => l?.tenant_id === tenantIdToCheck).map(l => l.name?.toLowerCase().trim());
                if (!lessonNamesForTenant.includes(c.lesson_name?.toLowerCase())) {
                    invalidLessonName.push(`Lesson Name: ${c.lesson_name?.toLowerCase()}, Publisher Name: ${c.publisher_name}`);
                }
            }
            if(invalidLessonName.length > 0) {
                console.error(`Invalid curriculum lessons:`, invalidLessonName)
                notify(`Invalid curriculum lessons: ${invalidLessonName.join(', ')}`, {type: "error"});
                return true;
            }
            const curriculumNames = curriculums.map(c => c.name?.toLowerCase());
            const curriculumDataNames = curriculumData ? curriculumData.map(c => c.name?.toLowerCase()) : [];
            const curriculumLessonCurriculumNames = curriculumLessonsData?.filter(cl => !curriculumDataNames.includes(cl.curriculum_name?.toLowerCase()))?.map(c => c.curriculum_name?.toLowerCase());
            const invalidCurriculumLessonsCurriculumNames = curriculumLessonCurriculumNames.filter(name => !curriculumNames.includes(name));
            if (invalidCurriculumLessonsCurriculumNames.length > 0) {
                console.error(`CurriculumLesson curriculum_name does not exist in Curriculum`, invalidCurriculumLessonsCurriculumNames)
                notify(`CurriculumLesson curriculum_name does not exist in Curriculum: ${invalidCurriculumLessonsCurriculumNames.join(', ')}`, {type: "error"});
                return true;
            }
            const curriculumLessonsMap = {};
            curriculumLessons.forEach((record) => {
                const curriculumName = record.curriculum.name?.toLowerCase();
                if (!curriculumLessonsMap[curriculumName]) {
                    curriculumLessonsMap[curriculumName] = [];
                }
                curriculumLessonsMap[curriculumName].push(record.lesson.name?.toLowerCase());
            });
            const invalidCurriculumLessonsLessons = [];
            curriculumLessonsData.forEach((record) => {
                const curriculumName = record.curriculum_name?.toLowerCase();
                const lessonName = record.lesson_name?.toLowerCase();
                if (curriculumLessonsMap[curriculumName] && curriculumLessonsMap[curriculumName].includes(lessonName)) {
                    invalidCurriculumLessonsLessons.push(`Curriculum Name: ${curriculumName}; Lesson name: ${lessonName}`);
                }
            });
            if (invalidCurriculumLessonsLessons.length > 0) {
                console.error(`Duplicate lesson(s) found in curriculum`, invalidCurriculumLessonsLessons)
                notify(`Duplicate lesson(s) found in curriculum: ${invalidCurriculumLessonsLessons.join(', ')}`, {type: "error"});
                return true;
            }
        }
        if (curriculumLessonsData && curriculumLessonsData.length > 0) {
            const cognitiveSkillNames = coginitiveSkills ? coginitiveSkills?.map(c => c.name?.toLowerCase()) : []
            const curriculumMappingCognitiveSkills = curriculumLessonsData.map(c => {
                return [c.mapping1_cognitive_skill_name?.toLowerCase(), c.mapping2_cognitive_skill_name?.toLowerCase(), c.mapping3_cognitive_skill_name?.toLowerCase()];
            }).flat().filter(name => name);
            const invalidCurriculumMappingCognitiveSkills = curriculumMappingCognitiveSkills.filter(name => !cognitiveSkillNames.includes(name));
            if (invalidCurriculumMappingCognitiveSkills.length > 0) {
                console.error(`Curriculum mapping cognitive skill name does not exist`, invalidCurriculumMappingCognitiveSkills)
                notify(`Curriculum mapping cognitive skill name does not exist: ${invalidCurriculumMappingCognitiveSkills.join(', ')}`, {type: "error"});
                return true;
            }

            const standardSectionCodes = standardSections ? standardSections.map(s => s.code?.toLowerCase()) : [];
            const curriculumMappingSectionCodes = curriculumLessonsData.map(c => {
                return [c.mapping1_section_code?.toLowerCase(), c.mapping2_section_code?.toLowerCase(), c.mapping3_section_code?.toLowerCase()];
            }).flat().filter(code => code);
            const invalidCurriculumMappingSectionCodes = curriculumMappingSectionCodes.filter(code => !standardSectionCodes.includes(code));
            if (invalidCurriculumMappingSectionCodes.length > 0) {
                console.error(`Curriculum mapping section code does not exist`, invalidCurriculumMappingSectionCodes)
                notify(`Curriculum mapping section code does not exist: ${invalidCurriculumMappingSectionCodes.join(', ')}`, {type: "error"});
                return true;
            }
        }
        return false;
    }

    const lessonValidation = async (lessons, lessonBlocks) => {
        const tenantId = currentTenantId();
        if(!lessonBlocks || lessonBlocks.length === 0) {
            notify(`Lesson blocks not exist`, {type: "error"});
            console.error(`Lesson blocks not exist`)
            return true;
        }
        if(lessonData && lessonData.length > 0) {
            const lessonNames = lessonData.map(l => l.name?.toLowerCase());
            const duplicateLessonNames = lessonNames.filter((item, index) => lessonNames.indexOf(item) !== index);
            if (duplicateLessonNames.length > 0) {
                console.error("Duplicate lesson names found ", duplicateLessonNames);
                notify(`Duplicate lesson names found: ${duplicateLessonNames.join(', ')}`, {type: "error"});
                return true;
            }
            if (lessons && lessons.length > 0) {
                const lessonNames = lessons.filter(l => l.tenant_id === tenantId).map(l => l.name?.toLowerCase());
                const lessonDataExistNames = lessonData.map(l => l.existing_name?.toLowerCase().trim()).filter(name => name);
                const invalidLessonsExistName = lessonDataExistNames.filter(name => !lessonNames.includes(name));
                if (invalidLessonsExistName.length > 0) {
                    console.error(`Lesson exist name not found`, invalidLessonsExistName)
                    notify(`Lesson exist name not found: ${invalidLessonsExistName.join(', ')}`, {type: "error"});
                    return true;
                }
                const lessonDataNames = lessonData.filter(record => !record.existing_name).map(l => l.name?.toLowerCase());
                const invalidLessons = lessonDataNames.filter(name => lessonNames.includes(name));
                if (invalidLessons.length > 0) {
                    console.error(`Lesson name already exist`, invalidLessons)
                    notify(`Lesson name already exist: ${invalidLessons.join(', ')}`, {type: "error"});
                    return true;
                }
            }

            const lessonBlockNames = lessonBlocks.map(l => l.name?.toLowerCase());
            const invalidBlockId = []
            lessonData.map((item) => {
                const lesson_content = item.content;
                const regex = /lesson_block_id="([^"]+)"/g;
                const lessonBlockIds = [];
                let match;

                while ((match = regex.exec(lesson_content)) !== null) {
                    lessonBlockIds.push(match[1]);
                }
                if(lessonBlockIds.length > 0) {
                    lessonBlockIds.forEach((blockId) => {
                        if (!lessonBlockNames.includes(blockId?.toLowerCase())) {
                            invalidBlockId.push(blockId);
                        }
                    });
                }
            })
            if (invalidBlockId.length > 0) {
                console.error(`Lesson block ids not found`, invalidBlockId);
                notify(`Lesson block ids not found: ${invalidBlockId.join(', ')}`, {type: "error"});
                return true;
            }
        }
     return false;
    }

    const handleImportData = async () => {
        const dataProvider = window.swanAppFunctions.dataProvider;

        if(selectedFile === 'curriculum') {
            if (!(curriculumData || curriculumLessonsData)) {
                notify("Please upload any one file", { type: "error" });
                return;
            }
        } else if(selectedFile === 'client') {
            if (!clientsData) {
                notify("Please upload required files", { type: "error" });
                return;
            }
        } else if(selectedFile === 'class') {
            if (!classesData || !classProgressData || !enrollmentsData) {
                notify("Please upload required files", { type: "error" });
                return;
            }
        } else if (selectedFile === 'lesson') {
            if (!(lessonData)) {
                notify("Please upload any Lesson file", { type: "error" });
                return;
            }
        } else if (selectedFile === 'lesson_block') {
            if (!(lessonBlocksData)) {
                notify("Please upload any Lesson Blocks file", { type: "error" });
                return;
            }
        } else if (selectedFile === 'student') {
            if (!studentsData) {
                notify("Please upload required files", { type: "error" });
                return;
            }
        }
        setLocalStorage("is_mail_blocked", true);
        setLoading(true);

        try {
            const {data: standardsData} = await dataProvider.getList('standards', {
                pagination: {page: 1, perPage: 1000}
            });
            const {data: clients} = await dataProvider.getList('clients', {
                pagination: {page: 1, perPage: 10000},
            });
            const {data: lessons} = await dataProvider.getList('lessons', {
                pagination: {page: 1, perPage: 10000},
                meta: {scopingEscapeHatch: true}
            });
            if (selectedFile === 'student') { // handle student import.
                const isImported = await handleStudentImport(studentsData, clients);
                if (isImported) {
                    notify("Data imported successfully!");
                }
                return;
            }
            // Lesson blocks processing
            if (selectedFile === 'lesson') {
                const isImported = await handleLessonImport(lessons);
                if(!isImported) {
                    return;
                }
            }
            // Lesson blocks processing
            if (selectedFile === 'lesson_block') {
               const isImported = await handleLessonBlocksImport(lessonBlocksData);
                if (isImported) {
                    notify("Data imported successfully!");
                }
                return;
            }
            // Curriculum processing
            if(selectedFile === 'curriculum') {
              const isImported = await handleCurriculumImport(lessons, standardsData);
              if (!isImported) {
                  return;
              }
            }
           // Classes processing
            if (selectedFile === 'class') {
               const isImported = await handleClassImport(clients);
               if(!isImported) {
                   return;
               }
            }
            // Clients processing
            if (selectedFile === 'client') {
               const isImported = await handleClientImport(clients, standardsData);
               if(!isImported) {
                   return;
               }
            }

            setLoading(false);
            notify("Data imported successfully!");
            clearData();
        } catch (error) {
            setLoading(false);
            console.error("Error importing data:", error);
            notify("Failed to import data. Check console for details.");
        } finally {
            setLoading(false);
            clearData();
            removeLocalStorage("is_mail_blocked");
        }
    }

    const handleLessonBlocksImport = async (lessonBlocksData: any) => {
        if (lessonBlocksData?.length === 0) {
            notify("Lesson Blocks File Should Not Be Empty", {type: "error"});
            return false;
        }
        const dataProvider = window.swanAppFunctions.dataProvider;
        let errorMessages: string[] = [];

        const handleError = () => {
            if (errorMessages.length > 0) {
                notify(errorMessages.join("\n"), {type: "error", multiLine: true});
            }
        };

        const {data: lessonBlocks} = await dataProvider.getList('lesson_blocks', {
            pagination: {page: 1, perPage: 100000},
        });

        const isPGNExist = lessonBlocksData.some(lb => lb?.block_type?.toLowerCase() === 'pgn');
        if (isPGNExist) {
            console.error("Lesson Block with Block Type 'PGN' is not allowed: ", lessonBlocksData.filter(lb => lb.block_type?.toLowerCase() === 'pgn'));
            errorMessages.push("Lesson Block with Block Type 'PGN' is not allowed.");
            handleError();
            return false;
        }
        const updateLessonBlocks = lessonBlocksData.filter(s => s.existing_name); // Update Lesson blocks
        const newLessonBlocks = lessonBlocksData.filter(s => (s.name && !s.existing_name)); // New Lesson Blocks
        const updateCount = updateLessonBlocks?.length > 0 ? updateLessonBlocks.length : 0;
        const newCount = newLessonBlocks?.length > 0 ? newLessonBlocks.length : 0;

        if ((newCount + updateCount) !== lessonBlocksData.length) {
            errorMessages.push("Import Data Missing Required Values (Name)");
            handleError();
            return false;
        }

        // Finding name duplicate with in import data.
        const findDuplicateValuesByKey = (data: any, key: string) => {
            const values = data.map(s => s[key]).filter(Boolean);
            return values.filter((value, index) => values.indexOf(value) !== index);
        };
        [
            {label: "Lesson Block Names", values: findDuplicateValuesByKey(lessonBlocksData, "name")},
            {label: "Lesson Block Existing Names", values: findDuplicateValuesByKey(lessonBlocksData, "existing_name")},

        ].forEach(({label, values}) => {
            if (values.length > 0) {
                if (errorMessages.length === 0) {
                    errorMessages.push("Import data contains duplicate Names");
                }
                errorMessages.push(`${label}: ${values.join(", ")}`);
            }
        });

        const findDuplicateExistingLessonBlocks = (data: any) => {
            return data.map(lb => lb.name).filter(Boolean).filter(value => lessonBlocks.some(lessonBlock => lessonBlock.name === value));
        };
        const findNonExistingLessonBlocks = (data: any) => {
            return data.map(lb => lb.existing_name).filter(Boolean).filter(value => !lessonBlocks.some(lessonBlock => lessonBlock.name === value));
        };
        [
            {label: "Data Already Exist With Names :", values: findDuplicateExistingLessonBlocks(newLessonBlocks)},
            {label: "Lesson Blocks Not Found :", values: findNonExistingLessonBlocks(updateLessonBlocks)},

        ].forEach(({label, values}) => {
            if (values.length > 0) {
                errorMessages.push(label, `${values.join(", ")}`);
            }
        });

        if (errorMessages.length > 0) {
            handleError();
            return false;
        }

        const lessonBlocksWithMode = lessonBlocksData.map(lb => {
            if (lb.name && !lb.existing_name) {
                return {...lb, mode: "CREATE"};
            }
            if (lb.existing_name) {
                return {...lb, mode: "UPDATE"};
            }
            return lb;
        });

        await processInBatches(lessonBlocksWithMode, 25, async (lessonBlock) => {
            try {
                const isCreateMode = lessonBlock.mode === "CREATE";
                let existingBlock;
                if (!isCreateMode) {
                    existingBlock = lessonBlocks.find(l => l.name?.toLowerCase() === lessonBlock.existing_name?.toLowerCase());
                }
                lessonBlock.tag_ids = null;
                lessonBlock.ccai_pub_id = null;
                lessonBlock.is_game_engine_active = String(lessonBlock?.is_game_engine_active)?.toLowerCase() === "true";
                lessonBlock.is_choice_1_correct = String(lessonBlock?.is_choice_1_correct)?.toLowerCase() === "true";
                lessonBlock.is_choice_2_correct = String(lessonBlock?.is_choice_2_correct)?.toLowerCase() === "true";
                lessonBlock.is_choice_3_correct = String(lessonBlock?.is_choice_3_correct)?.toLowerCase() === "true";
                const {mode, existing_name, ...lessonBlockPayload} = lessonBlock;
                if (isCreateMode) {
                    await dataProvider.create('lesson_blocks', {data: lessonBlockPayload});
                } else {
                    await dataProvider.update('lesson_blocks', {id: existingBlock.id, data: lessonBlockPayload});
                }
            } catch (error) {
                setLoading(false);
                console.error('Failed to create Lesson Block : ', error);
                notify('Failed to create Lesson Block', {type: "error"});
            }
        });
        return true;
    }

    const handleLessonImport = async (lessons) => {
        const dataProvider = window.swanAppFunctions.dataProvider;
        const lessonBlockMap = new Map();
        const tenantId = currentTenantId();
        const {data: lessonBlocks} = await dataProvider.getList('lesson_blocks', {
            pagination: {page: 1, perPage: 10000},
        });
        const isError = await lessonValidation(lessons, lessonBlocks);
        if(isError) return false;

        if (lessonData?.length > 0) {
            lessonBlocks.forEach(lessonBlock => {
                if (!lessonBlockMap.has(lessonBlock.name)) {
                    lessonBlockMap[lessonBlock.name] = lessonBlock.id;
                }
            })
         if(lessonBlocks?.length > 0) {
             await processInBatches(lessonData, 10, async (lesson) => {
                 if (!lesson.name) return;
                 try {
                     const existing = lesson?.existing_name ? lessons.filter(l => l.tenant_id === tenantId).find(l => l.name?.toLowerCase() === lesson.existing_name?.toLowerCase()) : null;
                     lesson.content = lesson.content?.replace(/lesson_block_id="([^"]+)"/g, (_, name) => `lesson_block_id="${lessonBlockMap[name] || name}"`);
                     delete lesson?.existing_name;
                     if (existing) {
                         await dataProvider.update('lessons', {id: existing.id, data: lesson});
                     } else {
                         await dataProvider.create('lessons', {data: lesson});
                     }
                 } catch (error) {
                     setLoading(false);
                     console.error('Failed to create Lesson : ', error);
                     notify('Failed to create Lesson', {type: "error"});
                 }
             });
         } else {
             setLoading(false);
             notify('Failed To Fetch Lesson Blocks, ', {type: "error"});
         }
        }
        return true;
    }

    const handleCurriculumImport = async (lessons, standardsData) => {
        const curriculumNameMap = new Map();
        const curriculumStandardMap = new Map();
        const dataProvider = window.swanAppFunctions.dataProvider;
        const tenantId = currentTenantId();

        const {data: existingCurriculum} = await dataProvider.getList('curriculum', {
            pagination: {page: 1, perPage: 10000},
        });

        const {data: sectionsData} = await dataProvider.getList('standard_sections', {
            pagination: {page: 1, perPage: 100000}
        });
        const {data: cognitiveSkillsData} = await dataProvider.getList('cognitive_skills', {
            pagination: {page: 1, perPage: 100000},
            meta: {scopingEscapeHatch: true}
        });
        const {data: tenants} = await dataProvider.getList('tenants', {
            pagination: {page: 1, perPage: 1000},
            meta: {scopingEscapeHatch: true}
        });

        const isError = await curriculumValidation(sectionsData, cognitiveSkillsData, standardsData, existingCurriculum, lessons, tenants);
        if (isError) return false;

        if (curriculumData?.length > 0) {
            await processInBatches(curriculumData, 10, async (curriculum) => {
                try {
                    if (!curriculum.name) return;

                    const existCurriculumRecord = curriculum.existing_name ? existingCurriculum.find(c => c.name?.toLowerCase() === curriculum.existing_name.toLowerCase()) : null;
                    if (isRegularSchoolFlavored()) {
                        curriculum.standard_id = getStandardId();
                    } else {
                        const standard = standardsData.find(s => s.name === curriculum.standard_name);
                        curriculum.standard_id = standard ? parseInt(standard.id) : null;
                    }
                    curriculum.image_file_id = null;
                    curriculum.image_file_name = "";
                    curriculum.language = curriculum?.language || null;
                    delete curriculum.existing_name;
                    let responseData = null;
                    if(existCurriculumRecord) {
                       const {data: response} = await dataProvider.update('curriculum', {id: existCurriculumRecord.id, data: curriculum});
                        responseData = response;
                    } else {
                        const {data: response} = await dataProvider.create('curriculum', {data: curriculum});
                        responseData = response;
                    }
                    curriculumNameMap[curriculum.name] = responseData?.id;
                    if (responseData.standard_id) {
                        curriculumStandardMap[curriculum.name] = responseData.standard_id;
                    }
                } catch (err) {
                    setLoading(false);
                    console.error(`Failed to create curriculum ${curriculum.name}`, err);
                    notify(`Failed to create curriculum: ${curriculum.name}`, {type: "error"});
                }
            });
        }
        // Curriculum lessons processing
        if (curriculumLessonsData?.length > 0) {
            if (!curriculumData) {
                existingCurriculum.forEach(curriculum => {
                    if (!curriculumNameMap.has(curriculum?.id)) {
                        curriculumNameMap[curriculum.name] = curriculum.id;
                    }
                    if (curriculum.standard_id && !curriculumStandardMap.get(curriculum.name)) {
                        curriculumStandardMap[curriculum.name] = curriculum.standard_id;
                    }
                });
            }

            let positionCount = 0;
            await processInBatches(curriculumLessonsData, 10, async (curriculumLesson) => {
                try {
                    const standardId = isRegularSchoolFlavored() ? getStandardId() : curriculumStandardMap[curriculumLesson.curriculum_name];
                    if (standardId) {
                        const section1 = sectionsData.filter(s => s.standard_id === standardId).find(s => s.code?.toLowerCase() === curriculumLesson.mapping1_section_code?.toLowerCase());
                        const section2 = sectionsData.filter(s => s.standard_id === standardId).find(s => s.code?.toLowerCase() === curriculumLesson.mapping2_section_code?.toLowerCase());
                        const section3 = sectionsData.filter(s => s.standard_id === standardId).find(s => s.code?.toLowerCase() === curriculumLesson.mapping3_section_code?.toLowerCase());
                        curriculumLesson.mapping1_standard_section_id = section1 ? parseInt(section1.id) : null;
                        curriculumLesson.mapping2_standard_section_id = section2 ? parseInt(section2.id) : null;
                        curriculumLesson.mapping3_standard_section_id = section3 ? parseInt(section3.id) : null;
                    }

                    const cognitiveSkill1 = cognitiveSkillsData.find(cs => cs.name?.toLowerCase() === curriculumLesson.mapping1_cognitive_skill_name?.toLowerCase());
                    const cognitiveSkill2 = cognitiveSkillsData.find(cs => cs.name?.toLowerCase() === curriculumLesson.mapping2_cognitive_skill_name?.toLowerCase());
                    const cognitiveSkill3 = cognitiveSkillsData.find(cs => cs.name?.toLowerCase() === curriculumLesson.mapping3_cognitive_skill_name?.toLowerCase());

                    const curriculumId = curriculumNameMap[curriculumLesson.curriculum_name];
                    const publisherId = curriculumLesson.publisher_name?.toLowerCase() === 'self' ? tenantId : tenants.find(t => t.name?.toLowerCase() === curriculumLesson?.publisher_name?.toLowerCase())?.id;
                    const lessonId = lessons.filter(l => l.tenant_id === publisherId).find(l => l.name?.toLowerCase() === curriculumLesson.lesson_name?.toLowerCase())?.id || null;
                    if (curriculumId && lessonId) {
                        curriculumLesson.lesson_id = parseInt(lessonId);
                        curriculumLesson.curriculum_id = parseInt(curriculumId);
                        curriculumLesson.mapping1_cognitive_skill_id = cognitiveSkill1 ? parseInt(cognitiveSkill1?.id) : null;
                        curriculumLesson.mapping2_cognitive_skill_id = cognitiveSkill2 ? parseInt(cognitiveSkill2?.id) : null;
                        curriculumLesson.mapping3_cognitive_skill_id = cognitiveSkill3 ? parseInt(cognitiveSkill3?.id) : null;
                        curriculumLesson.is_limit_to_show_single_section = curriculumLesson?.is_limit_to_show_single_section || false;
                        curriculumLesson.is_game_sound_enabled = curriculumLesson?.is_game_sound_enabled || false;
                        positionCount++;
                        curriculumLesson.position_number = parseInt(positionCount);
                        await dataProvider.create('curriculum_lessons', {data: curriculumLesson});
                    }
                } catch (err) {
                    setLoading(false);
                    console.error(`Failed to create curriculum lesson`, err);
                    notify(`Failed to create curriculum lesson`, {type: "error"});
                }
            });
        }
        return true;
    }

    const handleClassImport = async (clients) => {
        const dataProvider = window.swanAppFunctions.dataProvider;
        const isSchool = isRegularSchoolFlavored() || isSchoolStandardLinked();
        const classNameMap = new Map();
        const {data: subscribers} = await dataProvider.getList('subscribers', {
            filter: {subscriber_tenant_id: currentTenantId()},
            pagination: {page: 1, perPage: 1000},
            meta: {scopingEscapeHatch: true}
        });
        const subscribableIds = subscribers.filter(s => s.subscribable_id).map(s => s.subscribable_id);
        const {data: subscribables} = await dataProvider.getList('subscribables', {
            filter: {id: subscribableIds},
            pagination: {page: 1, perPage: 100000},
            meta: {scopingEscapeHatch: true, prefetch: ['curriculum'] }
        })
        const {data: curriculums} = await dataProvider.getList('curriculum', {
            pagination: {page: 1, perPage: 100000},
        })
        const {data: existingClasses} = await dataProvider.getList('classes', {
            pagination: {page: 1, perPage: 10000}
        });
        // class validation before processing
        const isError = await classValidation(existingClasses, subscribers, subscribables, curriculums);
        if (isError) {
            return false;
        }

        existingClasses.filter(c  => !classesData).forEach(existingClass => {
            if (!classNameMap.has(existingClass?.name)) {
                classNameMap[existingClass.name] = existingClass.id;
            }
        });
        // Classes processing
        if (classesData?.length > 0) {

            const {data: coaches} = await dataProvider.getList('coaches');
            let coachId = null
            if (coaches.length > 0) {
                coachId = coaches[0]?.id;
            }

            await processInBatches(classesData, 25, async (classData) => {
                try {
                    if (!classData.name) return;
                    classData.coach_id = parseInt(coachId) || null;
                    classData.teaching_mode_id = (isAnySchoolFlavorActive() || classData.teaching_mode_name?.toLowerCase() === 'remote') ? 2 : classData.teaching_mode_name?.toLowerCase() === 'hybrid' ? 3 : 1;
                    classData.start_date = getDateFromOffset(classData?.start_date || 0);
                    classData.end_date = getDateFromOffset(classData?.end_date || 0);
                    if (classData.client_name || isRegularSchoolFlavored()) {
                        const clientId = isRegularSchoolFlavored() ? clients[0]?.id : clients.find(c => c.name?.toLowerCase() === classData.client_name?.toLowerCase())?.id;
                        if (clientId && isSchool) {
                            classData.client_id = clientId;
                            classData.is_school_class = true;
                        } else {
                            classData.is_school_class = false;
                        }
                    }
                    const existingClassRecord = classData?.existing_name ? existingClasses.find(c => c.name?.toLowerCase() === classData.existing_name?.toLowerCase()) : null;
                    classData.name = classData.new_name || classData.name;
                    classData.standard_grade_id = null;
                    delete classData.existing_name;
                    if( existingClassRecord) {
                        const {data: response} = await dataProvider.update('classes', {id: existingClassRecord.id, data: classData});
                        classNameMap[classData.name] = response.id;
                    } else {
                        const {data: response} = await dataProvider.create('classes', {data: classData});
                        classNameMap[classData.name] = response.id;
                    }
                } catch (err) {
                    setLoading(false);
                    console.error(`Failed to create class ${classData.name}`, err);
                    notify(`Failed to create class: ${classData.name}`, {type: "error"});
                }
            });
        }

        const {data: students} = await dataProvider.getList('students', {
            pagination: {page: 1, perPage: 1000},
            meta: {prefetch: ['users']}
        });
        if (!classesData || classesData?.length === 0) {
            existingClasses.forEach(clazz => {
                if (!classNameMap.has(clazz?.name)) {
                    classNameMap[clazz.name] = clazz.id;
                }
            })
        }
        // Enrollments processing
        if (enrollmentsData?.length > 0) {
            await processInBatches(enrollmentsData, 25, async (enrollment) => {
                try {
                    const student = students.find(s => (s.user.email?.toLowerCase()) === enrollment.student_email?.toLowerCase());
                    const studentId = student ? parseInt(student?.id) : null;
                    const classId = classNameMap[enrollment.class_name];

                    if (studentId && classId) {
                        enrollment.student_id = studentId;
                        enrollment.class_id = parseInt(classId);
                        enrollment.enrollment_date = getDateFromOffset(enrollment.enrollment_date);
                        enrollment.completion_date = getDateFromOffset(enrollment.completion_date);
                        enrollment.is_certificate_due = enrollment?.is_certificate_due || false;
                        await dataProvider.create('enrollments', {data: enrollment});
                    }
                } catch (error) {
                    setLoading(false);
                    console.error(`Failed to create enrollment: ${error}`);
                    notify(`Failed to create enrollment: ${error}`, {type: "error"});
                }
            });
        }
        // Class progress processing
        const classLessonMap = new Map();
        if (classProgressData?.length > 0) {
            const progressCurriculumNames = classProgressData.map(p => p?.curriculum_name?.toLowerCase());
            const curriculumIds = subscribables.filter(s => s.curriculum).map(s => s.curriculum.id);
            const fetchedCurriculumsIds = curriculums.filter(c => progressCurriculumNames.includes(c.name?.toLowerCase())).map(c => c.id).filter(Boolean);
            const unqiueCurriculumIds = [...new Set([...curriculumIds, ...fetchedCurriculumsIds])]
            const {data: existingCurriculumLessons} = await dataProvider.getList('curriculum_lessons', {
                filter: {curriculum_id: unqiueCurriculumIds},
                pagination: {page: 1, perPage: 10000},
                meta: {scopingEscapeHatch: true, prefetch: ['curriculum', 'lessons']}
            });

            await processInBatches(classProgressData, 25, async (progress) => {
                try {
                    const classId = classNameMap[progress.class_name];
                    const curriculumLesson = existingCurriculumLessons.filter(cl => progress.curriculum_name?.toLowerCase() === cl.curriculum.name?.toLowerCase()).find(cl => cl.lesson.name?.toLowerCase() === progress.lesson_name?.toLowerCase());
                    const lessonId = curriculumLesson ? curriculumLesson.lesson_id : null;
                    if (curriculumLesson) {
                        progress.mapping1_standard_section_id = curriculumLesson?.mapping1_standard_section_id;
                        progress.mapping2_standard_section_id = curriculumLesson?.mapping2_standard_section_id;
                        progress.mapping3_standard_section_id = curriculumLesson?.mapping3_standard_section_id;
                        progress.mapping1_cognitive_skill_id = curriculumLesson?.mapping1_cognitive_skill_id;
                        progress.mapping2_cognitive_skill_id = curriculumLesson?.mapping2_cognitive_skill_id;
                        progress.mapping3_cognitive_skill_id = curriculumLesson?.mapping3_cognitive_skill_id;
                        progress.position_number = parseInt(curriculumLesson?.position_number);
                        progress.is_limit_to_show_single_section = curriculumLesson?.is_limit_to_show_single_section;
                        progress.is_game_sound_enabled = curriculumLesson?.is_game_sound_enabled;
                    }

                    if (classId && lessonId) {
                        progress.class_id = parseInt(classId);
                        progress.lesson_id = parseInt(lessonId);
                        progress.start_date = getDateFromOffset(progress.start_date);
                        progress.completion_date = getDateFromOffset(progress.completion_date);
                        progress.is_assigned = String(progress?.is_assigned)?.toLowerCase() === 'true';
                        await dataProvider.create('class_progress', {data: progress});
                        classLessonMap[progress.lesson_name] = lessonId;
                    }
                } catch (error) {
                    setLoading(false);
                    console.error(`Failed to create class progress: ${error}`);
                    notify('Failed to create class progress', {type: "error"});
                }
            });
        }
        // Assignments processing
        if (assignmentsData?.length > 0) {
            try {
                const {data: classProgress} = await dataProvider.getList('class_progress', {
                    filter: {status: 'in_progress'},
                    pagination: {page: 1, perPage: 10000},
                    meta: {prefetch: ['lessons']}
                })

                const lessonIds = classProgress.map(cp => cp.lesson_id);
                let {data: lessonBlockMappings} = await dataProvider.getList('lesson_block_mapping', {
                    filter: {lesson_id: lessonIds},
                    pagination: {page: 1, perPage: 10000},
                    meta: {scopingEscapeHatch: true, prefetch: ['lesson_blocks']}
                });

                // Filter invalid blocks
                lessonBlockMappings = lessonBlockMappings.filter(lesson => {
                    const block = lesson?.lesson_block;
                    if (!block) return false;
                    if (block.block_type === 'pgn') return false;
                    if (block.block_type === 'animated_tutorial') {
                        return block.animated_tutorial && block.animated_tutorial.trim() !== "";
                    }
                    return true;
                });

                const assignments = [];
                await processInBatches(assignmentsData, 25, async (assignment) => {
                    try {
                        const classId = classNameMap[assignment.class_name];
                        const lessonId = classProgress.filter(c => c.class_id === classId).find(c => c.lesson.name?.toLowerCase() === assignment.lesson_name?.toLowerCase())?.lesson_id || null;
                        const student = students.find(s => s.user.email?.toLowerCase() === assignment.student_email?.toLowerCase());
                        const blockCount = lessonBlockMappings.filter(lesson => lesson.lesson_id === lessonId)?.length;
                        const studentId = student ? student.id : null;
                        if (classId && studentId && lessonId) {
                            assignment.class_id = parseInt(classId);
                            assignment.student_id = parseInt(studentId);
                            assignment.lesson_id = parseInt(lessonId);
                            assignment.total_blocks = parseInt(blockCount) || 0;
                            assignment.is_assessment = String(assignment?.is_assessment)?.toLowerCase() === 'true';
                            assignment.completed_blocks = assignment.status === 'completed' ? blockCount : 0;
                            assignment.assigned_timestamp = getDateFromOffset(assignment.assigned_timestamp);
                            assignment.completed_date = assignment.completed_date ? getDateFromOffset(assignment.completed_date) : null;
                            assignment.unique_direct_assignment_identifier = assignment.unique_direct_assignment_identifier || "";
                            assignment.last_accessed_date = getDateFromOffset(assignment.last_accessed_date);
                            assignment.time_spent = parseInt(assignment.time_spent) || null;

                            const {data: createdAssignment} = await dataProvider.create('assignments', {data: assignment});
                            assignments.push(createdAssignment);
                            const assignmentId = createdAssignment.id;

                            const blockPromises = lessonBlockMappings.filter(lb => lb.lesson_id === lessonId).map(lesson => {
                                const blockData = {
                                    assignment_id: assignmentId,
                                    lesson_block_id: parseInt(lesson.lesson_block_id),
                                    status: assignment.status,
                                };
                                return dataProvider.create('assignment_blocks', {data: blockData});
                            });

                            await Promise.all(blockPromises);
                        }

                    } catch (error) {
                        setLoading(false);
                        console.error(`Failed to create assignment or blocks: ${error}`);
                        notify(`Failed to create assignment or blocks: ${error}`, {type: "error"});
                    }
                });

            } catch (error) {
                setLoading(false);
                console.error(`Failed to fetch lesson mappings or batch process assignments: ${error}`);
                notify(`Failed to fetch lesson mappings or process assignments`, {type: "error"});
            }
        }
        return true;
    }
    const handleClientImport = async (clients,standardsData) => {
        const dataProvider = window.swanAppFunctions.dataProvider;

        const isError = await clientValidation(clients);
        if (isError) return false

        if (clientsData?.length > 0) {
            await processInBatches(clientsData, 10, async (client) => {
                try {
                    if (!client.name) return;

                    const existing_client = client?.existing_name ? clients.find(c => c.name === client.existing_name) : null;
                    if (standardsData.length > 0) {
                        const standard = standardsData.find(s => s.name?.toLowerCase() === client.standard_name?.toLowerCase());
                        client.standard_id = standard ? parseInt(standard?.id) : null;
                    }
                    client.client_type_id = 1; //Business Client
                    client.image_file_id = null;
                    client.image_file_name = "";

                    delete client?.existing_name;
                    if(existing_client) {
                        await dataProvider.update('clients', {id: existing_client.id, data: {...client}});
                    } else {
                        await dataProvider.create('clients', {data: client});
                    }
                } catch (err) {
                    setLoading(false);
                    console.error(`Failed to create client ${client.name}`, err);
                    notify(`Failed to create client: ${client.name}`, {type: "error"});
                }
            });
        }
        return true;
    }

    const clearData = () => {
        setCurriculumData(null);
        setCurriculumLessonsData(null);
        setClientsData(null);
        setStudentsData(null);
        setClassesData(null);
        setEnrollmentsData(null);
        setAssignmentsData(null);
        setClassProgressData(null);
    }

    const downloadSampleCsv = (file) => {
        if(!file) return
        const csvFiles = {
            lesson_blocks: lessonBlocksCSV,
            lessons: lessonsCSV,
            curriculum: curriculumCSV,
            curriculum_lessons: curriculumLessonsCSV,
            clients: clientsCSV,
            students: studentsCSV,
            classes: classesCSV,
            enrollments: enrollmentsCSV,
            class_progress: classProgressCSV,
            assignments: assignmentsCSV,
        };
        const CSVFile = csvFiles[file];
        if(CSVFile) {
            const blob = new Blob([CSVFile], {type: "text/csv;charset=utf-8;"});
            saveAs(blob, `${file}.csv`);
        }
    };
    const DownloadButton = ({fileName}) => (
        <IconButton title={`Download sample file`} size={"small"} color="primary"
                    onClick={() => downloadSampleCsv(fileName)}>
            <DownloadIcon/>
        </IconButton>
    )
    // const importDisable = curriculumData.length === 0 || curriculumLessonsData.length === 0;
    return(
        <Box sx={{p: 1, width: '100%'}}>
            <Box sx={{display: 'flex', alignItems: 'center', width: '100%', paddingTop: '0.2rem'}}>
                <Typography variant='h5'>Import Data</Typography>
                <FormControl sx={{marginLeft: 'auto', minWidth: '10rem', maxWidth: '15rem'}}>
                    <InputLabel id="file-type-label">Select File Type</InputLabel>
                    <Select value={selectedFile}
                            labelId="file-type-label"
                            onChange={(e) => setSelectedFile(e.target.value)}>
                        <MenuItem value={"lesson_block"}>Lesson Block</MenuItem>
                        <MenuItem value={"lesson"}>Lesson</MenuItem>
                        <MenuItem value={"curriculum"}>Curriculum</MenuItem>
                        {!isRegularSchoolFlavored() && <MenuItem value={"client"}>Client</MenuItem>}
                        <MenuItem value={"student"}>Student</MenuItem>
                        <MenuItem value={"class"}>Class</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Box sx={{paddingInline: '7%', }}>
                {selectedFile === 'curriculum' && (<>
                    <Typography sx={{my: 1, mt: 3}}>Curriculum <DownloadButton fileName={'curriculum'}/></Typography>
                    <DragAndDropCsvFile setFileData={setCurriculumData} requiredColumns={requiredColumns.curriculum}/>
                    <Typography sx={{my: 1, mt: 3}}>Curriculum Lessons <DownloadButton fileName={'curriculum_lessons'}/></Typography>
                    <DragAndDropCsvFile setFileData={setCurriculumLessonsData} requiredColumns={requiredColumns.curriculumLessons}/>
                </>)}

                {selectedFile === 'client' && (
                    <>
                        <Typography sx={{my: 1, mt: 3}}>Clients * <DownloadButton fileName={'clients'}/></Typography>
                        <DragAndDropCsvFile setFileData={setClientsData} requiredColumns={requiredColumns.clients}/>
                    </>
                )}
                {selectedFile === 'student' &&
                    <>
                        <Typography sx={{my: 1, mt: 3}}>Students * <DownloadButton fileName={'students'}/></Typography>
                        <DragAndDropCsvFile setFileData={setStudentsData} requiredColumns={requiredColumns.students}/>
                    </>
                }

                {selectedFile === 'class' && (<>
                    <Typography sx={{my: 1, mt: 3}}>Classes * <DownloadButton fileName={'classes'}/></Typography>
                    <DragAndDropCsvFile setFileData={setClassesData} requiredColumns={requiredColumns.classes}/>
                    <Typography sx={{my: 1, mt: 3}}>Enrollments * <DownloadButton fileName={'enrollments'}/></Typography>
                    <DragAndDropCsvFile setFileData={setEnrollmentsData} requiredColumns={requiredColumns.enrollments}/>
                    <Typography sx={{my: 1, mt: 3}}>Lessons * <DownloadButton fileName={'class_progress'}/></Typography>
                    <DragAndDropCsvFile setFileData={setClassProgressData} requiredColumns={requiredColumns.classProgress}/>
                    <Typography sx={{my: 1, mt: 3}}>Assignments <DownloadButton fileName={'assignments'}/></Typography>
                    <DragAndDropCsvFile setFileData={setAssignmentsData} requiredColumns={requiredColumns.assignments}/>
                </>)}
                {selectedFile === 'lesson_block' && (<>
                    <Typography sx={{my: 1, mt: 3}}>Lesson Blocks * <DownloadButton fileName={'lesson_blocks'}/></Typography>
                    <DragAndDropCsvFile setFileData={setLessonBlocksData} requiredColumns={requiredColumns.lessonBlocks}/>
                </>)}
                {selectedFile === 'lesson' && (<>
                    <Typography sx={{my: 1, mt: 3}}>Lesson * <DownloadButton fileName={'lessons'}/></Typography>
                    <DragAndDropCsvFile setFileData={setLessonData} requiredColumns={requiredColumns.lessons}/>
                </>)}
                {selectedFile &&
                    <Box sx={{mb: 5}}>
                        <Button onClick={handleImportData} variant='contained' sx={{mt: 2, float: 'right'}}
                                label={"Import Data"}/>
                    </Box>
                }
            </Box>
        </Box>
    )
}
