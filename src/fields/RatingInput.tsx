import {Rating} from '@mui/material';
import { useInput } from 'ra-core';

import {
    CommonInputProps,
    InputHelperText,
    Labeled,
    LabeledProps,
} from 'ra-ui-materialui';


export const RatingInput = (props:CommonInputProps) => {
    const { onChange, onBlur, label, ...rest } = props;
    const {
        field,
        fieldState : {invalid, error},
        formState: { isSubmitted },
    }= useInput({
        // Pass the event handlers to the hook but not the component as the field property already has them.
        // useInput will call the provided onChange and onBlur in addition to the default needed by react-hook-form.
        onChange,
        onBlur,
        ...rest,
    });

    return (
        <Rating  {...field}
           label={label} defaultValue={field.value}
        />
    );
};