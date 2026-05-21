import {
    Card, CardContent, CardActions, Stack, Typography, IconButton, Grid
} from '@mui/material';
import {
    Form, Labeled, required, SaveButton, SelectInput, TextField, useGetIdentity, useNotify
} from 'react-admin';
import {closeDialog, getLocalStorage, remoteLog, setLocalStorage} from '@mahaswami/swan-service';
import { SimpleFileInput } from "@mahaswami/swan-service";
import { useFormContext } from "react-hook-form";
import { Avatar, Box } from "@mui/material";
import { useRecordContext } from "react-admin";
import { useState } from "react";
import { VolumeOff, VolumeUp } from "@mui/icons-material";
import { handleEnableGameSound, handleMuteHowler } from "../../helpers/sounds.ts";

export const SettingsPage = () => {
    const { identity } = useGetIdentity();
    const notify = useNotify();
    let userDetails = JSON.parse(getLocalStorage("user"))
    userDetails.board_theme = window.glSettings.pieceStyleId

    if (!identity) return null;

    const updateSettings = async (data: any) => {
        try {
            // localStorage.setItem("pieceStyleId", data.board_theme);
            window.glSettings.changeBoardStyle(data.board_theme);
            // Note: If the image is changed the image_file_id will be an object contain file detials
            // so if it is not it type will be number 
            if (data.image_file_id && typeof data.image_file_id == "object") {
                const dataProvider = window.swanAppFunctions.dataProvider
                await dataProvider.update("users", { 
                    id: userDetails.id, 
                    data: { image_file_id: data.image_file_id } 
                });
                notify("Your profile has been updated, Logout and Login to see the changes.", { type: "info" })
            }
            closeDialog();
        } catch (error) {
            console.error(`Failed to update settings: ${error}`);
            remoteLog("Failed to update settings", error);
        }
    }

    return (
        <Form record={userDetails} onSubmit={updateSettings}>
            <SettingsForm/>
        </Form>
    );
}

const boardThemeChoices = [
    { id: 100, name: 'Classic' },              // Default
    { id: 107, name: 'Cartoon Fun' },          // Cartoon     
    { id: 101, name: 'Crystal Elegance' },     // Crystal
    { id: 115, name: 'Crystal Pieces' },       // Only Crystal Pieces
    { id: 105, name: 'Modern Pro' },           // WorldChess
    { id: 106, name: 'Ocean Blue' },           // Blue
    { id: 102, name: 'USCF' },                 // USCF
    { id: 104, name: 'Wooden Heritage' },      // Hamsburg
]

const isAppSoundEnabled = () => {
    const soundEnabled = getLocalStorage("is_app_sound_enabled");
    if (soundEnabled === null || soundEnabled === undefined) {
        setLocalStorage("is_app_sound_enabled", true);
        return true;
    }
    return soundEnabled;
};

const SettingsForm = () => {

    const [isSoundEnabled, setIsSoundEnabled] = useState(isAppSoundEnabled());
    const [boardTheme, setBoardTheme] = useState();

    const handleSoundChange = () => {
        setIsSoundEnabled(prev => {
            const isAppSoundEnabled = !prev;
            setLocalStorage("is_app_sound_enabled", isAppSoundEnabled);
            handleEnableGameSound();
            handleMuteHowler(!isAppSoundEnabled);
            return isAppSoundEnabled;
        });
    };

    const BoardTheme = () => {
        const record = useRecordContext();
        const themeId = boardTheme || record?.board_theme || '100';

        return (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Avatar 
                    src={`/assets/board_theme/${themeId}.png`} 
                    sx={{ height: "16rem", width: "16rem" }} variant='square'
                />
            </Box>
        )
    }

    return (
        <Stack gap={2}>
            <Card>
                <CardContent>
                    
                    <Grid item container md={12}>
                        <Grid item sm={12} md={5}>
                            <Stack
                                mb={2}
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Typography variant="h5" color="textSecondary">
                                    Settings
                                </Typography>
                                <IconButton onClick={handleSoundChange}>
                                    {isSoundEnabled ? <VolumeUp /> : <VolumeOff />}
                                </IconButton>
                            </Stack>
                            <UploadAvatarInput source="image_file_id"/>
                            <Grid sx={{ mt: '1rem'}}>
                                <Labeled>
                                    <TextField label='Name' source='fullName' />
                                </Labeled>
                            </Grid>
                            <Grid sx={{ mt: '1rem'}}>
                                <Labeled>
                                    <TextField source="email"/>
                                </Labeled>
                            </Grid>
                        </Grid>
                        <Grid item sm={12} md={7} sx={{ pl: '1rem' }}>
                            <SelectInput 
                                label={"Board Theme"} 
                                source='board_theme' 
                                defaultValue={100}
                                choices={boardThemeChoices} 
                                resettable={false}
                                validate={required()}
                                onChange={(event) => setBoardTheme(event.target.value)}
                            />
                            <BoardTheme />
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions
                    sx={{
                        paddingX: 2,
                        background: theme => theme.palette.background.default,
                    }}
                >
                    <SaveButton
                        variant="contained"
                        type="submit"
                        label='Save'
                    />
                </CardActions>
            </Card>
        </Stack>
    );
};

export default function UploadAvatarInput({ source }: { source: string }) {
  const userRecord = useRecordContext();
  const { watch } = useFormContext();
  const imageFileId = watch(source);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar 
            src={imageFileId?.src || userRecord?.avatar} 
            sx={{ height: "8rem", width: "8rem" }}
        />
      
        <SimpleFileInput 
            source={source} 
            label="Change Profile"
            inputProps={{ accept: "image/*" }}
        />
    </Box>
  );
}
