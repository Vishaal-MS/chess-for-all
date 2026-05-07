import {useLocation, useNavigate} from 'react-router-dom';
import {Button, useRecordContext} from "react-admin";
import {Stack} from "@mui/material";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import {useResourceContext} from "ra-core";

const CustomPrevNextButtons = ({lineType = "show"}) => {

    const record = useRecordContext();
    const location = useLocation();
    const navigate = useNavigate();
    const resource = useResourceContext();

    const ids = location.state?.ids || [];
    const index = ids.indexOf(record?.id);

    const prevId = ids[index - 1];
    const nextId = ids[index + 1];

    const handleNavigation = (id: number) => {
        navigate(`/${resource}/${id}/${lineType}`, {state: {ids: ids, ...location.state}});
    };

    return (
        <Stack direction="row" display="flex" justifyContent="flex-end" mt={2} spacing={2}>
            <Button
                startIcon={<ArrowLeftIcon />}
                label="Previous"
                disabled={index <= 0}
                onClick={() => handleNavigation(prevId)}
            />
            <Button
                endIcon={<ArrowRightIcon />}
                label="Next"
                disabled={index >= ids.length - 1}
                onClick={() => handleNavigation(nextId)}
            />
        </Stack>
    );
};

export default CustomPrevNextButtons;