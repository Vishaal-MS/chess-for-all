//TODO: This class level duplication may not be necessary
// Extension list overriding alone may be enough

import { FormHelperText } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { ReactElement, ReactNode, useEffect, useRef } from 'react';

import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { Editor, EditorContent, EditorOptions, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import clsx from 'clsx';
import { useInput, useResourceContext } from 'ra-core';
import {
    CommonInputProps,
    InputHelperText,
    Labeled,
    LabeledProps,
} from 'ra-ui-materialui';
import ImageResize from 'tiptap-extension-resize-image';
import Video from './Video';

import { RichTextInputToolbar, TiptapEditorProvider } from 'ra-input-rich-text';
import { addLoadingIndicator, uploadImage } from "../../utils";
import { ChessBoard } from './ChessBoardTipTapExtension';
import { getSuggestionItems } from './EditorCommandsList';
import { SwanImage } from './ImageTipTapExtension';
import { LessonBlock } from './LessonBlockTipTapExtension';
import { Commands, renderItems } from './SlashTiptapCommands';
import { SwanVideo } from './VideoTipTapExtension';
import { clearChessBoards, loadChessBoards } from './ai_lesson_utils';
import { SectionBreak } from "./section_break_tiptap_extension.ts";

export const ChessAIInput = (props: RichTextInputProps) => {
    const {
        className,
        defaultValue = '',
        disabled = false,
        editorOptions = DefaultEditorOptions,
        fullWidth,
        helperText,
        label,
        readOnly = false,
        source,
        sx,
        toolbar,
    } = props;

    const resource = useResourceContext(props);
    const {
        id,
        field,
        isRequired,
        fieldState,
        formState: { isSubmitted },
    } = useInput({ ...props, source, defaultValue });


    function handleImageFile(file, event, view) {
        try {
            let _URL = window.URL || window.webkitURL;
            let img = new Image(); 
            img.src = _URL.createObjectURL(file);
            img.onload = async function () {
                if (this.width > 5000 || this.height > 5000) {
                    window.alert("Your images need to be less than 5000 pixels in height and width."); // display alert
                } else {
                    // valid image so upload to server
                    const loadingIndicator = addLoadingIndicator();
                    const resource = 'lessons';
                    let response = await uploadImage(file, resource)
                    console.log('Image uploaded successfully', response);
                    let imageFileId = response; 
                    const {schema} = view.state;
                    const coordinates = view.posAtCoords({left: event.clientX, top: event.clientY});
                    const node = schema.nodes.swanImage.create({image_id: imageFileId}); 
                    const transaction = view.state.tr.insert(coordinates.pos, node); 
                    await view.dispatch(transaction);
                    setTimeout(() => {
                        loadingIndicator.style.display = 'none';
                    }, 200);
                }
            };
        } catch (error) {
            console.error('Error uploading image', error);
            if (error) {
                window.alert("There was a problem uploading your image, please try again.");
            }
        }
    }    

    function handleVideoFile(file, event, view) {
        try {
            let video = document.createElement('video');
            let URL = window.URL || window.webkitURL;
            video.src = URL.createObjectURL(file);
            video.onloadedmetadata =  async function () {
                if (this.videoWidth > 5000 || this.videoHeight > 5000) {
                    window.alert("Your videos need to be less than 5000 pixels in height and width."); // display alert
                }else {
                    const loadingIndicator = addLoadingIndicator();
                    const resource = 'lessons';
                    let response = await uploadImage(file, resource);
                    console.log('Video uploaded successfully', response);
                    let videoFileId = response; 
                    const {schema} = view.state;
                    const coordinates = view.posAtCoords({left: event.clientX, top: event.clientY});
                    const node = schema.nodes.swanVideo.create({video_id: videoFileId}); 
                    const transaction = view.state.tr.insert(coordinates.pos, node); 
                    await view.dispatch(transaction);                    
                    setTimeout(() => {
                        loadingIndicator.style.display = 'none';
                    }, 200);
                }
            };
        } catch (error) {
            console.error('Error uploading video', error); // handle the error
            if (error) {
                window.alert("There was a problem uploading your video, please try again.");
            }
        }
    }

    function handleImageAndVideoUpload(event, view) {
        let file = event.dataTransfer.files[0]; // the dropped file
        let filesize = ((file.size / 1024) / 1024).toFixed(4); // get the filesize in MB
        if ((file.type === "image/jpeg" || file.type === "image/png")) {
            // check valid image type under 10MB
            if (filesize < 10) {
                handleImageFile(file, event, view);
            } else {
                window.alert("Images need to be less than 10mb in size.");
            }
        }
        // Check for valid video file type and size (e.g., .mp4, .webm, .ogg)
        else if ((file.type === "video/mp4" || file.type === "video/webm" || file.type === "video/ogg")) { // Check valid video type under 50MB
            if (filesize < 200) { // Temporarly allowing less then 50mb to 200mb for video uploading
                handleVideoFile(file, event, view);
            }  else {
                window.alert("Videos need to be less than 200mb in size.");
            }
        }
        else {
            window.alert("Invalid file type. Please upload an image or video.");
        }
    }

    const editor = useEditor(
        {
            ...editorOptions,
            editable: !disabled && !readOnly,
            content: field.value,
            editorProps: {
                ...editorOptions?.editorProps,
                attributes: {
                    ...editorOptions?.editorProps?.attributes,
                    id,
                },
                handleDrop: function( view, event, slice, moved){
                    if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) { // if dropping external files
                        // handle the image or video upload
                        handleImageAndVideoUpload(event, view);
                        return true; // handled
                    }
                    return false; // not handled use default behaviour
                }
            },
        },
        [disabled, editorOptions, readOnly, id]
    );



    const { error, invalid, isTouched } = fieldState;
    const renderedBlockIds = new Set();
    let expectedBlockIds = new Set();
    const initialRenderDone = useRef(false);

    // Set expectedIds after loading content
    function collectExpectedIds(editor) {
      const json = editor.getJSON();
      const ids = new Set();
      function traverse(node) {
        if (node.type === 'lessonBlock' && node.attrs?.lesson_block_id) {
          ids.add(node.attrs.lesson_block_id);
        }
        if (node.content) {
          node.content.forEach(traverse);
        }
      }

      traverse(json);
      // console.log('Collected IDs:', ids);
      return ids;
    }


    useEffect(() => {
        if (!editor) return;

        const { from, to } = editor.state.selection;

        editor.commands.setContent(field.value, false, {
            preserveWhitespace: true,
        });
        editor.commands.setTextSelection({ from, to });

        expectedBlockIds = collectExpectedIds(editor);
        if (expectedBlockIds.size === 0) {
            initialRenderDone.current = true;
            console.log("No lesson blocks found in content, setting initialRenderDone to true");
        }
        const handleBlockRenderEvent = (e) => {
          renderedBlockIds.add(e.detail.lesson_block_id);
        //   console.log("Rendered Block IDs:", renderedBlockIds,
        //      "Expected Block IDs:", expectedBlockIds, "Initial Render Done:", initialRenderDone.current);
          if (!initialRenderDone.current && renderedBlockIds.size === expectedBlockIds.size) {
            initialRenderDone.current = true;
            renderedBlockIds.clear();            
            setTimeout(() => loadChessBoards())
            return;
          }
          // NOTE: if initialRenderDone is true this is a subsequent render
          if (initialRenderDone.current) {
            setTimeout(() => loadChessBoards())
          }
        };
        const handleBlockInsertEvent = (e) => {
            expectedBlockIds.add(e.detail.lesson_block_id);
        }

        editor.on('destroy', () => {
            console.log('Editor is destroyed');
            setTimeout(() => {
                clearChessBoards();
            }, 1000);
        })
        document.addEventListener('lessonblock:rendered', handleBlockRenderEvent);
        document.addEventListener('lessonblock:inserted', handleBlockInsertEvent);
        return () => {
          document.removeEventListener('lessonblock:rendered', handleBlockRenderEvent);
          document.removeEventListener('lessonblock:inserted', handleBlockInsertEvent);
        };
    }, [editor, field.value]);

    useEffect(() => {
        if (!editor) {
            return;
        }

        const handleEditorUpdate = () => {
            if (editor.isEmpty) {
                field.onChange('');
                field.onBlur();
                return;
            }

            const html = editor.getHTML();
            field.onChange(html);
            field.onBlur();
        };

        editor.on('update', handleEditorUpdate);
        editor.on('blur', field.onBlur);
        return () => {
            editor.off('update', handleEditorUpdate);
            editor.off('blur', field.onBlur);
        };
    }, [editor, field]);

    return (
        <Root
            className={clsx(
                'ra-input',
                `ra-input-${source}`,
                className,
                fullWidth ? 'fullWidth' : ''
            )}
            sx={sx}
        >
            <Labeled
                isRequired={isRequired}
                label={label}
                id={`${id}-label`}
                color={fieldState?.invalid ? 'error' : undefined}
                source={source}
                resource={resource}
                fullWidth={fullWidth}
            >
                <RichTextInputContent
                    editor={editor}
                    error={error}
                    helperText={helperText}
                    id={id}
                    isTouched={isTouched}
                    isSubmitted={isSubmitted}
                    invalid={invalid}
                    toolbar={toolbar || <RichTextInputToolbar />}
                />
            </Labeled>
        </Root>
    );
};

export const DefaultEditorOptions: Partial<EditorOptions> = {
    extensions: [
        StarterKit,
        Underline,
        Link,
        TextAlign.configure({
            types: ['heading', 'paragraph'],
        }),
       /* TipTapImage.configure({
            inline: true,
        }),*/
        ImageResize,
        Video,
        TextStyle, // Required by Color
        Color,
        Highlight.configure({ multicolor: true }),
        Commands.configure({
            suggestion: {
              items: getSuggestionItems,
              render: renderItems
            }
        }),
        ChessBoard,
        LessonBlock,
        SwanImage,
        SwanVideo,
        SectionBreak,
        ],
};

export type RichTextInputProps = CommonInputProps &
    Omit<LabeledProps, 'children'> & {
        disabled?: boolean;
        readOnly?: boolean;
        editorOptions?: Partial<EditorOptions>;
        toolbar?: ReactNode;
        sx?: (typeof Root)['defaultProps']['sx'];
    };

const PREFIX = 'ChessAIInput';
const classes = {
    editorContent: `${PREFIX}-editorContent`,
};
const Root = styled('div', {
    name: PREFIX,
    overridesResolver: (props, styles) => styles.root,
})(({ theme }) => ({
    '&.fullWidth': {
        width: '100%',
    },
    [`& .${classes.editorContent}`]: {
        width: '100%',
        '& .ProseMirror': {
            minHeight: '170px',
            backgroundColor: theme.palette.background.default,
            borderColor:
                theme.palette.mode === 'light'
                    ? 'rgba(0, 0, 0, 0.23)'
                    : 'rgba(255, 255, 255, 0.23)',
            borderRadius: theme.shape.borderRadius,
            borderStyle: 'solid',
            borderWidth: '1px',
            padding: theme.spacing(1),

            '&[contenteditable="false"], &[contenteditable="false"]:hover, &[contenteditable="false"]:focus':
                {
                    backgroundColor: theme.palette.action.disabledBackground,
                },

            '&:hover': {
                backgroundColor: theme.palette.action.hover,
            },
            '&:focus': {
                backgroundColor: theme.palette.background.default,
            },
            '& p': {
                margin: '0 0 1em 0',
                '&:last-child': {
                    marginBottom: 0,
                },
            },
        },
    },
}));

/**
 * Extracted in a separate component so that we can remove fullWidth from the props injected by Labeled
 * and avoid warnings about unknown props on Root.
 */
const RichTextInputContent = ({
    editor,
    error,
    helperText,
    id,
    invalid,
    toolbar,
}: RichTextInputContentProps) => (
    <>
        <TiptapEditorProvider value={editor}>
            {toolbar}
            <EditorContent
                aria-labelledby={`${id}-label`}
                className={classes.editorContent}
                editor={editor}
            />
        </TiptapEditorProvider>
        <FormHelperText
            className={invalid ? 'ra-rich-text-input-error' : ''}
            error={invalid}
        >
            <InputHelperText error={error?.message} helperText={helperText} />
        </FormHelperText>
    </>
);

export type RichTextInputContentProps = {
    className?: string;
    editor?: Editor;
    error?: any;
    helperText?: string | ReactElement | false;
    id: string;
    isTouched: boolean;
    isSubmitted: boolean;
    invalid: boolean;
    toolbar?: ReactNode;
};


