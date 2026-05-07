import {Card,Box,Grid,CardContent,Typography} from "@mui/material";

export const CardWithIconV1 = ({ title, count,component, Icon,color }) => {
    return (
        <Card sx={{ flex:1, display: 'flex', alignItems: 'center', padding: 1, boxShadow: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', marginRight: 2 }}>
                <Icon sx={{ fontSize: 30, color: color }} />
            </Box>
            <Box sx={{ padding: 4, alignItems: 'center',justifyContent:"space-between" }}>
                <Typography variant="h7" sx={{ textAlign: 'center',color: color }}>{title}</Typography>
                <Typography variant="h6" sx={{ textAlign: 'center' }}>{count ? count : component}</Typography>
            </Box>
        </Card>
    );
};

export const CardWithIcon = ({ title, count,component, Icon,color }) => {
    return (
        <Card sx={{ flex:1,display: 'flex', alignItems: 'center', padding: 2, maxWidth: 400,height:120 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                <Icon sx={{ fontSize: 60,color:color }} />
                <Box sx={{ marginLeft: 4, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{color:color}}>
                        {title}
                    </Typography>
                    <Typography variant="h5" >{count ? count : component}</Typography>
                </Box>
            </Box>
        </Card>
    );
};

export const CardWithBGIconOnRight = ({ title, count,component, Icon,color }) => {
    return (
        <Card sx={{ flex:1,display: 'flex', alignItems: 'center', padding: 1, backgroundColor:color }}>
            <Box sx={{ display: 'flex',width:'100%',alignItems:'center', justifyContent: 'space-between', flexDirection: 'row' }}>
                <Box sx={{ marginLeft: 2, marginRight:2, textAlign: 'left' }}>
                    <Typography variant="h5" sx={{color: (theme) => theme.palette.background.paper }}>{count ? count : component}</Typography>
                    <Typography variant="h6" sx={{color: (theme) => theme.palette.background.paper }}>
                        {title}
                    </Typography>
                </Box>
                <Box sx={{marginLeft:2, marginRight:2,textAlign:'right'}}>
                <Icon sx={{ fontSize : 50,color: (theme) => theme.palette.background.paper }} />
                </Box>
            </Box>
        </Card>
    );
};
