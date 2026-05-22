import { useState,useEffect } from 'react';
import {Loading} from "react-admin";
import {Box, Card, CardContent, Grid,  Typography} from '@mui/material';
import { useShowController,SimpleShowLayout,ImageField } from 'react-admin';
import {CertificateStatus, TrophiesStatus} from "../../helpers/constants.ts";
import { remoteLog } from '@mahaswami/vc-frontend';
import {getCurrentUserStudentId} from "../../backend/students.ts";

export const AchievementsShow = ({ id,resource }) => {
        const { isPending, error, record } = useShowController({ resource: resource, id });
        if (isPending) return <Loading />;
        if (error) return <div>{error.message}</div>;
    return(
        <SimpleShowLayout record={record}>
            {record.image_file_id ? <ImageField source="image_file_id" src="src"
                        title="title" label=""
                 sx={{ '& .RaImageField-image': {width:300,height:300,alignItems:'center' },
                         '& .RaImageField-list':{justifyContent: 'center'}}}
            /> : ''}
        </SimpleShowLayout>
    )

}
export const AchievementsList = () => {
    const dataProvider = window.swanAppFunctions.dataProvider;
    const [loading, setLoading] = useState(true);
    const [certificates, setCertificates] = useState([]);
    const [trophies,setTrophies] = useState([]);

    useEffect(() => {
        const fetchCertificatesAndTrophies = async () => {
            try {
                const studentId = await getCurrentUserStudentId(dataProvider);
                const {data:certificates} = await dataProvider.getList('certificates', {
                    pagination: { page: 1, perPage: 10 },
                    sort: { field: 'id', order: 'DESC' },
                    filter: { student_id: studentId,status:CertificateStatus.ISSUED },
                });
                console.log('Student Certificates:',certificates);
                setCertificates(certificates);
                const {data:trophies} = await dataProvider.getList('trophies', {
                    pagination: { page: 1, perPage: 10 },
                    sort: { field: 'id', order: 'DESC' },
                    filter: { student_id: studentId,status:TrophiesStatus.ISSUED },
                });
                setTrophies(trophies);
                setLoading(false);
            } catch (error) {
                remoteLog("Error sending on fetchCertificatesAndTrophies: ", error);
            }
        }
        fetchCertificatesAndTrophies();
    }, []);
    if(loading) return <Loading />;
    return (
        <Grid container spacing={1} sx={{ px: '12px', py:'1px' }}>
            <Grid item xs={12}>
                <Typography variant="h5" sx={{padding:2, textAlign: 'center'}} >Certificates</Typography>

                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        {certificates.map(certificate => {
                            return (
                            <Card sx={{ padding:2,margin:1}}>
                                <CardContent>
                                    <AchievementsShow id={certificate.id} resource={'certificates'} />
                                </CardContent>
                            </Card>
                    )})}
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h5" sx={{padding:2, textAlign: 'center'}} >Trophies </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    {trophies.map(trophy => {
                        return (
                            <Card sx={{ width: 350, height: 233, m: 1 }}>
                                <CardContent>
                                    <AchievementsShow id={trophy.id} resource={'trophies'} />
                                </CardContent>
                            </Card>
                        )})}
                </Box>
            </Grid>
        </Grid>
    );
}