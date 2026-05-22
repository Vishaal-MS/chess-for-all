import {useEffect, useState} from "react";
import {isExecutiveCoachingFlavored, isOrgCoach} from "../../backend/common_logics.ts";
import {
    ImageField, List, Loading, ResourceContextProvider, Show, SimpleList, TabbedShowLayout, TextField, useGetRecordId
} from "react-admin";
import {getClassesForCoachByStatus} from "../../backend/classes.ts";
import {getEnrollmentsByStatusAndClass} from "../../backend/enrollments.ts";
import {getCertificatesByCoach, getTrophiesByCoach} from "../../backend/certificates.ts";
import {Box, Button, Card, Grid, Link, Typography} from "@mui/material";
import {CardWithBGIconOnRight} from "../../components/CardWithIcon.tsx";
import PeopleIcon from "@mui/icons-material/People";
import DoughnutChart from "../../components/DoughnutChart.tsx";
import {DBCard} from "../../components/DBCard.tsx";
import {CoachClassList} from "./coaches"
import ContactMailIcon from "@mui/icons-material/ContactMail";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import {EnrolmentStatus, ClassesStatus, CertificateStatus, TrophiesStatus} from "../../helpers/constants.ts";
import {StudentsReferenceField} from "../students.tsx";
import {UsersReferenceField} from "../users.tsx";
import {getCurrentUserCoachId} from "../../backend/coaches.ts";

const CoachCard = () => {
    return (
        <Card>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, padding: 2,width:'100%',height:180}}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, justifyContent:'center'}}>
                    <UsersReferenceField source={"user_id"} link={false}>
                        <ImageField source="image_file_id" src="src" sx={{ '& .RaImageField-image': { width:'100%',height:100,objectFit: 'contain' },
                            '& .RaImageField-list':{padding: 0}}} />
                    </UsersReferenceField>
                </Box>
                <Box sx={{ display: 'flex', flex:1, flexDirection: 'row', gap: 2, alignItems:'center', justifyContent:'space-between'}}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems:'center', justifyContent:'center',}}>
                        <UsersReferenceField source={"user_id"} link={false}>
                            <TextField source={"fullName"} variant={"h7"} />
                        </UsersReferenceField>
                        <Typography variant={"h7"}> Experience: <TextField variant={"h7"} source={"years_of_experience"} /> years</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2}}>
                        <UsersReferenceField source={"user_id"} link={false}>
                            <Typography variant="h7" sx={{textAlign:'right'}}>
                                <TextField source="email" variant="h7"/>
                                <ContactMailIcon sx={{marginLeft: 1,verticalAlign:'middle'}}/>
                            </Typography>
                        </UsersReferenceField>
                        <Typography variant="h7" sx={{textAlign:'right'}}>
                            <TextField source="contact_number" variant="h7"/>
                            <ContactPhoneIcon sx={{marginLeft: 1,verticalAlign:'middle'}}/>
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Card>
    )
}


export const CoachView = () => {
    const dataProvider = window.swanAppFunctions.dataProvider;
    const [recordId,setRecordId] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchRecordId = async () => {
            try {
                if(isOrgCoach()) {
                    const currentCoachId = await getCurrentUserCoachId(dataProvider);
                    setRecordId(currentCoachId);
                }
                setLoading(false);
            }
            catch (err) {
                console.error(err);
            }
        }

        fetchRecordId();

    },[]);
    if (loading) {
        return <Loading />;
    }
    if(!loading) return (
        <Show resource={"coaches"} id={recordId}>
            <CoachShow id={recordId ? recordId : Number(useGetRecordId())} />
        </Show>
    );
}

export const CoachShow = ({id}) => {
    const dataProvider = window.swanAppFunctions.dataProvider;
    const [activeClassesCount, setActiveClassesCount] = useState(0);
    const [completedClassesCount,setCompletedClassesCount] = useState(0);
    const [scheduledClassesCount,setScheduledClassesCount] = useState(0);
    const [activeStudentsCount, setActiveStudentsCount] = useState("0");
    const [completedStudentsCount,setCompletedStudentsCount] = useState("0");
    const [allClassIds,setAllClassIds] = useState([]);
    const [coachClassData,setCoachClassData] = useState([]);

    const [certificatesIssuedCount,setCertificatesIssuedCount] = useState("");
    const [certificatesPendingCount,setCertificatesPendingCount] = useState("");
    const [certificatesOrderedCount,setCertificatesOrdered] = useState("");

    const [trophiesIssuedCount,setTrophiesIssuedCount] = useState("");
    const [trophiesPendingCount,setTrophiesPendingCount] = useState("");
    const [trophiesOrderedCount,setTrophiesOrderedCount] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect( () => {
        const fetchCounts = async () => {
            try {
                const currentCoachId = id;

                const activeClasses = await getClassesForCoachByStatus(dataProvider, currentCoachId,ClassesStatus.ACTIVE);
                activeClasses ? setActiveClassesCount(activeClasses.length.toString()) : setActiveClassesCount(0);
                const completedClasses = await getClassesForCoachByStatus(dataProvider, currentCoachId,ClassesStatus.COMPLETED);
                completedClasses ? setCompletedClassesCount(completedClasses.length.toString()) : setCompletedClassesCount(0);
                const scheduledClasses = await getClassesForCoachByStatus(dataProvider, currentCoachId,ClassesStatus.SCHEDULED);
                scheduledClasses ? setScheduledClassesCount(scheduledClasses.length.toString()) : setScheduledClassesCount(0);

                const activeClassIds = activeClasses.map(classRecord => classRecord.id);
                const activeStudents = await getEnrollmentsByStatusAndClass(dataProvider, activeClassIds,EnrolmentStatus.IN_PROGRESS);
                activeStudents.size ? setActiveStudentsCount(activeStudents.size.toString()) : setActiveStudentsCount("0");

                const completedClassIds = completedClasses.map(classRecord => classRecord.id);
                const completedStudents = await getEnrollmentsByStatusAndClass(dataProvider, completedClassIds,EnrolmentStatus.COMPLETED);
                setCompletedStudentsCount(completedStudents.size.toString());

                const allClassIds = activeClasses.map(classRecord => classRecord.id).concat(completedClasses.map(classRecord => classRecord.id));
                setAllClassIds(allClassIds);

                //Create an Array with name and value for the Doughnut Chart
                const data = [
                    { name: 'Scheduled', value: scheduledClasses.length },
                    { name: 'Active', value: activeClasses.length },
                    { name: 'Completed', value: completedClasses.length },
                ];
                setCoachClassData(data);

                setLoading(false);
            }
            catch (err) {
                setError(err);
                setLoading(false);
            }
        }
        fetchCounts();
    },[dataProvider]);

    useEffect(() => {
        const fetchCertificatesCount = async () => {
            try {
                const currentCoachId = id;
                const certificates = await getCertificatesByCoach(dataProvider,currentCoachId);
                certificates.filter(cert => cert.status === CertificateStatus.ISSUED).length ? setCertificatesIssuedCount(certificates.filter(cert => cert.status === CertificateStatus.ISSUED).length.toString()) : setCertificatesIssuedCount("0");
                certificates.filter(cert => cert.status === CertificateStatus.RECEIVED).length ? setCertificatesPendingCount(certificates.filter(cert => cert.status === CertificateStatus.RECEIVED).length.toString()) : setCertificatesPendingCount("0");
                certificates.filter(cert => cert.status === CertificateStatus.ORDERED).length ? setCertificatesOrdered(certificates.filter(cert => cert.status === CertificateStatus.ORDERED).length.toString()) : setCertificatesOrdered("0");
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        }
        const fetchTrophiesCount = async () => {
            try {
                const currentCoachId = id;
                const trophies = await getTrophiesByCoach(dataProvider,currentCoachId);
                trophies.filter(cert => cert.status === TrophiesStatus.ISSUED).length ? setTrophiesIssuedCount(trophies.filter(cert => cert.status === TrophiesStatus.ISSUED).length.toString()) : setTrophiesIssuedCount("0");
                trophies.filter(cert => cert.status === TrophiesStatus.RECEIVED).length ? setTrophiesPendingCount(trophies.filter(cert => cert.status === TrophiesStatus.RECEIVED).length.toString()) : setTrophiesPendingCount("0");
                trophies.filter(cert => cert.status === TrophiesStatus.ORDERED).length ? setTrophiesOrderedCount(trophies.filter(cert => cert.status === TrophiesStatus.ORDERED).length.toString()) : setTrophiesOrderedCount("0");
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        }
        fetchCertificatesCount();
        fetchTrophiesCount();
    },[dataProvider]);

    if (error) {
        return <Error />;
    }

    return (
        <>
            <Grid container spacing={2} style={{padding: "12px"}}>
                <Grid item xs={8}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2,marginBottom: 3 }}>
                        <CoachCard/>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <CardWithBGIconOnRight title={"Active Students"}
                                                   count={activeStudentsCount !== null ?  activeStudentsCount : "0"}
                                                   color={"blue"} Icon={PeopleIcon}></CardWithBGIconOnRight>


                            <CardWithBGIconOnRight title={"Completed Students"}
                                                   count={completedStudentsCount !== null ?  completedStudentsCount : null}
                                                   color={"green"} Icon={PeopleIcon}></CardWithBGIconOnRight>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Card sx={{alignItems: 'center', padding: 2, boxShadow: 2, width:'100%', height: 300}}>
                                <TabbedShowLayout syncWithLocation={false}>
                                    <TabbedShowLayout.Tab label="Upcoming Classes"
                                                          sx={{
                                                              //backgroundColor: '#ff4081', // Background color for Tab 1
                                                              color: 'orange', // Text color for Tab 1
                                                              '&.Mui-selected': {
                                                                  backgroundColor: 'orange',
                                                                  color:'white'// Background color for active Tab 1
                                                              },
                                                          }}>
                                        <CoachClassList status={ClassesStatus.SCHEDULED}/>
                                    </TabbedShowLayout.Tab>
                                    <TabbedShowLayout.Tab label="Ongoing Classes"
                                                          sx={{
                                                              //backgroundColor: '#ff4081', // Background color for Tab 1
                                                              color: 'blue', // Text color for Tab 1
                                                              '&.Mui-selected': {
                                                                  backgroundColor: 'blue',
                                                                  color:'white'// Background color for active Tab 1
                                                              },
                                                          }}>
                                        <CoachClassList status={ClassesStatus.ACTIVE}/>
                                    </TabbedShowLayout.Tab>
                                    <TabbedShowLayout.Tab label="Completed Classes"
                                                          sx={{
                                                              //backgroundColor: '#ff4081', // Background color for Tab 1
                                                              color: 'green', // Text color for Tab 1
                                                              '&.Mui-selected': {
                                                                  backgroundColor: 'green',
                                                                  color:'white'// Background color for active Tab 1
                                                              },
                                                          }}>
                                        <CoachClassList status={ClassesStatus.COMPLETED}/>
                                    </TabbedShowLayout.Tab>
                                </TabbedShowLayout>
                            </Card>
                        </Box>
                    </Box>

                </Grid>
                <Grid item xs={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2,marginBottom: 3 }}>
                        <Card sx={{alignItems: 'center', padding: 2, boxShadow: 2,width:'100%',height:180}}>
                            {!loading && <DoughnutChart data={coachClassData}/>}
                        </Card>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2,marginBottom: 3 }}>
                        {!loading && <DBCard title={isExecutiveCoachingFlavored() ? "Executive" : "Student"}
                            // total={<ReferenceManyCount reference="enrollments" target="curriculum_id"></ReferenceManyCount>}
                                             component={<ResourceContextProvider value="enrollments">
                                                 <List filter={{class_id:allClassIds}} exporter={false} actions={false} perPage={6} pagination={false}>
                                                     <SimpleList
                                                         primaryText={
                                                             <StudentsReferenceField source="student_id"link={false}>
                                                                <TextField source="user.fullName" />
                                                             </StudentsReferenceField>}
                                                         leftAvatar={user => {
                                                             return (
                                                                 <StudentsReferenceField source="student_id" link={false}>
                                                                     <ImageField source="user.image_file_id" src="src"/>
                                                                 </StudentsReferenceField>
                                                             )
                                                         }}
                                                     >
                                                     </SimpleList></List>

                                             </ResourceContextProvider>}
                                             footer={
                                                 <Button
                                                     sx={{ borderRadius: 0, fontSize:"18px" }}
                                                     component={Link}
                                                     to={{
                                                         pathname: '/enrollments',
                                                         search: `filter=${JSON.stringify({ coach_id: id,status:ClassesStatus.SCHEDULED })}`,
                                                     }}

                                                     color="primary"
                                                 >
                                                     View All
                                                 </Button>}
                                             color={"blue"}/>}
                    </Box>
                </Grid>
                <Grid item xs={8}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2,marginBottom: 3 }}>
                    </Box>
                </Grid>
            </Grid>
        </>
    )
}