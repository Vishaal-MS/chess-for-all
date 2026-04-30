import Typography, { TypographyProps } from '@mui/material/Typography';
import { useFieldValue } from 'ra-core';
import { ReactElement } from 'react';
import { TableCellProps } from '@mui/material/TableCell';
import { ExtractRecordPaths, HintedString } from 'ra-core';
import { ChessBoardView } from './ChessBoardView';

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
    height?: string;
    isPGN?: boolean;
    inputVal?: string;
}

const ChessBoardFieldImpl = <
    RecordType extends Record<string, any> = Record<string, any>,
>(
    props: RichTextFieldProps<RecordType>
) => {
    const {
        className,isPGN,height,record,inputVal,
        ...rest
    } = props;
    const value = useFieldValue(props);

    return (
        <ChessBoardView inputVal={inputVal} record={record} value={value} isPGN={isPGN} height={height}  />   
    );
};
ChessBoardFieldImpl.displayName = 'ChessBoardFieldImpl';

export const ChessBoardField = ChessBoardFieldImpl;

export interface RichTextFieldProps<
    RecordType extends Record<string, any> = Record<string, any>,
> extends FieldProps<RecordType>,
        Omit<TypographyProps, 'textAlign'> {
}
