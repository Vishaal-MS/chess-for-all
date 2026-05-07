import {Card, CardContent, CardHeader, Typography,Box} from "@mui/material";
import React from "react";
import {Icon} from "@mui/material";

export const DBCard = ({title, component, footer,color,total,titleFont,cardHeight}) => {
    return (
        <Card sx={{
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            backgroundColor: (theme) => theme.palette.background.paper,
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.15)',
            },display: 'flex', flexDirection: 'column',flex:1
        }}>
            <CardHeader
                title={ <Box sx={{ display: 'flex', alignItems: 'center',justifyContent: 'center', }}>
                    <Typography sx={{ flexGrow: 1, textAlign: 'center',fontSize:titleFont ? titleFont :'20px' }}>{title}</Typography>
                    {total ?
                        /* Subheader aligned to the right with padding */
                        <Box sx={{ textAlign: 'right', paddingRight: 1 }}>
                            <Typography variant="body2" sx={{
                                fontWeight: 400,
                                fontSize: '1.2rem'
                            }}>
                                {total}
                            </Typography>
                        </Box>:null}
                </Box>}
                sx={{
                    backgroundColor: color,
                    color: (theme) => theme.palette.common.white,
                    padding: '2px', textAlign: 'center'
                }}
            />
            <CardContent sx={{
                marginTop:2,
                padding: '3px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', // Center the content vertically
                justifyContent: 'center',
                //maxHeight: 500,
                overflow: 'auto',height: cardHeight,overflowY: 'auto'
             // Center the content horizontally
            }}>
                {component}
                {footer}
            </CardContent>
        </Card>);
}

export const DBCardWithIconAndBG = ({title, component, color,total,Icon}) => {
   return( <Card sx={{
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        backgroundColor: color,
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.15)',
        },display: 'flex', flexDirection: 'column',flex:1
    }}>
        <CardContent sx={{
            padding: '3px',
            display: 'flex',
            maxHeight: 400, overflow: 'auto'// Center the content horizontally
        }}>
            <Box sx={{ display: 'flex', alignItems: 'left', justifyContent: 'center', flexDirection: 'row' }}>
                {/*<Icon sx={{ fontSize: 60 }} />*/}
                <Box sx={{ marginLeft: 4, textAlign: 'center' }}>
                    <Typography variant="h5">
                        {title}
                    </Typography>
                    <Typography variant="h4" >{total ? total : component}</Typography>
                </Box>
            </Box>
        </CardContent>
    </Card>)
}