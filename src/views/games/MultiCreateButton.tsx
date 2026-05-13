import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ButtonProps } from 'react-admin';

interface MultiCreateButtonProps extends ButtonProps {
    options: {
        label: string;
        icon?: React.ReactNode;
        onClick?: () => void;
        path?: string;
    }[];
    icon?: React.ReactNode;
}

export const MultiCreateButton = ({
    options = [],
    icon = <AddIcon />,
    label = "Create",
    ...props
}: MultiCreateButtonProps) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => setAnchorEl(null);

    const handleNavigate = (path: string) => {
        navigate(path);
        handleClose();
    };

    const handleOptionBtnClick = (option: any) => {
        if (option.onClick) {
            option.onClick();
        }
        handleClose();
    };

    return (
        <>
            <Button
                id="multi-create-button"
                onClick={handleClick}
                startIcon={icon}
                size="small"
                {...props}
            >
                {label}
            </Button>
            <Menu
                id="multi-create-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        sx: {
                            minWidth: 180,
                        },
                    }
                }}
            >
                {options.map((option, index) => (
                    <MenuItem
                        key={index}
                        onClick={() =>
                            option.onClick
                                ? handleOptionBtnClick(option)
                                : option.path
                                    ? handleNavigate(option.path)
                                    : undefined
                        }
                    >
                        {option.icon && (
                            <ListItemIcon style={{ minWidth: 32 }}>
                                {option.icon}
                            </ListItemIcon>
                        )}
                        <ListItemText>
                            <Typography variant="body2" fontWeight={500}>
                                {option.label}
                            </Typography>
                        </ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};
