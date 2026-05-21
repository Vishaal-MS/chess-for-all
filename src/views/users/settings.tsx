import { Grid, Button } from '@mui/material';

const handleRequestClick = () => {
    alert('Not available in Demo Mode');
}
export const AppSettings = () => {
    return (
        <Grid container spacing={2} sx={{padding:4}}>
            <Grid item xs={12}>
                <Button variant="contained" color="primary" onClick={handleRequestClick}>Request Publishing Access</Button>
            </Grid>
        </Grid>
    );
}