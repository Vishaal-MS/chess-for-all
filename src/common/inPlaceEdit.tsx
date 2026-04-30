import { useState } from "react";
import {IconButton} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import {TextField} from "react-admin";

export const InPlaceEdit = ({ record, handleOnSave, refresh, source }) => {
    const [rowId, setRowId] = useState(null);
    const [editedRecord, setEditedRecord] = useState('');

    const handleSave = async (id) => {
        await handleOnSave(id, editedRecord);
        await handleCancel();
    };

    const handleRowEdit = async (record) => {
        setRowId(record.id);
        setEditedRecord(record.position_number);
    };

    const handleCancel = async () => {
        setRowId(null);
        refresh();
    };

    return (
        <div>
            {rowId === record.id ? (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '6vw' }}>
                        <input
                            type="number"
                            value={editedRecord}
                            onChange={(e) => setEditedRecord(e.target.value)}
                            autoFocus
                            style={{
                                width: '100%',
                                fontSize: '0.875rem',
                                padding: '6px 8px',
                                border: '1px solid #c4c4c4',
                                outline: 'none',
                                borderRadius: '4px',
                                backgroundColor: '#f9f9f9',
                                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
                                transition: 'border 0.3s, box-shadow 0.3s',
                            }}
                        />
                    </div>
                    <IconButton color="primary" size="small" onClick={() => handleSave(record.id)}>
                        <SaveIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={handleCancel}>
                        <CancelIcon fontSize="small" />
                    </IconButton>
                </div>
            ) : (
                <TextField
                    source={source}
                    label={source}
                    style={{ cursor: 'pointer' }}
                    onDoubleClick={() => handleRowEdit(record)}
                />
            )}
        </div>
    );
};