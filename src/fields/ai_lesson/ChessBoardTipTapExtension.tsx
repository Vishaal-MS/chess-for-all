import { mergeAttributes, Node } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'

export const ChessBoardComponent = (props: any) => {

    console.log("ChessBoardComponent", props.node.attrs.pgn);
 
    return (
      <NodeViewWrapper className="chess-board">
        <label style={{ display: 'block', textAlign: 'center' }}>Chess Board</label>
        {props.node.attrs.type === "fen" && 
          <div className="cbdiagram" data-buttons="0" data-size="600" 
                data-fen={props.node.attrs.fen} 
                data-legend={props.node.attrs.title}>        
          </div>
        }
        {props.node.attrs.type === "pgn" && 
          <div>
            <label style={{ display: 'block', textAlign: 'center' }}>{props.node.attrs.title}</label>
            <div className="cbreplay">
                {props.node.attrs.pgn}
              </div>
          </div>
        }
      </NodeViewWrapper>
    )
  }

  /* 
{"pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.0-0 Be7 6.Re1 b5 7.Bb3 d6 8.c3 Na5 9.Nc2 c5 10.d4 Qc7 11.Nbd2 Nc4 12.Bxc4 bxc4 13.d5 Nd7 14.Qe2 Nb6 15.b4 cxb4 16.cxb4 a5 17.Nb3 axb4 18.Na5 Na4 19.Nb5 Qb6 20.Qe3 Qd8 21.Nb7 Qxh4 22.g3 Qh5 23.Nd2 f5 24.exf5 e4 25.Nc4 Qf7 26.Ne5 Nc3 27.Nxf7 Kxf7 28.f3 exf3 29.Qxf3+ Ke7 30.Re4+ Kd7 31.Qf5+ Kc7 32.Qc5+ Kb8 33.Na5 Ka7 34.Nc6+ Kb

  */
export const ChessBoard = Node.create({
    name: 'chessBoard',
  
    group: 'block',
  
    atom: true,
  
    addAttributes() {
      return {
        type: {
          default: "fen",
        },
        fen: {
          default: "",
        },
        pgn: {
          default: "",
        },
        title: {
          default: "",
        },
      }
    },
  
    parseHTML() {
      return [
        {
          tag: 'chess-board',
        },
      ]
    },
  
    renderHTML({ HTMLAttributes }) {
      return ['chess-board', mergeAttributes(HTMLAttributes)]
    },
  
    addNodeView() {
      return ReactNodeViewRenderer(ChessBoardComponent)
    },
  })