import {closeDialog, dataProvider, openDialog, remoteLog} from "@mahaswami/vc-frontend";
import {useEffect, useState} from "react";
import {Button, Create, SimpleForm, TextInput, useNotify} from "react-admin";
import {Box} from "@mui/material";
import {ChessAIField} from "../../fields/ai_lesson/ChessAIField";
import Typography from "@mui/material/Typography";
import {StarRating} from "../../components/NumberedStar.tsx";
import ConnectWithoutContactSharpIcon from '@mui/icons-material/ConnectWithoutContactSharp';
import {currentTenantId, getUserId} from "../../backend/common_logics.ts";

export const PublisherProfileDialog = ({record}) => {
    const [hovered, setHovered] = useState();

    const subscribableData = record;
    const pubTenantId = subscribableData?.publisher_tenant_id ;
    const pubTenantName =  subscribableData?.publisher_tenant.name;
    const rating = subscribableData?.rating;
    const profile = subscribableData?.profile;
    const subscribable = subscribableData;
    const isSubscribed = subscribableData?.isSubscribed;

    return (
        <Box>
            <Box display="flex">
                <Typography>
                    <Box
                        display="flex"
                        gap={1}
                        sx={{ position: 'absolute', left: '1rem', top: '0.6rem', fontSize: '1.3rem' }}
                    >
                        {"About"} {pubTenantName}
                        <StarRating rating={rating} />
                    </Box>
                    <Box>
                        <Button
                            onMouseOver={() => setHovered(true)}
                            onMouseOut={() => setHovered(false)}
                            sx={{
                                color: (theme) => theme.palette.primary.dark,
                                fontSize: '1rem',
                                position: 'absolute',
                                right: '1.7rem',
                                top: '0.4rem',
                            }}
                            onClick={() => {
                                closeDialog();
                                openDialog(
                                    <CreateContactMessageDialog
                                        recordDetail={{ subscribable, pubTenantId, isSubscribed }}
                                    />
                                );
                            }}
                        >
                            {hovered ? 'Contact' : <ConnectWithoutContactSharpIcon />}
                        </Button>
                    </Box>
                </Typography>
                <Box sx={{ mt: '1rem' }}>
                    {profile?.config_value ? (
                        <ChessAIField key={profile?.id} source="config_value" record={profile} />
                    ) : (
                        <Typography variant="body1" color="textSecondary">
                            No profile available for this publisher.
                        </Typography>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

const CreateContactMessageDialog = ({recordDetail}) => {
    const notify = useNotify();
    const record = {
        subscribable_id: recordDetail?.subscribable?.id,
        review_date: new Date(),
        user_id: getUserId(),
        subscriber_tenant_id: recordDetail?.isSubscribed ? currentTenantId(): null,
        publisher_tenant_id: recordDetail?.pubTenantId,
        type: 'message',
        rating: '0',
        division_id: recordDetail?.subscribable?.curriculum?.division_id,
    };

    const onSuccess = () => {
        notify('Message delivered successfully');
        closeDialog();
    }
    return (
        <Create mutationOptions={{onSuccess}} resource={"reviews"} redirect={'/subscriptions'} >
            <Typography variant="h6" gutterBottom sx={{ml: '15px'}}>
                Add Message
            </Typography>
            <SimpleForm defaultValues={record} >
                <TextInput source="title" required/>
                <TextInput source="review" label="Message" multiline/>
            </SimpleForm>
        </Create>
    );
}