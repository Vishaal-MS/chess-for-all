import { Datagrid, Link,List,useListContext, DateField, ImageField,ReferenceField,ReferenceManyField,SingleFieldList,ChipField,Show,TextField, FunctionField,Count,Pagination,WithListContext } from 'react-admin';
import {ResourceContextProvider,SimpleList,ReferenceManyCount} from "react-admin";
import {DBCard, DBCardWithIconAndBG} from "../../components/DBCard";
import {Grid,Typography,Box,Button,Avatar,Divider} from '@mui/material';
import React, {useEffect, useState} from "react";
import {Error, Loading} from "react-admin";
import {useDataProvider,useGetRecordId} from "react-admin";
import {Card,CardContent,CardHeader} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';
import Person3Icon from '@mui/icons-material/Person3';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import {CardWithBGIconOnRight, CardWithIcon} from "../../components/CardWithIcon";
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import CastForEducationIcon from '@mui/icons-material/CastForEducation';
import {formatAmount, formatCurrency} from "../../utils";
import {GenericBarChart} from "../../components/BarChart";
import {groupByClient, groupByCoach, groupByMonth} from "../../helpers/payments";
import {ProgressBar, ProgressChart} from "../../components/ProgressBar";
import {PostTypeCreate} from "../posts/topics";
import {SubReference} from "../../fields/SubReferenceField";
import {getAllClassesForTenant,getClassesForCoachByStatus} from "../../backend/classes";
import {getAllCoaches} from "../../backend/coaches";
import {  getActiveClientsCount,getAllClients} from "../../backend/clients";
import {getEnrollmentsByStatusAndClass} from  "../../backend/enrollments";
import {
    currentTenantId,
    getCurrentUserCoachId,
} from "../../businessLogic";
import {addClientDetails, addCoachDetails} from "../../backend/dashboard";
import {
    getAllCertificates,
    getAllTrophies,
    getCertificatesByCoach,
    getTrophiesByCoach
} from "../../backend/certificates";
import {getPaymentsForTenant} from "../../backend/payments";
import {getInvoicesForTenantByStatus} from "../../backend/invoices";
import {EnrolmentStatus, ClassesStatus, CertificateStatus, TrophiesStatus, InvoicesStatus} from "../../helpers/constants.ts";
import { remoteLog } from '@mahaswami/vc-frontend';
import {SwanView} from "../swan_crud/SwanCrud.tsx";



export const OrgAdminMainDashBoard = () =>{
    const dataProvider = window.swanAppFunctions.dataProvider;

    const [activeClientsCount,setActiveClientsCount] = useState("");
    const [totalClientsCount,setTotalClientsCount] = useState("");

    const [totalCoachesCount,setTotalCoachesCount] = useState("");

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
    const [topCoaches, setTopCoaches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect( () => {
        const fetchCounts = async () => {
            try {

                const clients = await getAllClients(dataProvider);
                clients ?  setTotalClientsCount(clients.length.toString()) : setTotalClientsCount("0");
                const activeClients = await getActiveClientsCount(dataProvider);
                setActiveClientsCount(activeClients.size.toString());

                const allClasses = await getAllClassesForTenant(dataProvider);
                if(allClasses) {
                    const activeClasses = allClasses.filter(classRecord => classRecord.status === ClassesStatus.ACTIVE);
                    activeClasses ? setActiveClassesCount(activeClasses.length.toString()) : setActiveClassesCount("0");
                    const completedClasses = allClasses.filter(classRecord => classRecord.status === EnrolmentStatus.COMPLETED);
                    completedClasses ? setCompletedClassesCount(completedClasses.length.toString()) : setCompletedClassesCount("0");

                    const activeClassIds = activeClasses.map(classRecord => classRecord.id);
                    const activeStudents = await getEnrollmentsByStatusAndClass(dataProvider, activeClassIds,EnrolmentStatus.IN_PROGRESS);
                    setActiveStudentsCount(activeStudents.size.toString());

                    const completedClassIds = completedClasses.map(classRecord => classRecord.id);
                    const completedStudents = await getEnrollmentsByStatusAndClass(dataProvider, completedClassIds,EnrolmentStatus.COMPLETED);
                    setCompletedStudentsCount(completedStudents.size.toString());
                }

                const coaches = await getAllCoaches(dataProvider);
                coaches ? setTotalCoachesCount(coaches.length.toString()) : setTotalCoachesCount("0");

                setLoading(false);
            }
            catch (err) {
                setError(err);
                setLoading(false);
                remoteLog("Error sending on OrgAdminMainDashBoard fetchCounts method: ", error);
            }
        }
        fetchCounts();
    },[dataProvider]);

    useEffect(() => {
        const fetchCertificatesCount = async () => {
            try {
                const certificates = await getAllCertificates(dataProvider);
                certificates.filter(cert => cert.status === CertificateStatus.ISSUED).length ? setCertificatesIssuedCount(certificates.filter(cert => cert.status === CertificateStatus.ISSUED).length.toString()) : setCertificatesIssuedCount("0");
                certificates.filter(cert => cert.status === CertificateStatus.RECEIVED).length ? setCertificatesPendingCount(certificates.filter(cert => cert.status === CertificateStatus.RECEIVED).length.toString()) : setCertificatesPendingCount("0");
                certificates.filter(cert => cert.status === CertificateStatus.ORDERED).length ? setCertificatesOrdered(certificates.filter(cert => cert.status === CertificateStatus.ORDERED).length.toString()) : setCertificatesOrdered("0");
            } catch (err) {
                setError(err);
                setLoading(false);
                remoteLog("Error sending on OrgAdminMainDashBoard fetchCertificatesCount method: ", error);
            }
        }
        const fetchTrophiesCount = async () => {
            try {
                const trophies = await getAllTrophies(dataProvider);
                trophies.filter(cert => cert.status === TrophiesStatus.ISSUED).length ? setTrophiesIssuedCount(trophies.filter(cert => cert.status === TrophiesStatus.ISSUED).length.toString()) : setTrophiesIssuedCount("0");
                trophies.filter(cert => cert.status === TrophiesStatus.RECEIVED).length ? setTrophiesPendingCount(trophies.filter(cert => cert.status === TrophiesStatus.RECEIVED).length.toString()) : setTrophiesPendingCount("0");
                trophies.filter(cert => cert.status === TrophiesStatus.ORDERED).length ? setTrophiesOrderedCount(trophies.filter(cert => cert.status === TrophiesStatus.ORDERED).length.toString()) : setTrophiesOrderedCount("0");
            } catch (err) {
                setError(err);
                setLoading(false);
                remoteLog("Error sending on OrgAdminMainDashBoard fetchTrophiesCount method: ", error);
            }
        }
        fetchCertificatesCount();
        fetchTrophiesCount();
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
                const paymentsGroupedByCoach = groupByCoach(payments);

                const topClients = await addClientDetails(dataProvider, paymentsGroupedByClient);
                setTopClients(topClients);

                const topCoaches = await addCoachDetails(dataProvider,paymentsGroupedByCoach);
                setTopCoaches(topCoaches);

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
                remoteLog("Error sending on OrgAdminMainDashBoard fetchPayments method: ", error);
            }
        };
        fetchPayments();

    },[]);

    if(loading) return <Loading />;
    return (
        <SwanView>
            <>
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
                                        /*footerComponent={
                                            <Typography sx={{ fontSize:"14px", textAlign: 'center', marginTop:1, marginBottom: 2 }}>
                                                Payments Over Last 6 Months
                                            </Typography>
                                        }*/
                                        titleComponent={
                                            <Box sx={{boxShadow:0} }>
                                                <Typography variant="h6" sx={{ color:"green", padding:1, textAlign: 'center', marginTop:1, marginBottom: 1 }}>
                                                    Total Payments Received: {paymentsReceived}
                                                </Typography>
                                            </Box>
                                        }
                                        data={payments} XAxisDataKey={'month'} YAxisDataKey={'payments'} />

                                </Card>
                                <Box sx={{width:"35%"}}><DBCard title={"Top Clients"}
                                                                component={
                                                                    <Datagrid resource={"clients"} data={topClients} total={3} sort={{ field: 'id', order: 'DESC' }} pending={false} header={<></>}  bulkActionButtons={false} empty={false}>
                                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2,justifyContent:'space-between' }}>
                                                                                <ReferenceField reference={"clients"} source={"id"} linkType={false}>
                                                                                    <TextField source="name" sx={{ fontSize: '18px'}}/>
                                                                                </ReferenceField>
                                                                                <FunctionField render={record => formatAmount(record.revenue)} sx={{ fontSize: '20px', paddingRight:1}}/>
                                                                            </Box>
                                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2,justifyContent:'space-between' }}>
                                                                                <FunctionField render={record => {return 'Classes : ' + record.classes;}} sx={{ fontSize: '16px', paddingRight:2}}/>
                                                                                <FunctionField render={record => {return 'Students : ' + record.students;}} sx={{ fontSize: '16px', paddingRight:2}}/>
                                                                            </Box>
                                                                        </Box>
                                                                    </Datagrid>
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
                            {/* First Row (Three Cards) */}
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                {/*<PaymentProgressLine totalPending="25000" totalReceived="75000" />*/}
                                <CardWithBGIconOnRight
                                    title={"Total Coaches"}
                                    count={totalCoachesCount}
                                    color={"blue"}
                                    Icon={Person3Icon}>
                                </CardWithBGIconOnRight>
                            </Box>
                          {/*  <Box sx={{ display: 'flex', gap: 2 }}>
                                <DBCard title={"Upcoming Classes" } component={
                                    <ResourceContextProvider value="classes">
                                        <List title=" " disableSyncWithLocation exporter={false} filter={{tenant_id:getTenantId(), start_date_gte: today  }}
                                              perPage={3} pagination={false} actions={false} sx={{'& .RaList-content': {
                                                boxShadow: '0px 0px 0px 0px',
                                            },}}
                                        >
                                            <SimpleList primaryText={
                                                <ReferenceField reference={"curriculum"} source={"curriculum_id"} linkType={false}>
                                                    <TextField source="name" sx={{ fontSize: '18px', paddingRight:2}}/>
                                                </ReferenceField>
                                            }
                                                // tertiaryText={}
                                                        secondaryText={<>
                                                            <div style={{display:'flex', flexDirection:'row'}}>
                                                                <Typography variant={"h7"}> Starting :
                                                                    <DateField source="start_date" variant={"h7"} /></Typography>
                                                            </div>
                                                            <div>

                                                                <ReferenceField reference={"clients"} source={"client_id"} linkType={false}>
                                                                    <Typography variant={"h7"}> Client :
                                                                        <TextField variant={"h7"} source="name" />
                                                                    </Typography></ReferenceField>

                                                            </div></>}
                                            />

                                        </List>

                                    </ResourceContextProvider> }
                                        footer={
                                            <Button
                                                sx={{ borderRadius: 0, fontSize:"14px" }}
                                                component={Link}
                                                to={{
                                                    pathname: '/classes',
                                                    search: `filter=${JSON.stringify({ status:'scheduled' })}`,
                                                }}

                                                color="primary"
                                            >
                                                View All
                                            </Button>}
                                        color={"orange"}/>
                            </Box>*/}

                            <Box sx={{ display: 'flex', gap: 2 }}>

                                <DBCard title={"Pending Payments (" + paymentsPending + ")" } component={
                                    <ResourceContextProvider value="invoices">
                                        <List title=" " disableSyncWithLocation exporter={false} filter={{status:InvoicesStatus.UNPAID }} perPage={2} pagination={false} actions={false} sx={{padding:0,'& .RaList-content': {
                                                boxShadow: '0px 0px 0px 0px',
                                            },}} >
                                            <SimpleList primaryText={  <ReferenceField reference={"clients"} source={"client_id"} >
                                                <TextField source="name" sx={{ fontSize: '18px', paddingLeft:1}}/>
                                            </ReferenceField>}
                                                        secondaryText={<><DateField source="date" sx={{paddingLeft:1, paddingRight:5,fontSize: '16px'}} /><FunctionField render={record => formatAmount(record.amount)} sx={{fontSize: '16px',fontWeight:'bold'}}/></>}  />

                                        </List>

                                    </ResourceContextProvider> }
                                        footer={
                                            <Button
                                                sx={{ borderRadius: 0, padding:2,fontSize:"18px" }}
                                                component={Link}
                                                to={{
                                                    pathname: '/invoices',
                                                    search: `filter=${JSON.stringify({ status:InvoicesStatus.UNPAID })}`,
                                                }}

                                                color="primary"
                                            >
                                                View All
                                            </Button>} color={"orange"} />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <DBCard title={"Top Coaches"}
                                        component={
                                            <Datagrid resource={"coaches"} data={topCoaches} total={3} sort={{ field: 'id', order: 'DESC' }} pending={false} header={<></>}  bulkActionButtons={false} empty={false}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2,justifyContent:'space-between' }}>
                                                        <ReferenceField reference={"coaches"} source={"id"} linkType={false}>
                                                            <ReferenceField reference={"users"} source={"user_id"} linkType={false}>
                                                            <TextField source="fullName" sx={{ fontSize: '18px'}}/>
                                                            </ReferenceField>
                                                        </ReferenceField>
                                                        <FunctionField render={record => formatAmount(record.revenue)} sx={{ fontSize: '20px', paddingRight:1}}/>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2,justifyContent:'space-between' }}>
                                                        <FunctionField render={record => {return 'Classes : ' + record.classes;}} sx={{ fontSize: '16px', paddingRight:2}}/>
                                                        <FunctionField render={record => {return 'Students : ' + record.students;}} sx={{ fontSize: '16px', paddingRight:2}}/>
                                                    </Box>
                                                </Box>
                                            </Datagrid>
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
                                    </Button>} color={"blue"} />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </>
        </SwanView>
    )
}
