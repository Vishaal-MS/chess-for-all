import {Box, Typography} from "@mui/material";
import {Button, useNotify} from "react-admin";
import {closeDialog} from "@mahaswami/vc-frontend";
import {handleCurriculumDuplicate, handleLessonDuplicate} from "../backend/curriculum.ts";
import {useState} from "react";
import {useNavigate} from "react-router-dom";

export const DuplicateDialog = ({record, resource}) => {
    const notify = useNotify();
    const navigate = useNavigate();
    const dataProvider = window.swanAppFunctions.dataProvider;
    const [isMakeACopyLoading, setIsMakeACopyLoading] = useState(false);

    const handleMakeACopy = async () => {
        setIsMakeACopyLoading(true)
        if(resource === "curriculum") {
            handleCurriculumDuplicate(dataProvider, record, navigate)
                .then(() => {
                    notify("Curriculum copied!", {type: 'success'});
                }).finally(() => {
                setIsMakeACopyLoading(false);
                closeDialog();
            })
        } else if (resource === "lessons") {
            handleLessonDuplicate(dataProvider, record, navigate)
                .then(() => {
                    notify("Lesson copied!", {type: 'success'});
                }).finally(() => {
                setIsMakeACopyLoading(false);
                closeDialog();
            })
        }
    }
    const resourceName = resource === "curriculum" ? "Curriculum" : "Lesson";
    return (
        <Box>
            <Typography variant="h6">{`Do you want to duplicate this ${resourceName}?`}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2, gap:1 }}>
                <Button variant="outlined" color={"error"} disabled={isMakeACopyLoading} label={"Cancel"} onClick={() => closeDialog()}/>
                <Button variant="contained" color="primary" label={"Duplicate"} onClick={()=> handleMakeACopy()} loading={isMakeACopyLoading}/>
            </Box>
        </Box>
    );
}