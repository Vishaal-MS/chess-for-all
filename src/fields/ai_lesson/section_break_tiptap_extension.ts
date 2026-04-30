import {
  isNodeSelection, mergeAttributes, Node, nodeInputRule,
} from '@tiptap/core'
import { NodeSelection, TextSelection } from '@tiptap/pm/state'

export interface HorizontalRuleOptions {
  /**
   * The HTML attributes for a horizontal rule node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    horizontalRule: {
      /**
       * Add a horizontal rule
       * @example editor.commands.setHorizontalRule()
       */
      setHorizontalRule: () => ReturnType
    }
  }
}

/**
 * This extension allows you to insert horizontal rules.
 * @see https://www.tiptap.dev/api/nodes/horizontal-rule
 */
export const SectionBreak = Node.create<HorizontalRuleOptions>({
    name: 'sectionBreak',

    addOptions() {
        return {
            HTMLAttributes: {
            }
        }
    },

    group: 'block',

    parseHTML() {
        return [{ tag: 'section-break' }]
    },

    renderHTML() {
        return ['section-break']
    },

    addNodeView() {
        return () =>{
            const dom = document.createElement('section-break')
            Object.assign(dom.style, {
                borderTop: "0.175rem dashed orangeRed",
                margin: "1rem 0",
                width: "100%",
                display: "block"
            });

            return {
                dom,
                contentDOM: null,
                update: () => false,
            }
        }
    },

    addCommands() {
        return {
            setHorizontalRule:
                () => ({ chain, state }) => {
                    const { selection } = state
                    const { $from: $originFrom, $to: $originTo } = selection

                    const currentChain = chain()

                    if ($originFrom.parentOffset === 0) {
                        currentChain.insertContentAt(
                            {
                                from: Math.max($originFrom.pos - 1, 0),
                                to: $originTo.pos,
                            },
                            {
                                type: this.name,
                            },
                        )
                    } else if (isNodeSelection(selection)) {
                        currentChain.insertContentAt($originTo.pos, {
                            type: this.name,
                        })
                    } else {
                        currentChain.insertContent({ type: this.name })
                    }

                    return (
                        currentChain
                            // set cursor after horizontal rule
                            .command(({ tr, dispatch }) => {
                                if (dispatch) {
                                    const { $to } = tr.selection
                                    const posAfter = $to.end()

                                    if ($to.nodeAfter) {
                                        if ($to.nodeAfter.isTextblock) {
                                            tr.setSelection(TextSelection.create(tr.doc, $to.pos + 1))
                                        } else if ($to.nodeAfter.isBlock) {
                                            tr.setSelection(NodeSelection.create(tr.doc, $to.pos))
                                        } else {
                                            tr.setSelection(TextSelection.create(tr.doc, $to.pos))
                                        }
                                    } else {
                                        // add node after horizontal rule if it’s the end of the document
                                        const node = $to.parent.type.contentMatch.defaultType?.create()

                                        if (node) {
                                            tr.insert(posAfter, node)
                                            tr.setSelection(TextSelection.create(tr.doc, posAfter + 1))
                                        }
                                    }

                                    tr.scrollIntoView()
                                }

                                return true
                            })
                            .run()
                    )
                },
        }
    },

    addInputRules() {
        return [
            nodeInputRule({
                find: /^(?:\+\+\+\s)$/,
                type: this.type,
            }),
        ]
    },
})