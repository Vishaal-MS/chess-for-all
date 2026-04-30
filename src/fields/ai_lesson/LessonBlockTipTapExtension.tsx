import { mergeAttributes, Node, NodeViewRendererProps } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { Loading, useGetOne } from 'react-admin';
import { CBDiagram } from "./CBDiagram.tsx";
import { useEffect, useState } from 'react';
import { useAiField } from './ChessAIField.tsx';

const DELETE_ICON = "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/close/default/20px.svg";

export const LessonBlockComponent = (props: NodeViewRendererProps) => {
    const { deleteNode, node, view } = props;
    const { lesson_block_id } = node.attrs;

    const [state, setState] = useState({
        record: null,
        isLoading: true,
    })
    const { lessonBlocks } = useAiField();
    const { data: blockRecord, isLoading: isblockLoading } = useGetOne(
        "lesson_blocks", 
        { id: lesson_block_id },    
        { enabled: !lessonBlocks } // Only fetch if there is no lessonblocks 
    );
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        if (!lesson_block_id) return;

        // If there is a lessonblocks provided from aiField context will directly get it from it
        if (lessonBlocks) {
            const lessonBlock = lessonBlocks.find((block) => block.id === lesson_block_id);
            if (lessonBlock) {
                setState(prev => {
                    // Avoid re-setting same state
                    if (prev.record?.id === lessonBlock.id) return prev;
                    return {
                        record: lessonBlock,
                        isLoading: false,
                    }
                });
            }
        } else {
            // For input we handle fetch individually and update
            if (!isblockLoading && blockRecord) {
                setState(prev => {
                    if (prev.record?.id === blockRecord.id) return prev;
                    return {
                        record: blockRecord,
                        isLoading: false,
                    }
                });
            }
        }
    }, [lesson_block_id, lessonBlocks, isblockLoading, blockRecord]);

    useEffect(() => {
        // Becuase rendering in the same useeffect causing inconsitency in ui update
        // we seperate the event dispatch logic and put it in a seperate effect only when state.record update.
        if (!state.isLoading && state.record) {
            // Only Dispatch even if this component is fully rendered.
            requestAnimationFrame(() => {
                document.dispatchEvent(new CustomEvent('lessonblock:rendered', {
                    detail: { lesson_block_id }
                }));
            });
        }
    }, [state.record])

    const { record, isLoading: blockLoading } = state;

    if (blockLoading || isblockLoading) {
        return <Loading />;
    }

    if (!record) {
        return null;
    }

    return (
        <NodeViewWrapper
            // Merged the classes here
            className="lesson-block"
            style={{ position: "relative" }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <CBDiagram record={record} />

            {view.editable && isHovering && (
                <div
                    style={{
                        position: 'absolute',
                        top: '40px',
                        left: 'calc(50% + 13rem)',
                        width: '24px',
                        height: '24px',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteNode();
                    }}
                >
                    <img src={DELETE_ICON} alt="Delete" style={{ filter: 'invert(1)', width: '16px', height: '16px' }} />
                </div>
            )}
        </NodeViewWrapper>
    );
};

// The LessonBlock Node definition remains the same
export const LessonBlock = Node.create({
    name: 'lessonBlock',
    group: 'block',
    atom: true,
    selectable: true,
    draggable: true,
    addAttributes() {
        return {
            lesson_block_id: {
                default: null,
            },
        };
    },
    parseHTML() {
        return [
            {
                tag: 'lesson-block[lesson_block_id]',
                getAttrs: (dom: HTMLElement) => ({
                    lesson_block_id: dom.getAttribute('lesson_block_id'),
                }),
            },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return ['lesson-block', mergeAttributes(HTMLAttributes)];
    },
    addNodeView() {
        return ReactNodeViewRenderer(LessonBlockComponent);
    },
});