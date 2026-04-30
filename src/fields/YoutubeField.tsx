import Typography, { TypographyProps } from '@mui/material/Typography';
import { useFieldValue } from 'ra-core';
import { ReactElement } from 'react';
import { ExtractRecordPaths, HintedString } from 'ra-core';
import { TableCellProps } from '@mui/material/TableCell';
import { validateVideoUrl } from '../utils';

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
    videoWidth?: string;
    videoHeight?: string;
    autoplay?: boolean;
    inputVal?: string
}

const YoutubeFieldImpl = <
    RecordType extends Record<string, any> = Record<string, any>,
>(
    props: RichTextFieldProps<RecordType>
) => {
    const { className, videoWidth = 800, videoHeight = 600, autoplay = true, inputVal, ...rest } = props;
    const value = useFieldValue(props);

    let toShow = undefined;
    if (value) {
      toShow = value;
    } else {
      toShow = inputVal;
    }    
    if (validateVideoUrl(toShow) !== undefined) {
        return;
    }    
    let videoId = toShow.split('.be/')[1]
    if (videoId.includes('?')) {
        videoId = videoId.split('?')[0];
    }    
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=1`;

    return (
        <Typography className={className} variant="body2" component="span">
            <iframe 
                id="iframe_content" 
                width={videoWidth}
                height={videoHeight}
                src={embedUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ minHeight: '315px', border: 0 }}
            ></iframe>
        </Typography>
    );
};
YoutubeFieldImpl.displayName = 'YoutubeFieldImpl';

export const YoutubeField = YoutubeFieldImpl;

export interface RichTextFieldProps<
    RecordType extends Record<string, any> = Record<string, any>,
> extends FieldProps<RecordType>,
        Omit<TypographyProps, 'textAlign'> {
}