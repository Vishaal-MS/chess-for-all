import {Box, Card, CardContent, Typography} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import {Title} from "react-admin";

export const LinkExpiredPage = () => {
    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            bgcolor="white"
            px="2rem"
        >
            <Card sx={{ maxWidth: '25rem', width: '30rem' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        width="3rem"
                        height="3rem"
                        borderRadius="5rem"
                        bgcolor={(theme) => theme.palette.error.light}
                        mx="auto"
                        mb="1rem"
                    >
                        <ErrorOutlineIcon sx={{color: (theme) => theme.palette.error.dark, fontSize: '1.5rem' }} />
                    </Box>
                    <Title title="Link Expired" />
                    <Typography variant="body1" color="textSecondary">
                        This link has expired.
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};