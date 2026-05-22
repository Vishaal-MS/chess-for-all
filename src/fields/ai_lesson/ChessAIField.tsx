import Typography, { TypographyProps } from '@mui/material/Typography';
import { useTranslate } from 'ra-core';
import * as React from 'react';

import { FieldProps, Loading } from 'react-admin';
import { genericMemo, getFileDownloadURL } from '../../utils';
import {
    clearAnimation,
    clearBubblesAndCheckMark,
    clearChessBoards,
    collectExpectedIds,
    loadChessBoards
} from "./ai_lesson_utils";

import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { EditorOptions, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageResize from 'tiptap-extension-resize-image';
import Video from './Video';

import {remoteLog, setLocalStorage, useRealtimeComms} from "@mahaswami/vc-frontend";
import { InputHelperText } from 'react-admin';
import {
    getAssignmentBlocksByAssignmentId,
    getAssignmentById,
    getClassProgressWithClassIdAndLessonId,
    updateAssignment
} from "../../backend/assignments";
import { isCoach, isStudent } from "../../backend/common_logics";
import { AssignmentBlockStatus } from "../../helpers/constants.ts";
import { ChessBoard } from './ChessBoardTipTapExtension';
import { ArrowLeft, ArrowRight, Replay } from "@mui/icons-material";
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { SwanImage } from './ImageTipTapExtension.tsx';
import { LessonBlock } from './LessonBlockTipTapExtension';
import { SwanVideo } from './VideoTipTapExtension.tsx';
import { CircularProgress } from '@mui/material';
import {useLocation, useNavigate} from "react-router-dom";
import {getBgMusicHowler, playBlockCompleteSound, removeGameSoundFromLocalStorage, createHowlerInstance, isAppSoundEnabled} from "../../helpers/sounds.ts";
import {useEffect} from "react";

//TODO: Duplicate. Need to consolidate
export const DefaultEditorOptions: Partial<EditorOptions> = {
    extensions: [
        StarterKit,
        Underline,
        Link,
        TextAlign.configure({
            types: ['heading', 'paragraph'],
        }),
        /*Image.configure({
            inline: true,
        }),*/
        ImageResize,
        Video,
        TextStyle, // Required by Color
        Color,
        Highlight.configure({ multicolor: true }),
        ChessBoard,
        SwanImage,
        SwanVideo,
        LessonBlock
    ],
};

import {  Box, Button, FormHelperText } from '@mui/material';
import { Editor, EditorContent } from '@tiptap/react';
import { TiptapEditorProvider } from 'ra-input-rich-text';

export type RichTextInputContentProps = {
    className?: string;
    editor?: Editor;
    error?: any;
    helperText?: string | React.ReactElement | false;
    id: string;
    isTouched: boolean;
    isSubmitted: boolean;
    invalid: boolean;
    toolbar?: React.ReactNode;
};

const PREFIX = 'ChessAIField';
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

// Used to share the lessonBlocks data to the titptap lessonBlock extension
const ChessAiFieldContext = React.createContext({
    lessonBlocks: null,
});
export const useAiField = () => {
    let newContext = React.useContext(ChessAiFieldContext);
    if (!newContext) {
        throw new Error("useAiField should be used under ChessAiFieldContext")
    }
    return newContext
}

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
            <EditorContent
                aria-labelledby={`${id}-label`}
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


const ChessAIFieldImpl =  <
    RecordType extends Record<string, any> = Record<string, any>,
    >(
    props: RichTextFieldProps<RecordType>
) => {
    const {
        source,
        className,
        emptyText,
        sx,
        ...rest
    } = props;

    const location = useLocation();
    const navigate = useNavigate();
    const settings = React.useRef<any>({});
    const initialIndex = location.state?.currentIndex || 0;

    const translate = useTranslate();
    const [state, setState] = React.useState<any>({
        loading: true,
        value: undefined,
        blocks: [],
        currentIndex: initialIndex,
        isLimitToOneSection: false,
        lessonBlocks: null,
        isAdvancing: false,
        howler: null,
    });
    const assignmentBlocksRef = React.useRef<any>(null);
    const assignmentRef = React.useRef<any>(null);

    const realtimeComms = useRealtimeComms();

    // Fetch lesson content based on record ID
    //TODO: Seems like this is not needed. To be reviewed
//  const valueFromField = useFieldValue(props);

    // Update value only after the lesson data is loaded
    React.useEffect(() => {
        const fetchValue = async (lessonId) => {
            try {
                const dataProvider = window.swanAppFunctions.dataProvider;
                let data = { assignment: {}, lesson: {}, assignmentBlocks: [] };
                let controlOptions = {isLimitToShowSingleSection: undefined, howler: undefined};

                if (props?.assignmentId) {
                    const [assignmentBlocks, assignment] = await Promise.all([
                        getAssignmentBlocksByAssignmentId(props.assignmentId),
                        getAssignmentById(props.assignmentId),
                    ]);
                    const classProgress = await getClassProgressWithClassIdAndLessonId(assignment.class_id, lessonId)
                    data = {...data, assignment, assignmentBlocks};
                    controlOptions.isLimitToShowSingleSection = classProgress?.is_limit_to_show_single_section;
                    settings.current.voiceOverEnabled = Boolean(classProgress?.is_voice_over_enabled);
                    setLocalStorage("is_game_sound_enabled", classProgress?.is_game_sound_enabled);
                    if (classProgress?.background_music?.music_attachment_file_id) {
                        const bgMusicId = classProgress?.background_music?.music_attachment_file_id;
                        controlOptions.howler = getBgMusicHowler(bgMusicId);
                    }
                } else {
                    settings.current.voiceOverEnabled = true;
                }
                // Fetching all the lesson blocks and supply it to the context.
                const { data: lessonBlockMappings } = await dataProvider.getList("lesson_block_mapping", {
                    filter: { lesson_id: lessonId },
                    meta: { prefetch: ["lesson_blocks"], scopingEscapeHatch: true }
                });
                const { data: lessons } = await dataProvider.getOne("lessons", { id: lessonId });
                data.lesson = lessons;
                data.lessonBlocks = lessonBlockMappings.map(mapping => mapping.lesson_block);
                const { lesson, lessonBlocks, assignmentBlocks, assignment } = data;
                let isLimitToOneSection: boolean = false;
                if (lesson?.is_limit_to_show_single_section === true) { // Check if the lesson has a section limit
                    if (controlOptions.isLimitToShowSingleSection === false) {
                        isLimitToOneSection = false;
                    } else {
                        isLimitToOneSection = true;
                    }
                }
                assignmentBlocksRef.current = assignmentBlocks;
                assignmentRef.current = assignment;

                if (lesson && lesson.content) {
                    if (isLimitToOneSection && (isCoach() ? (!props?.assignmentId) : true) ) {
                        const blocks = lesson.content.split(/<section-break>|<\/section-break>/gi).filter(Boolean);
                        setState((prev) => (
                            {
                                ...prev,
                                loading: false,
                                value:  blocks[state.currentIndex],
                                blocks,
                                isLimitToOneSection,
                                lessonBlocks: lessonBlocks,
                                howler: controlOptions.howler,
                            }
                        ));
                    } else {
                        setState((prev) => ({...prev, loading: false, value: lesson.content,
                            lessonBlocks: lessonBlocks, howler: controlOptions.howler}));
                    }
                } else {
                    setState((prev) => ({...prev, loading: false, value: "No Content"}));
                }
            } catch (err) {
                console.error('Failed to fetch Lesson', err);
                remoteLog("Failed to fetch Lesson: ", err);
            }
        }
        if (props.lessonId) {
            fetchValue(props.lessonId);
        }

        if (props.record && props.record[source]) {
            setState({ loading: false, value: props.record[source] });
        }
        
            // else {
            //         setValue(valueFromField); // Fallback if there's no record ID
            //         localStorage.removeItem('current_lesson_id');
            // }
    }, []);


    const editorOptions = DefaultEditorOptions
    const { loading, value, currentIndex, blocks, isLimitToOneSection, isAdvancing, howler, assignmentBlocks } = state;
    const isSectionMode = isLimitToOneSection && (isCoach() ?  (!props?.assignmentId) : true);
    const isAllBlocksCompleted = assignmentBlocks?.every(
        ab => ![AssignmentBlockStatus.NOT_STARTED, AssignmentBlockStatus.IN_PROGRESS].includes(ab.status));
    const helperText = "";

    useEffect(() => {
        if (howler !== null) {
            howler?.play(); // Play the background music if howler is set
        }
        return () => {
            if (howler !== null) {
                howler?.stop(); // Stop the background music when the component unmounts
                howler?.unload(); // clear the Howler instance
            }
        }
    }, [howler]);

    const id = props.id + "-chessaifield";
    const renderedBlockIds = new Set();
    let expectedBlockIds = new Set();

    const editor = useEditor(
        {
            ...editorOptions,
            editable: false,
            content: value,
            editorProps: {
                ...editorOptions?.editorProps,
                attributes: {
                    ...editorOptions?.editorProps?.attributes,
                    id,
                },
            },
        },
        [ editorOptions, id, value]
    );

    const updateNavigationState = (newIndex: number) => {
        navigate(".", {replace: true, state: {...location.state, currentIndex: newIndex}});
    };

    const getResumeBlockIndex = () => {
        // Resume from the first not_started or in_progress block
        let incompleteLessonBlockIds =
            assignmentBlocksRef.current?.filter((ab) => AssignmentBlockStatus.IN_PROGRESS === ab.status
                || AssignmentBlockStatus.NOT_STARTED === ab.status)
            .map(ab => ab.lesson_block_id);
        let blockIndexInContent = -1;
        if (incompleteLessonBlockIds?.length > 0) {
             blockIndexInContent = blocks?.findIndex(blockContent =>
                incompleteLessonBlockIds.some(blockId =>
                    blockContent.includes(`lesson_block_id="${blockId}"`))
            );
        }
        return {blockIndexInContent, incompleteLessonBlockIds};
    }

    const handleResume = () => {
        const {blockIndexInContent, incompleteLessonBlockIds} = getResumeBlockIndex();
        if (incompleteLessonBlockIds?.length > 0 && blockIndexInContent !== -1) {
            setState(prev => ({
                ...prev,
                currentIndex: blockIndexInContent,
                value: blocks[blockIndexInContent]
            }));
            updateNavigationState(blockIndexInContent);
        }
    }

    const handleNext = () => {
        const index = Math.min(currentIndex + 1, blocks.length - 1);
        setState(prev => ({
            ...prev,
            currentIndex: index,
            value: blocks[index]
        }));
        updateNavigationState(index);
    };

    const handlePrev = () => {
        const index = Math.max(currentIndex - 1, 0);
        setState(prev => ({
            ...prev,
            currentIndex: index,
            value: blocks[index]
        }));
        updateNavigationState(index);
    };

    const handleBlockComplete = (blockStatus: string, totalBlocks: number) => {
        if (blockStatus === AssignmentBlockStatus.COMPLETED || blockStatus === AssignmentBlockStatus.CHECK_PENDING) {
            playBlockCompleteSound();
        }
        if (!isSectionMode || currentIndex + 1 === blocks.length || totalBlocks > 1) {
            return;
        }
        if (blockStatus === AssignmentBlockStatus.COMPLETED || blockStatus === AssignmentBlockStatus.CHECK_PENDING) {
            setTimeout(() => {
                setState(prev => ({...prev, isAdvancing: true}));
                clearBubblesAndCheckMark();
            }, 1500); // clear bubbles prevent overlap with advancing indicator

            setTimeout(() => {
                setState(prev => ({...prev, isAdvancing: false}));
                handleNext()
            }, 2500); // Auto scroll to next section after 2 seconds
        }
    };

    // Handle editor lifecycle
    React.useEffect(() => {
        if (editor) {
            const handleBlockRenderEvent = async (e) => {
                renderedBlockIds.add(e.detail.lesson_block_id);
                // if isLimitToOneSection get size from editor based on lesson_block_id
                // else get the size of from filterd valid lessonBlocks
                let expectedBlockSize = collectExpectedIds(editor).size;
                const voiceOverEnabled = isAppSoundEnabled() && settings.current.voiceOverEnabled;
                let moduleOptions = state?.lessonBlocks?.map(block => {
                    if (!block.sound_attachment_file_id || !block.sound_sprites_json || !block.sound_message_keys) {
                        return {};
                    }
                    const soundURL = getFileDownloadURL(block.sound_attachment_file_id)
                    const sprite = JSON.parse(block.sound_sprites_json);
                    let howlerInstance = createHowlerInstance(soundURL, sprite)
                    return {
                        moduleId: block.id,
                        howler: howlerInstance,
                        messageKeys: JSON.parse(block.sound_message_keys),
                        playTitle: isLimitToOneSection
                    }
                })
                if (!voiceOverEnabled) {
                    moduleOptions = null;
                }
                // Only Load chessboard if all the blocks are rendered and ready to load
                if (renderedBlockIds.size === expectedBlockSize) {
                    try {
                        if (props.assignmentId) {
                            const assignmentBlocks = assignmentBlocksRef?.current;
                            const assignment = assignmentRef?.current;
                            setState(prev => ({...prev, assignmentBlocks}));
                            if (!assignmentBlocks || assignmentBlocks.length === 0) return;
                            const isAssessment = assignment.is_assessment;
                            const updateCallback = async (id, trackDetails) => {
                                handleBlockComplete(trackDetails.status, expectedBlockSize); // Auto scroll to next section if block is completed
                                const onProgressUpdate = async (updateAssignment) => {
                                        await props.processUpdate?.(updateAssignment);
                                }
                                await updateAssignment(
                                    id, props.assignmentId, trackDetails, realtimeComms, onProgressUpdate, assignmentBlocks, assignment
                                );
                            }
                            const retrieveCallback = async (id, block) => {
                                    if (block && block.lesson_block_id == id) {
                                        if (isStudent()) {
                                            delete block?.fen_position;
                                            delete block?.mcq;
                                            delete block?.retry_count;
                                        }
                                        block.isAnswerDisabled = (!assignment?.is_assessment && isStudent()) ? false : true; // Allow re-submit for students
                                        return block;
                                    }
                                    const assignmentBlock = assignmentBlocks.find(ab => ab.lesson_block_id === parseInt(id));
                                    if (isStudent() && !isAssessment) {
                                        delete assignmentBlock?.fen_position;
                                        delete assignmentBlock?.mcq;
                                    }

                                    if (!assignmentBlock) return;

                                    return {
                                        id,
                                        status: assignmentBlock.status,
                                        fen_position: assignmentBlock.fen_position,
                                        mcq: assignmentBlock.mcq,
                                        comment: !isStudent() && assignmentBlock?.comment || "",
                                        retry_count: !isStudent() ? assignmentBlock.retry_count : null,
                                        answer: assignmentBlock.answer,
                                        isAnswerDisabled: true,
                                    }
                                }
                            const realtimeOptions = {
                                topic: `assignment_blocks/${props.assignmentId}`,
                                tracker: realtimeComms
                            }
                            // For assignment After block is completed don't play the title.
                            moduleOptions = moduleOptions?.map(moduleOption => {
                                const block = assignmentBlocks.find(ab => ab.lesson_block_id === moduleOption.moduleId);
                                if (!block) return moduleOption;
                                if (block.status == AssignmentBlockStatus.COMPLETED) {
                                    return {
                                        ...moduleOption,
                                        playTitle: false
                                    }
                                }
                                return moduleOption
                            })
                            
                            loadChessBoards(updateCallback, retrieveCallback, realtimeOptions, moduleOptions, !isAssessment);
                        } else {
                            loadChessBoards((id, trackDetails) => handleBlockComplete(trackDetails?.status, expectedBlockSize), null, null, moduleOptions, true);
                        }
                        // Avoid re-rendering multiple times
                        renderedBlockIds.clear();
                    } catch (error) {
                        console.log("Error sending on handle block error", error)
                        remoteLog("Error sending on handleBlockRenderEvent: ", error);
                    }
                }
            };

            editor.on('destroy', () => {
                console.log('Editor is destroyed');
                clearChessBoards();
            });

            document.addEventListener('lessonblock:rendered', handleBlockRenderEvent);
            return () => {
                document.removeEventListener('lessonblock:rendered', handleBlockRenderEvent);
                editor.off('create');
                editor.off('destroy');
            };
        }
    }, [editor]);

    // Update editor content when the value changes
    React.useEffect(() => {
        if (editor && value !== undefined) {
            const { from, to } = editor.state.selection;
            editor.commands.setContent(value, false, { preserveWhitespace: true });
            editor.commands.setTextSelection({ from, to });
        }
    }, [editor, value]);

    React.useEffect(() => {
        console.log('On Mount');
        return () => {
            console.log('Cleaning up');
            removeGameSoundFromLocalStorage();
            clearBubblesAndCheckMark();
            clearAnimation();
        };
    }, []);

    const {blockIndexInContent} = getResumeBlockIndex();
    const isResumeButtonHidden = blockIndexInContent === currentIndex;

    if (loading) return <Loading />;

    return (
        <Typography
            className={className}
            variant="body2"
            component="div"
        >
            <Root
                className={clsx(
                    'ra-input',
                    `ra-input-chess`,
                    className,
                    ''
                )}
                sx={sx}
            >

                <ChessAiFieldContext.Provider value={{ lessonBlocks: state.lessonBlocks }}>
                    <RichTextInputContent
                        editor={editor}
                        helperText={helperText}
                        id={id}
                        toolbar={ false}
                    />
                </ChessAiFieldContext.Provider>
                { isSectionMode &&
                    <Box display="flex" alignItems="center" marginTop="-1.5rem" justifyContent="flex-end">
                        {isStudent() && !isResumeButtonHidden && !isAllBlocksCompleted && <Button
                            onClick={handleResume}
                            sx={{ mr: "0.5rem" }}
                            disabled={state.assignmentBlocks?.every(ab => ab.status == AssignmentBlockStatus.NOT_STARTED)}
                            startIcon={<Replay/>}
                        >
                            Resume
                        </Button>}
                        <Button
                            onClick={handlePrev}
                            disabled={currentIndex === 0 || isAdvancing}
                            sx={{ mr: "0.5rem" }}
                            startIcon={<ArrowLeft/>}
                        >
                            Previous
                        </Button>

                        <Typography variant="caption">
                            ({currentIndex + 1} / {blocks.length})
                        </Typography>

                        <Button
                            onClick={handleNext}
                            disabled={currentIndex === blocks.length - 1 || isAdvancing}
                            sx={{ ml: "0.5rem" }}
                            endIcon={<ArrowRight/>}
                        >
                            Next
                        </Button>
                    </Box>
                }
                {!isSectionMode && props?.returnButton && props.returnButton}
                {/*Advancing Loading Indicator*/}
                {isAdvancing && (
                    <Box sx={{
                        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        backgroundColor: (theme) => theme.palette.background.paper, gap: "0.5rem",
                        borderRadius: "1rem", boxShadow: "1.5rem", p: "1rem", display: 'flex', alignItems: 'center',
                    }}>
                        <CircularProgress size={"1rem"}/>
                        <Typography variant="body2">Advancing...</Typography>
                    </Box>
                )}
            </Root>
        </Typography>
    );
};
ChessAIFieldImpl.displayName = 'ChessAIFieldImpl';

export const ChessAIField = genericMemo(ChessAIFieldImpl);

export interface RichTextFieldProps<
    RecordType extends Record<string, any> = Record<string, any>,
    > extends FieldProps<RecordType>,
    Omit<TypographyProps, 'textAlign'> {
}
