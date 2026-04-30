import Typography, { TypographyProps } from '@mui/material/Typography';
import { useFieldValue, useTranslate } from 'ra-core';
import { ReactElement } from 'react';
import { TableCellProps } from '@mui/material/TableCell';
import { ExtractRecordPaths, HintedString } from 'ra-core';

type TextAlign = TableCellProps['align'];
type SortOrder = 'ASC' | 'DESC';

export interface FieldProps<
    RecordType extends Record<string, any> = Record<string, any>,
> {
    sortBy?: HintedString<ExtractRecordPaths<RecordType>>;
    sortByOrder?: SortOrder;
    source: ExtractRecordPaths<RecordType>;
    label?: string | ReactElement | boolean;
    sortable?: boolean;
    className?: string;
    cellClassName?: string;
    headerClassName?: string;
    textAlign?: TextAlign;
    emptyText?: string;
    fullWidth?: boolean;
    record?: RecordType;
    resource?: string;
}

const CustomRichTextFieldImpl = <
    RecordType extends Record<string, any> = Record<string, any>,
>(
    props: RichTextFieldProps<RecordType>
) => {
    const {
        className,
        ...rest
    } = props;
    const value = useFieldValue(props);

    return (
        <Typography className={className}
        variant="body2"
        component="span">
            <span   dangerouslySetInnerHTML={{
                        __html: value,
                    }}
            />
        </Typography>
    );
};
CustomRichTextFieldImpl.displayName = 'RichTextFieldImpl';

export const CustomRichTextField = CustomRichTextFieldImpl;

export interface RichTextFieldProps<
    RecordType extends Record<string, any> = Record<string, any>,
> extends FieldProps<RecordType>,
        Omit<TypographyProps, 'textAlign'> {
}