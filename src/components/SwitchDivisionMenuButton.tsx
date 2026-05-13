import { MouseEvent, ReactNode, useState, useEffect } from 'react';
import { Box, Button, Menu, MenuItem, styled } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getLocalStorage, setLocalStorage, useRealtimeComms } from '@mahaswami/vc-frontend';
import { getDivisionId, isLargeAcademy, isDivisionAdmin, isDivisionCoach } from "../businessLogic.ts";
import { useNavigate } from 'react-router-dom';
import { useRefresh } from "react-admin";
import { isOrgAdmin } from '../businessLogic.ts';

export const SwitchDivisionMenuButton = (props: SwitchProjectMenuButtonProps) => {
    const {icon = DefaultIcon} = props;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [state, setState] = useState({
        loading: true,
        eligibleDivisions: []
    })
    const navigator = useNavigate();
    const realtimeComms = useRealtimeComms();
    const refresh = useRefresh();
    const [divisionRefreshKey, setDivisionRefreshKey] = useState(Date.now());

    useEffect(() => {
        const topic = "divisions_updated";
        const handleUpdate = (content, fromUserId, receivedTopic) => {
            setDivisionRefreshKey(Date.now())
            refresh();
        };
        realtimeComms.subscribe(topic, handleUpdate);
        return () => {
            realtimeComms.unsubscribe(topic, handleUpdate);
        };
    }, []);

    useEffect(() => {
        const fetchDivisions = async () => {
            try {
                const dataProvider = (window as any).swanAppFunctions.dataProvider
                let {data: divisions} = await dataProvider.getList("divisions");
                if (isDivisionAdmin() || isDivisionCoach()) {
                    divisions = divisions.filter(division => parseInt(division.id) === parseInt(getDivisionId()));
                    setLocalStorage("selected_division_name", divisions[0].name);
                }
                setState({
                    loading: false,
                    eligibleDivisions: divisions
                })
            } catch (err) {
                console.error(err);
            }
        }
        if (isLargeAcademy()) {
            fetchDivisions();
        }
    }, [divisionRefreshKey])

    const switchDivision = (division: any) => async (): Promise<void> => {
        setAnchorEl(null);
        setLocalStorage("selected_division_id", division.id)
        setLocalStorage("selected_division_name", division.name)
        const dataProvider = window.swanAppFunctions.dataProvider;
        const { data: classes } = await dataProvider.getList("classes");
        setLocalStorage("total_classes_at_login", classes.length);
        navigator('/');
    };

    const handleProjectClick = (event: MouseEvent<HTMLElement>): void => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (): void => {
        setAnchorEl(null);
    };

    const {eligibleDivisions} = state;
    const eligibleCount: number = eligibleDivisions.length;
    const selectedProject = getLocalStorage('selected_division_id');

    return (
        <>
            {eligibleCount > 0 &&
                <Root component="span">
                    <Button
                        color="inherit"
                        variant="text"
                        aria-controls="simple-menu"
                        aria-label=""
                        aria-haspopup="true"
                        onClick={handleProjectClick}
                        startIcon={icon}
                        endIcon={isOrgAdmin() ? <ExpandMoreIcon fontSize="small"/> : null}
                    >
                        {/*{getDivisionName() || "Select Division"}*/}
                    </Button>
                    {isOrgAdmin() &&
                    <Menu
                        id="simple-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        {eligibleDivisions.map(division => (
                            <MenuItem
                                key={division.id}
                                onClick={switchDivision(division)}
                                selected={division.id === selectedProject}
                            >
                                {division.name}
                            </MenuItem>
                        ))}
                    </Menu> }
                </Root>

            }
        </>
    );
};

const DefaultIcon = <FolderIcon />;
const PREFIX = 'SwitchProjectMenuButton';

export const SwitchProjectMenuButtonClasses = {};

const Root = styled('span', {
    name: PREFIX,
    overridesResolver: (props, styles) => styles.root,
})({}) as typeof Box;

export interface SwitchProjectMenuButtonProps {
    icon?: ReactNode;
}