import { useCreate, useCreateSuggestionContext } from 'react-admin';
import { Button, Dialog, DialogActions, DialogContent, TextField as MUITextField } from '@mui/material';
import { useState } from 'react';

export const CreateUserDialog = ({role}) => {
    const { filter, onCancel, onCreate } = useCreateSuggestionContext();
    const [create] = useCreate();
    const [open, setOpen] = useState(true);
    const [fullName, setFullName] = useState(filter || '');
    const [email, setEmail] = useState('');

    const handleSubmit = event => {
        event.preventDefault();
        //TODO Set a Random temporary password and send credentials as an email to the user
        create(
            'users',
            { data: { fullName: fullName,email:email,password:'test1234',role:role } },
            {
                onSuccess: (data) => {
                    console.log('User created', data);
                    onCreate(data);
                    setOpen(false);
                },
            }
        );
    };

    return (
        <Dialog open={open} onClose={onCancel}>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <MUITextField
                        label="User Name"
                        value={fullName}
                        onChange={event => setFullName(event.target.value)}
                        autoFocus
                    />
                    <MUITextField
                        label="Email Address"
                        value={email}
                        onChange={event => setEmail(event.target.value)}
                        autoFocus
                    />
                </DialogContent>
                <DialogActions>
                    <Button type="submit">Save</Button>
                    <Button onClick={onCancel}>Cancel</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
