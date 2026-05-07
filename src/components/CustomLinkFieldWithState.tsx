import {useRecordContext} from "react-admin";
import {useNavigate} from "react-router-dom";
import {IconButton, Typography} from "@mui/material";
import {isTenantAllowedCoaching} from "../businessLogic.ts";
import VisibilityIcon from "@mui/icons-material/Visibility";

export const CustomLinkFieldWithState = ({state = {}}) => {

    const record = useRecordContext();
    const navigate = useNavigate();
    const isPublisherLogin = state?.isFromSubscribedCurriculum === undefined;

    if (!record) return null;

    const lessonIds =  state.ids || [];
    if (!lessonIds.includes(record.lesson_id)) {
        lessonIds.push(record.lesson_id)
    }
    if (isPublisherLogin || state?.isFromSubscribedCurriculum) {
        return (
            <>
                <Typography sx={{textDecoration: 'underline', cursor: 'pointer', fontSize: '.9rem'}}
                            color="primary"
                            onClick={() => navigate(`/lessons/${record.lesson_id}/show`, {state: state})}>
                    {record?.lesson.name}
                </Typography>
            </>
        );
    } else if (isTenantAllowedCoaching()) {
        return (
            <span>
                <Typography component="span" sx={{ display: 'inline', fontSize: '.9rem' }}>
                    {record?.lesson?.name}
                </Typography>
                { record?.is_preview_enabled &&
                    <IconButton title="Preview" onClick={() => {navigate(`/lessons/${record.lesson_id}/show`,
                        {state: state})}} sx={(theme) => ({
                        ml: '0.5rem', borderRadius: '30%', width: '1.30rem', height: '1.25rem',
                        background: `linear-gradient(45deg,
                            ${theme.palette.secondary.dark} 0%, 
                            ${theme.palette.primary.dark} 100%)`,
                        color: theme.palette.primary.contrastText})}>
                        <VisibilityIcon sx={{ fontSize:'1rem' }} />
                    </IconButton>
                }
            </span>
        );
    }
}