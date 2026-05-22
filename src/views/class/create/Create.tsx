import {Fragment, useEffect, useRef, useState} from "react";
import {
    Button,
    Create,
    Loading,
    useCreate,
    useDelete,
    useNotify,
    useRedirect,
    useUpdate,
    useSidebarState
} from "react-admin";
import Stepper from "../../../components/Stepper.tsx";
import {Box} from "@mui/material";
import {useFormContext} from "react-hook-form";
import {
    getTeachingModes,
    isExecutiveCoachingFlavored
} from "../../../backend/common_logics.ts";
import {createDefaults, formDefaults, getLocalStorage, remoteLog, SimpleForm} from "@mahaswami/vc-frontend";
import ClassDetails from "./ClassDetails.tsx";
import Lessons from "./Lessons.tsx";
import Students from "./Students.tsx";
import { ScheduleForm } from "../schedules.tsx";
import {ListTitle} from "../../../components/Title.tsx";
import {deleteClassAndRelationships, updateClassAndSchedule} from "../../../backend/classes.ts";
import {ClassesStatus, getStepsLabel, EPOCHE_ZERO_DATE} from "../../../helpers/constants.ts";
import {Summary} from "../summary.tsx";
import {useSearchParams} from "react-router-dom";
import {sendEmailToStudentAndParent} from "../../../backend/students.ts";

const CreateClass = (props: any) => {
    const dataProvider = window.swanAppFunctions.dataProvider;
    const status = 'draft';
    const [activeStep, setActiveStep] = useState(0);
    const [isStepperLoad, setIsStepperLoad] = useState(false);
    const [classRecord, setClassRecord] = useState(null);
    const [showStudentList, setShowStudentList] = useState(true);
    const [showLessonList, setShowLessonList] = useState(true);
    const [sidebarOpen, setSidebarVisibility] = useSidebarState();
    const classRecordRef = useRef(null);
    const calenderRef = useRef(null);
    let [searchParams] = useSearchParams();
    const classType = searchParams.get('type') || 'regular';
    const isSchool = classType === 'school';
    // const [isDirty, setIsDirty] = useState(false);
    const STEP_LABELS = getStepsLabel();

    const [deleteOne] = useDelete();

    useEffect(() => {
        if (sidebarOpen) {
            setSidebarVisibility(false);
        }
    }, []);

    const handleOnCancel = async (callback?: () => void) => {
        if(!classRecordRef.current || !classRecordRef.current.id) return;
        setIsStepperLoad && setIsStepperLoad(true);
        await deleteClassAndRelationships(dataProvider, classRecordRef.current.id, deleteOne);
        setIsStepperLoad && setIsStepperLoad(false);
        classRecordRef.current = null
        if(callback) {
            callback();
        }
    }

    const steps = [STEP_LABELS.PROVIDE_CLASS_DETAILS, STEP_LABELS.SELECT_STUDENTS, STEP_LABELS.SELECT_LESSONS, ...(!isSchool ? [STEP_LABELS.SETUP_A_CALENDAR] : []), STEP_LABELS.SUMMARY]
    const currentStep = steps[activeStep];
    return(
        <Fragment>
            <Stepper activeStep={activeStep} steps={steps}/>
            <div >
                <Create {...createDefaults(props)} title={<ListTitle resourceName={'Setup A New Class'}/>} >
                    {/* The Lesson filter includes a form, and embedding it inside a SimpleForm doesn't applicable that's why move it outside of the simpleForm */}
                    <Box sx={{ paddingInline: "1rem", paddingTop: "0.5rem"}}>
                        {(currentStep === STEP_LABELS.SELECT_STUDENTS && showStudentList) &&
                            <Students classRecord={classRecord} showStudentList={showStudentList} setShowStudentList={setShowStudentList} />}
                        {(currentStep === STEP_LABELS.SELECT_LESSONS && showLessonList) &&
                        <Lessons classRecord={classRecord} showLessonList={showLessonList} setShowLessonList={setShowLessonList}/>}
                    </Box>
                    <SimpleForm {...formDefaults(props)} toolbar={false} defaultValues={{is_school_class: isSchool}}>
                        <Box sx={{width: '100%', position: 'relative'}}>
                            {isStepperLoad && <Loading
                                sx={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}
                                loadingPrimary={''} loadingSecondary={''}/>}
                            <div style={{opacity: isStepperLoad ? 0.5 : 1, pointerEvents: isStepperLoad ? "none" : "auto"}}>
                                {currentStep === STEP_LABELS.PROVIDE_CLASS_DETAILS && <ClassDetails status={status} isSchool={isSchool} />}
                                {currentStep === STEP_LABELS.SELECT_STUDENTS && !showStudentList && <Students classRecord={classRecord} showStudentList={showStudentList} setShowStudentList={setShowStudentList} />}
                                {currentStep === STEP_LABELS.SELECT_LESSONS && !showLessonList && <Lessons classRecord={classRecord} showLessonList={showLessonList} setShowLessonList={setShowLessonList}/>}
                                {currentStep === STEP_LABELS.SETUP_A_CALENDAR && <Box sx={{height: 'calc(100vh - 15rem)', overflow: 'auto'}}><ScheduleForm calenderRef={calenderRef}/></Box>}
                                {currentStep === STEP_LABELS.SUMMARY && <Summary recordId={classRecord?.id}/>}
                                <StepNavigation steps={steps} activeStep={activeStep} setActiveStep={setActiveStep}
                                                isStepperLoad={isStepperLoad} setIsStepperLoad={setIsStepperLoad}
                                                classRecordRef={classRecordRef} handleOnCancel={handleOnCancel}
                                                setClassRecord={setClassRecord} calenderRef={calenderRef} isSchoolClass={isSchool}/>
                            </div>
                        </Box>
                    </SimpleForm>
                </Create>
            </div>
        </Fragment>
    );
}

export default CreateClass;

export const studentEnrolledEmail = async (enrollmentData, dataProvider, className: string) => {
    try {
        const{data: users} = await dataProvider.getList('users',{pagination: {page: 1, perPage: 1000}});
        await Promise.all(
            enrollmentData.map((enrollData: any) => {
                if (enrollData?.student) {
                    const userId = enrollData?.student?.user_id;
                    const userdata = users.find((value: any) => value.id === userId);
                    if (!userdata.is_active) {
                        userdata.is_active = true;
                        userdata.last_login_date = userdata?.last_login_date === EPOCHE_ZERO_DATE ? '' : userdata.last_login_date;
                        dataProvider.update('users', {id: userId, data: userdata});
                    }
                    sendEmailToStudentAndParent(userdata, enrollData.classCount === 1, className);
                }
            })
        );
    } catch (error) {
        remoteLog("Error on studentEnrolledEmail: ", error);
        console.error("Error on studentEnrolledEmail: ", error);
    }
}

const StepNavigation = ({
                            activeStep,
                            steps,
                            setActiveStep,
                            isStepperLoad = false,
                            setIsStepperLoad,
                            classRecordRef,
                            handleOnCancel,
                            setClassRecord,
                            calenderRef,
                            isSchoolClass = false
                        }: any) => {
    const {trigger, getValues, formState, reset: resetFormContext} = useFormContext();
    const notify = useNotify();
    const [create] = useCreate();
    const [update] = useUpdate();
    const redirect = useRedirect();
    const[loading, setLoading] = useState(false);
    const currentStep = steps[activeStep];
    const STEP_LABELS = getStepsLabel();

    const transform = async (data) => {
        const teachingMode = (isSchoolClass || isExecutiveCoachingFlavored())  ? {teaching_mode_id: 2} : {} // setting default teaching mode to 'Remote' for school
        const coach_id = data?.coach_id ? data.coach_id : parseInt(getLocalStorage('coach_id'));
        return {...data, status: ClassesStatus.DRAFT, coach_id: coach_id, ...teachingMode};
    };

    const handleOnClassCreate = async () => {
        const data = getValues();
        const transformData = await transform(data);
        await create('classes', {data: transformData},
            {
                onSuccess: (data) => {
                    classRecordRef.current = data;
                    setClassRecord(data)
                    resetFormContext(data);
                },
                onError: () => {
                    notify('Error creating class', {type: 'error'});
                }
            })
    }
    const handleOnClassUpdate = async () => {
        const data = getValues();
        await update('classes', {id: classRecordRef.current.id, data: data},
            {
                onSuccess: (data) => {
                    classRecordRef.current = data;
                    setClassRecord(data);
                    resetFormContext(data);
                },
                onError: () => {
                    notify('Error updating class', {type: 'error'});
                }
            })
    }

    const handleOnFinish = async () => {
        const isValid = await trigger();
        if (!isValid) return;
        setLoading(true);
        const data = getValues();
        const classId = classRecordRef?.current?.id;
        const dataProvider = window.swanAppFunctions.dataProvider
        const teachingModes = await getTeachingModes(dataProvider);
        const classTeachingMode = teachingModes.find((t: any) => t.id === classRecordRef.current?.teaching_mode_id).name;
        await updateClassAndSchedule(classId, data, dataProvider, classTeachingMode, teachingModes, calenderRef);
        notify('Class created successfully', {type: 'success'});
        redirect('/classes')
    }

    const handleNextButtonClick = async () => {
        setIsStepperLoad && setIsStepperLoad(true);
        const isValid = await trigger();
        if (isValid) {
            if (currentStep === STEP_LABELS.PROVIDE_CLASS_DETAILS && !classRecordRef.current) {
                await handleOnClassCreate();
            } else if (currentStep === STEP_LABELS.PROVIDE_CLASS_DETAILS && classRecordRef.current && formState.isDirty) {
                await handleOnClassUpdate();
            }
            setActiveStep(activeStep + 1)
        } else {
            notify('Please fill in all the required fields.', {type: 'warning'});
        }
        setIsStepperLoad && setIsStepperLoad(false)
    }

    return (
        <Box display="flex" justifyContent="space-between" width={'100%'}>
            {!loading && activeStep !== 0 ?
                 <Button variant={'contained'} label={"Previous"}
                        disabled={activeStep === 0 || isStepperLoad}
                        onClick={() => {
                            setActiveStep(activeStep > 0 ? activeStep - 1 : 0)
                        }}/> :
                <Box/>
            }
            {activeStep === steps.length - 1 ?
                <Box>
                    {!loading &&
                        <Button variant={'contained'}
                                label={'Cancel'}
                                color={'error'}
                                style={{marginRight: '2.5em'}}
                                onClick={() => handleOnCancel(() => {
                                    redirect('/classes');
                                })}
                        ></Button>
                    }
                    <Button variant={'contained'} label={'Finish'} 
                            loading={loading}
                            onClick={handleOnFinish}/>
                </Box> :
                <Button variant={'contained'} label={"Next"}
                        disabled={activeStep === steps.length - 1 || isStepperLoad}
                        onClick={() => handleNextButtonClick()}
                />}
        </Box>
    )
}
