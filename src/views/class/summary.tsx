import {Loading} from "react-admin";
import {Box, Grid, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {
    isAcademy,
    isExecutiveCoachingFlavored,
} from "../../backend/common_logics.ts";
import {formatDateWithShortYear} from "../../utils.ts";
import { remoteLog } from "@mahaswami/vc-frontend";

export const Summary = ({recordId}) => {
    const dataProvider = window.swanAppFunctions.dataProvider;
    const classId = recordId;

    const [state, setState] = useState({
        clazz: undefined,
        loading: true,
        coachName: '',
    })

    useEffect(() => {
    const fetchClass = async () => {
        try {
            const { data: classData } = await dataProvider.getOne('classes', {
                id: classId, 
                meta: { prefetch: ['teaching_modes', 'coaches'] }
            });
            const { data: user } = await dataProvider.getOne('users', { id: classData.coach.user_id })
            setState({clazz: classData, loading: false, coachName: user.fullName});
        } catch (error) {
            remoteLog("Error on Summary fetchClass method: ", error);
        }
    }
        fetchClass();
    }, [classId]);

    const clazz = state.clazz
    const coachName = state.coachName;
    return(
        <Box sx={{height: 'calc(100vh - 15rem)'}}>
            {state.loading ? <Loading /> :
            <Box p={4}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="h6">Class Name</Typography>
                        <Typography >{clazz.name}</Typography>
                    </Grid>
                    {!(clazz?.is_school_class || isExecutiveCoachingFlavored()) && <Grid item xs={12} sm={6}>
                        <Typography variant="h6">Coaching Mode</Typography>
                        <Typography>{clazz.teaching_mode?.name}</Typography>
                    </Grid>}
                    <Grid item xs={12} sm={6}>
                        <Grid item xs={6}>
                            <Typography variant="h6">Start Date</Typography>
                            <Typography>{formatDateWithShortYear(clazz.start_date)}</Typography>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} sm={6} >
                        <Grid item xs={6}>
                            <Typography variant="h6">End Date</Typography>
                            <Typography>{formatDateWithShortYear(clazz.end_date)}</Typography>
                        </Grid>
                    </Grid>
                    {isAcademy() &&
                    <Grid item xs={12} sm={6}>
                        <Typography variant="h6">{clazz?.is_school_class ? "Teacher" : "Coach"}</Typography>
                        <Typography>{coachName}</Typography>
                    </Grid>
                    }
                </Grid>
            </Box>}
        </Box>
    )
}