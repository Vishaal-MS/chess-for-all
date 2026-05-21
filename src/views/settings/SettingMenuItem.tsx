import { openDialog } from "@mahaswami/swan-service"
import { useUserMenu } from "react-admin";
import {
    ListItemIcon,
    ListItemText,
    MenuItem,
} from '@mui/material';
import { Settings } from "@mui/icons-material";
import { SettingsPage } from "./SettingPage"

export const SettingMenuItem = () => {
    const { onClose } = useUserMenu() ?? {};

    const handleOpenSettings = () => {
        onClose?.();
        openDialog(<SettingsPage width='65vw'/>)
    }
    
    return (
        <MenuItem onClick={handleOpenSettings}>
            <ListItemIcon>
                <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
        </MenuItem>
    )
}