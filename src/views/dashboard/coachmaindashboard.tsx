import {
    DateField, FunctionField, Link, List, Loading,
    ResourceContextProvider, SimpleList, TextField, Title, useSidebarState
} from 'react-admin';
import {DBCard} from "../../components/DBCard";
import {Box, Button, Card, Divider, Grid, Typography} from '@mui/material';
import {Fragment, useEffect, useState} from "react";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import {CardWithBGIconOnRight} from "../../components/CardWithIcon";
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import CastForEducationIcon from '@mui/icons-material/CastForEducation';
import {formatAmount} from "../../utils";
import {GenericBarChart} from "../../components/BarChart";
import {groupByClient, groupByMonth} from "../../helpers/payments";
import {getActiveClientsCount, getAllClients} from "../../backend/clients";
import {getEnrollmentsByStatusAndClass} from  "../../backend/enrollments";
import { currentTenantId } from "../../backend/common_logics";
import {addClientDetails} from "../../backend/dashboard.ts";
import {getCertificatesByCoach, getTrophiesByCoach} from "../../backend/certificates.ts";
import {getPaymentsForTenant} from "../../backend/payments.ts";
import {getInvoicesForTenantByStatus} from "../../backend/invoices";
import {getClassesForCoachByStatus} from "../../backend/classes";
import {EnrolmentStatus, ClassesStatus, CertificateStatus, TrophiesStatus, InvoicesStatus} from "../../helpers/constants.ts";
import {DataTable, remoteLog} from '@mahaswami/vc-frontend';
import {ClientsReferenceField} from "../clients.tsx";
import {CurriculumsReferenceField} from "../curriculums.tsx";
import {getCurrentUserCoachId} from "../../backend/coaches.ts";

export const CoachDashBoard = () =>{
    const dataProvider = window.swanAppFunctions.dataProvider;
    const [currentCoachId, setCurrentCoachId] = useState(null);

    const [activeClientsCount,setActiveClientsCount] = useState("");
    const [totalClientsCount,setTotalClientsCount] = useState("");

    const [activeClassesCount, setActiveClassesCount] = useState("");
    const [completedClassesCount,setCompletedClassesCount] = useState("");

    const [activeStudentsCount,setActiveStudentsCount] = useState("");
    const [completedStudentsCount,setCompletedStudentsCount] = useState("");

    const [certificatesIssuedCount,setCertificatesIssuedCount] = useState("");
    const [certificatesPendingCount,setCertificatesPendingCount] = useState("");
    const [certificatesOrderedCount,setCertificatesOrdered] = useState("");

    const [trophiesIssuedCount,setTrophiesIssuedCount] = useState("");
    const [trophiesPendingCount,setTrophiesPendingCount] = useState("");
    const [trophiesOrderedCount,setTrophiesOrderedCount] = useState("");

    const [paymentsReceived, setPaymentsReceived] = useState("");
    const [paymentsPending, setPaymentsPending] = useState("");

    const [payments, setPayments] = useState([]);
    const [topClients, setTopClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [sideBarOpen, setSidebarOpen] = useSidebarState();

    useEffect(() => {
        if (sideBarOpen) {
           setSidebarOpen(false);
        }
     }, []);

    useEffect( () => {
        const fetchCounts = async () => {
            try {
                const currentCoachId = await getCurrentUserCoachId(dataProvider);
                setCurrentCoachId(currentCoachId);

                const clients = await getAllClients(dataProvider);
                clients ?  setTotalClientsCount(clients.length.toString()) : setTotalClientsCount("0");
                const activeClients = await getActiveClientsCount(dataProvider);
                setActiveClientsCount(activeClients.size.toString());

                const activeClasses = await getClassesForCoachByStatus(dataProvider, currentCoachId,ClassesStatus.ACTIVE);
                activeClasses ? setActiveClassesCount(activeClasses.length.toString()) : setActiveClassesCount("0");
                const completedClasses = await getClassesForCoachByStatus(dataProvider, currentCoachId,ClassesStatus.COMPLETED);
                completedClasses ? setCompletedClassesCount(completedClasses.length.toString()) : setCompletedClassesCount("0");

                const activeClassIds = activeClasses.map(classRecord => classRecord.id);
                const activeStudents = await getEnrollmentsByStatusAndClass(dataProvider, activeClassIds,EnrolmentStatus.IN_PROGRESS);
                setActiveStudentsCount(activeStudents.size.toString());

                const completedClassIds = completedClasses.map(classRecord => classRecord.id);
                const completedStudents = await getEnrollmentsByStatusAndClass(dataProvider, completedClassIds,EnrolmentStatus.COMPLETED);
                setCompletedStudentsCount(completedStudents.size.toString());
                setLoading(false);
            }
            catch (err) {
                setError(err);
                setLoading(false);
                remoteLog("Error sending on CoachDashBoard fetchCounts method: ", error);
            }
        }
        fetchCounts();
    },[dataProvider]);

    useEffect(() => {
        const fetchCertificatesCount = async () => {
            try {
                const currentCoachId = await getCurrentUserCoachId(dataProvider);
                const certificates = await getCertificatesByCoach(dataProvider,currentCoachId);
                certificates.filter(cert => cert.status === CertificateStatus.ISSUED).length ? setCertificatesIssuedCount(certificates.filter(cert => cert.status === CertificateStatus.ISSUED).length.toString()) : setCertificatesIssuedCount("0");
                certificates.filter(cert => cert.status === CertificateStatus.RECEIVED).length ? setCertificatesPendingCount(certificates.filter(cert => cert.status === CertificateStatus.RECEIVED).length.toString()) : setCertificatesPendingCount("0");
                certificates.filter(cert => cert.status === CertificateStatus.ORDERED).length ? setCertificatesOrdered(certificates.filter(cert => cert.status === CertificateStatus.ORDERED).length.toString()) : setCertificatesOrdered("0");
            } catch (err) {
                setError(err);
                setLoading(false);
                remoteLog("Error sending on CoachDashBoard fetchCertificatesCount method: ", error);
            }
        }
        const fetchTrophiesCount = async () => {
            try {
                const currentCoachId = await getCurrentUserCoachId(dataProvider);
                const trophies = await getTrophiesByCoach(dataProvider,currentCoachId);
                trophies.filter(cert => cert.status === TrophiesStatus.ISSUED).length ? setTrophiesIssuedCount(trophies.filter(cert => cert.status === TrophiesStatus.ISSUED).length.toString()) : setTrophiesIssuedCount("0");
                trophies.filter(cert => cert.status === TrophiesStatus.RECEIVED).length ? setTrophiesPendingCount(trophies.filter(cert => cert.status === TrophiesStatus.RECEIVED).length.toString()) : setTrophiesPendingCount("0");
                trophies.filter(cert => cert.status === TrophiesStatus.ORDERED).length ? setTrophiesOrderedCount(trophies.filter(cert => cert.status === TrophiesStatus.ORDERED).length.toString()) : setTrophiesOrderedCount("0");
            } catch (err) {
                setError(err);
                setLoading(false);
                remoteLog("Error sending on CoachDashBoard fetchTrophiesCount method: ", error);
            }
        }
        fetchCertificatesCount();
        fetchTrophiesCount();
    },[dataProvider]);

    useEffect(() => {
        const fetchTopClients = async () => {
            try{
                const topClients= [
                    {
                        id: 1,
                        name: 'GNS Whitefield',
                        revenue: 16400,
                        classes: 4,
                        students: 22
                    },
                    {
                        id: 2,
                        name: 'Ekya National',
                        revenue: 15600,
                        classes: 5,
                        students:15,
                    },
                    {
                        id: 3,
                        name: 'Sanathan Public College',
                        revenue: 9450,
                        classes: 2,
                        students:9,
                    },
                    {
                        id: 4,
                        name: 'GIS International',
                        revenue: 8050,
                        classes: 2,
                        students:9,
                    }
                ]
                //setTopClients(topClients);
            }
            catch (err) {
                setError(err);
                setLoading(false);
                remoteLog("Error sending on CoachDashBoard fetchTopClients method: ", error);
            }
        }
        fetchTopClients();
    },[dataProvider]);

    useEffect(() => {

        const fetchPayments = async () => {
            try {
               const payments = await getPaymentsForTenant(dataProvider);
               const invoices = await getInvoicesForTenantByStatus(dataProvider,InvoicesStatus.UNPAID);

                console.log('Payments', payments);
                console.log('Invoices', invoices);

                // Step 3: Group payments by month

                const paymentsGroupedByMonth = groupByMonth(payments);
                const paymentsGroupedByClient = groupByClient(payments);
                const topClients = await addClientDetails(dataProvider, paymentsGroupedByClient);
                setTopClients(topClients);

                // Step 2: Get Total Payment and Invoices Amount
                const totalPayments = payments.reduce((sum, payment) => sum + parseInt(payment.amount, 10), 0);
                const totalInvoices = invoices.reduce((sum, invoice) => sum + parseInt(invoice.amount, 10), 0);
                setPaymentsReceived(formatAmount(totalPayments));
                setPaymentsPending(formatAmount(totalInvoices));
                console.log('Payments Received',payments);
                setPayments(paymentsGroupedByMonth);
            }
            catch (err) {
                setError(err);
                setLoading(false);
                remoteLog("Error sending on CoachDashBoard fetchPayments method: ", error);
            }
        };
        fetchPayments();

    },[]);

    if(loading) return <Loading/>;
    return (
        <Fragment>
            <Title title='Coach Dashboard' />
            <Grid container spacing={2} style={{padding: '12px'}} >
                <Grid item xs={9}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2,marginBottom: 3 }}>
                        {/* First Row (Three Cards) */}
                        <Box sx={{ display: 'flex', gap: 2 }}>

                    <CardWithBGIconOnRight title={"Active Clients"}
                                           count={activeClientsCount !== null ?  activeClientsCount : null}
                                           color={"blue"} Icon={BusinessIcon}></CardWithBGIconOnRight>

                    <CardWithBGIconOnRight title={"Active Classes"}
                                           count={activeClassesCount !== null ?  activeClassesCount : null}
                                           color={"blue"} Icon={CastForEducationIcon}></CardWithBGIconOnRight>


                    <CardWithBGIconOnRight title={"Active Students"}
                                           count={activeStudentsCount !== null ?  activeStudentsCount : null}
                                           color={"blue"} Icon={PeopleIcon}></CardWithBGIconOnRight>
                    </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>

                            <CardWithBGIconOnRight title={"Total Clients"}
                                                   count={totalClientsCount !== null ?  totalClientsCount : null}
                                                   color={"green"} Icon={BusinessIcon}></CardWithBGIconOnRight>

                            <CardWithBGIconOnRight title={"Completed Classes"}
                                                   count={completedClassesCount !== null ?  completedClassesCount : null}
                                                   color={"green"} Icon={CastForEducationIcon}></CardWithBGIconOnRight>


                            <CardWithBGIconOnRight title={"Completed Students"}
                                                   count={completedStudentsCount !== null ?  completedStudentsCount : null}
                                                   color={"green"} Icon={PeopleIcon}></CardWithBGIconOnRight>
                        </Box>

                        {/* Second Row (Three Cards) */}
                        <Box sx={{ display: 'flex', gap: 2 }}>

                            <Card sx={{ flex:1, padding: 2, maxWidth:610,height:200,display: 'flex', flexDirection: 'column' }}>
                                {/* Title with Icon */}
                                <Box sx={{ display: 'flex', marginBottom: 2,align:'center',justifyContent:'center'}}>
                                    <EmojiEventsIcon sx={{ fontSize: 50, marginRight: 1, color: 'blue',textAlign:'center' }} />
                                    <Typography variant="h5" sx={{textAlign:'center'}}>
                                       Trophies
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex',flexDirection: 'row', justifyContent: 'space-between', gap: 2 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                       <Typography variant="h6" sx={{ color: 'blue' }}>
                                            Ordered
                                        </Typography>
                                        <Typography variant="h5" sx={{ color: 'blue' }}>
                                            {trophiesOrderedCount}
                                        </Typography>
                                    </Box>
                                    <Divider orientation="vertical" flexItem />
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Typography variant="h6" sx={{ color: 'orange' }}>
                                            Pending
                                        </Typography>
                                        <Typography variant="h5" sx={{ color: 'orange' }}>
                                            {trophiesPendingCount}
                                        </Typography>
                                    </Box>
                                    <Divider orientation="vertical" flexItem />
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Typography variant="h6" sx={{ color: 'green' }}>
                                            Issued
                                        </Typography>
                                        <Typography variant="h5" sx={{ color: 'green' }}>
                                            {trophiesIssuedCount}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Card>

                            <Card sx={{ flex:1, padding: 2, maxWidth:610,height:200,display: 'flex', flexDirection: 'column' }}>
                                {/* Title with Icon */}
                                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2,justifyContent:'center' }}>
                                    <WorkspacePremiumIcon sx={{ fontSize: 50, marginRight: 1, color: 'blue',textAlign:'center' }} />
                                    <Typography variant="h5" sx={{textAlign:'center'}} >
                                        Certificates
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex',flexDirection: 'row', justifyContent: 'space-between', gap: 2 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Typography variant="h6" sx={{ color: 'blue' }}>
                                            Ordered
                                        </Typography>
                                        <Typography variant="h5" sx={{ color: 'blue' }}>
                                            {certificatesOrderedCount}
                                        </Typography>
                                    </Box>
                                    <Divider orientation="vertical" flexItem />
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Typography variant="h6" sx={{ color: 'orange' }}>
                                            Pending
                                        </Typography>
                                        <Typography variant="h5" sx={{ color: 'orange' }}>
                                            {certificatesPendingCount}
                                        </Typography>
                                    </Box>
                                    <Divider orientation="vertical" flexItem />
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Typography variant="h6" sx={{ color: 'green' }}>
                                            Issued
                                        </Typography>
                                        <Typography variant="h5" sx={{ color: 'green' }}>
                                            {certificatesIssuedCount}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Card>

                        </Box>

                        {/* Second Row (Two Charts) */}
                         <Box sx={{ display: 'flex', gap: 2 }}>
                            <Card sx={{width:"65%",maxHeight:500}}>
                                <GenericBarChart
                                    footerComponent={
                                    <Typography sx={{ fontSize:"14px", textAlign: 'center', marginTop:1, marginBottom: 2 }}>
                                        Payments Over Last 6 Months
                                    </Typography>
                                    }
                                    titleComponent={
                                    <Box sx={{boxShadow:0} }>
                                        <Typography variant="h6" sx={{ color:"green", padding:1, textAlign: 'center', marginTop:1, marginBottom: 1 }}>
                                            Total Payments Received: {paymentsReceived}
                                        </Typography>
                                    </Box>
                                    }
                                    data={payments} XAxisDataKey={'month'} YAxisDataKey={'payments'} />

                            </Card>
                            <Box sx={{width:"35%"}}><DBCard title={"My Top Clients"}
                                component={
                                    <DataTable resource={"clients"} data={topClients} total={3} sort={{ field: 'id', order: 'DESC' }} pending={false} header={<></>}  bulkActionButtons={false} empty={false}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2,justifyContent:'space-between' }}>
                                                <ClientsReferenceField source={"id"} />
                                                <FunctionField render={record => formatAmount(record.revenue)} sx={{ fontSize: '20px', paddingRight:1}}/>
                                            </Box>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2,justifyContent:'space-between' }}>
                                                <FunctionField render={record => {return 'Classes : ' + record.classes;}} sx={{ fontSize: '16px', paddingRight:2}}/>
                                                <FunctionField render={record => {return 'Students : ' + record.students;}} sx={{ fontSize: '16px', paddingRight:2}}/>
                                            </Box>
                                        </Box>
                                      </DataTable>
                                }  footer={
                                <Button
                                    sx={{ borderRadius: 0, padding:2,fontSize:"18px" }}
                                    component={Link}
                                    to={{
                                        pathname: '/clients',
                                        search: `filter=${JSON.stringify({tenant_id:currentTenantId() })}`,
                                    }}

                                    color="primary"
                                >
                                    View All
                                </Button>} color={"blue"} /> </Box>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={3}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2,marginBottom: 3 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <DBCard title={"Upcoming Classes" } component={
                                <ResourceContextProvider value="classes">
                                    <List title=" " disableSyncWithLocation exporter={false} filter={{tenant_id:currentTenantId(), coach_id:currentCoachId, status: ClassesStatus.SCHEDULED  }}
                                          perPage={3} pagination={false} actions={false} sx={{'& .RaList-content': {
                                            boxShadow: '0px 0px 0px 0px',
                                        },}}
                                           >
                                        <SimpleList
                                            primaryText={<CurriculumsReferenceField source={"curriculum_id"} />}
                                            secondaryText={<>
                                                <div style={{display:'flex', flexDirection:'row'}}>
                                                    <Typography variant={"h7"}> Starting :
                                                        <DateField source="start_date" variant={"h7"} /></Typography>
                                                </div>
                                                <div>
                                                    <ClientsReferenceField source={"client_id"}>
                                                        <Typography variant={"h7"}> Client :
                                                            <TextField variant={"h7"} source="name" />
                                                        </Typography>
                                                    </ClientsReferenceField>
                                                </div>
                                            </>}
                                        />

                                    </List>

                                </ResourceContextProvider> }
                                    footer={
                                        <Button
                                            sx={{ borderRadius: 0, fontSize:"18px" }}
                                            component={Link}
                                            to={{
                                                pathname: '/classes',
                                                search: `filter=${JSON.stringify({ coach_id: currentCoachId,status:ClassesStatus.SCHEDULED })}`,
                                            }}

                                            color="primary"
                                        >
                                            View All
                                        </Button>}
                                    color={"orange"}/>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <DBCard title={"Ongoing Classes" } component={
                                <ResourceContextProvider value="classes">
                                    <List title=" " disableSyncWithLocation exporter={false} filter={{tenant_id:currentTenantId(), coach_id:currentCoachId, status: ClassesStatus.ACTIVE  }}
                                          perPage={3} pagination={false} actions={false} sx={{'& .RaList-content': {
                                            boxShadow: '0px 0px 0px 0px',
                                        },}}>
                                        <SimpleList
                                            primaryText={<CurriculumsReferenceField source={"curriculum_id"} />}
                                            secondaryText={<>
                                                <div style={{display:'flex', flexDirection:'row'}}>
                                                    <Typography variant={"h7"}> Started :
                                                        <DateField source="start_date" variant={"h7"} />
                                                    </Typography>
                                                </div>
                                                <div>
                                                    <ClientsReferenceField source={"client_id"}>
                                                        <Typography variant={"h7"}> Client :
                                                            <TextField variant={"h7"} source="name" />
                                                        </Typography>
                                                    </ClientsReferenceField>
                                                </div>
                                            </>}
                                        />
                                    </List>
                                </ResourceContextProvider> }
                                    footer={
                                        <Button
                                            sx={{ borderRadius: 0, fontSize:"18px" }}
                                            component={Link}
                                            to={{
                                                pathname: '/classes',
                                                search: `filter=${JSON.stringify({ coach_id: currentCoachId,status:ClassesStatus.ACTIVE })}`,
                                            }}

                                            color="primary"
                                        >
                                            View All
                                        </Button>}
                                    color={"blue"}/>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <DBCard title={"Pending Payments (" + paymentsPending + ")" } component={
                                <ResourceContextProvider value="invoices">
                                    <List title=" " disableSyncWithLocation exporter={false} filter={{coach_id:currentCoachId,status:InvoicesStatus.UNPAID  }}
                                          perPage={3} pagination={false} actions={false} sx={{padding:0,'& .RaList-content': {boxShadow: '0px 0px 0px 0px'}}} >
                                        <SimpleList
                                            primaryText={<ClientsReferenceField source={"client_id"} />}
                                            secondaryText={<>
                                                <DateField source="invoice_date" sx={{paddingLeft:1, paddingRight:5,fontSize: '16px'}} />
                                                <FunctionField render={record => formatAmount(record.amount)} sx={{fontSize: '16px',fontWeight:'bold'}}/>
                                            </>}/>
                                    </List>
                                </ResourceContextProvider> }
                                    footer={
                                        <Button sx={{ borderRadius: 0, padding:2,fontSize:"18px" }} component={Link} color="primary" color={"orange"}
                                            to={{
                                                pathname: '/invoices',
                                                search: `filter=${JSON.stringify({ coach_id: currentCoachId,status:InvoicesStatus.UNPAID })}`,
                                            }}>View All</Button>
                            }
                            />
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Fragment>
    )
}
