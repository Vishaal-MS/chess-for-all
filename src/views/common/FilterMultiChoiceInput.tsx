import {
    useInput,
    FieldTitle,
    InputProps,
    ChoicesProps, SelectInputProps,
} from 'react-admin';
import {
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Checkbox,
    ListItemText,
    FormHelperText,
    Typography
} from '@mui/material';
import { ReactElement } from 'react';

interface Choice {
    id: string | number;
    name: string;
}

interface FilterMultiChoiceInputProps
    extends Omit<InputProps, 'source'>,
    ChoicesProps {
    source: string;
    label?: string;
    choices: Choice[];
    style?: SelectInputProps['sx'];
}

const FilterMultiChoiceInput = ({
    source,
    label,
    choices,
    style,
    ...rest
}: FilterMultiChoiceInputProps): ReactElement => {
    const {
        field,
        fieldState,
        isRequired,
    } = useInput({
        source,
        ...rest,
    });

    return (
        <FormControl sx={{ minWidth: '10rem', maxWidth: '15rem'}} error={!!fieldState.error}>
            <InputLabel id={`${source}-label`} sx={{fontSize: '0.9rem', fontWeight: '0.5rem'}}>
                <FieldTitle label={label} source={source} isRequired={isRequired} />
            </InputLabel>
            <Select
                labelId={`${source}-label`}
                label={label}
                multiple
                displayEmpty
                value={field.value || []}
                onChange={field.onChange}
                sx={style ? style : {'& .MuiFilledInput-input': {paddingTop: '0.75rem'}}}
                renderValue={(selected: any) => {
                    if (!selected || selected.length === 0) return '';

                    const selectedChoices = choices.filter(choice => selected.includes(choice.id));

                    if (selectedChoices.length === 1) return <span style={{fontSize: '0.85rem'}}> {selectedChoices[0].name} </span>

                    return (
                        <span style={{fontSize: '0.85rem'}}>
                            {selectedChoices[0]?.name}{' '}
                            <Typography
                                component="span"
                                sx={{ fontSize: '0.8rem' }}
                                variant="body2"
                            >
                                {selectedChoices.length > 0 && `(+${selectedChoices.length - 1})`}
                            </Typography>
                        </span>
                    );
                }}
            >
                {choices.map(choice => (
                    <MenuItem key={choice.id} value={choice.id} dense
                        sx={{ py: 0.5, minHeight: '2rem' }}
                    >
                        <Checkbox checked={field.value?.includes(choice.id)}
                            size="small"
                            sx={{ p: 0.5 }}
                        />
                        <ListItemText primary={choice.name}
                            primaryTypographyProps={{ fontSize: '0.875rem' }}
                        />
                    </MenuItem>
                ))}
            </Select>
            <FormHelperText>{fieldState.error?.message}</FormHelperText>
        </FormControl>
    );
};

export default FilterMultiChoiceInput;
