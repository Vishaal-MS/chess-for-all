import React, { useState, useRef, memo } from "react";
import { Node as TiptapNode } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import ReactPlayer from 'react-player/lazy';


const ALIGN_LEFT = "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/format_align_left/default/20px.svg";
const ALIGN_CENTER = "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/format_align_center/default/20px.svg";
const ALIGN_RIGHT = "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/format_align_right/default/20px.svg";
const DELETE_ICON = "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/close/default/20px.svg";


const Player = memo(({ url, containerRef }) => {
  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', paddingTop: '56.25%', cursor: 'pointer' }}
    >
      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        controls={true}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
    </div>
  );
});

export const VideoComponent = (props) => {
  const { node, updateAttributes, view, selected, deleteNode } = props;
  const { video_id, src, width, align } = node.attrs;

  const [isHovering, setIsHovering] = useState(false);
  const playerContainerRef = useRef(null);
  const wrapperRef = useRef(null);

  const dragInfo = useRef({ 
    resizing: false, startX: 0, startW: 0, corner: 0, finalWidth: 0 
  });

  const onDotMouseDown = (corner) => (e) => {
    e.preventDefault();
    if (!selected || !wrapperRef.current) return;
    const startW = wrapperRef.current.offsetWidth;
    dragInfo.current = { 
        resizing: true, startX: e.clientX, startW: startW, corner, finalWidth: startW 
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e) => {
    if (!dragInfo.current.resizing || !wrapperRef.current) return;
    const { startX, corner, startW } = dragInfo.current;
    const deltaX = e.clientX - startX;
    let newWidth = (corner === 0 || corner === 2) 
      ? Math.max(100, startW - deltaX) 
      : Math.max(100, startW + deltaX);
    wrapperRef.current.style.width = `${newWidth}px`;
    dragInfo.current.finalWidth = newWidth;
  };

  const onMouseUp = () => {
    if (!dragInfo.current.resizing) return;
    const finalWidth = dragInfo.current.finalWidth;
    setTimeout(() => updateAttributes({ width: `${finalWidth}px` }), 0);
    dragInfo.current.resizing = false;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };
  
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const dotSize = isMobile ? 16 : 9;
  const dotPosition = isMobile ? -8 : -4;

  const dots = [
    { style: { top: dotPosition, left: dotPosition, cursor: "nwse-resize" } },
    { style: { top: dotPosition, right: dotPosition, cursor: "nesw-resize" } },
    { style: { bottom: dotPosition, left: dotPosition, cursor: "nesw-resize" } },
    { style: { bottom: dotPosition, right: dotPosition, cursor: "nwse-resize" } },
  ];


  let finalVideoSrc = null;
  if (src) {
    finalVideoSrc = src;
  } else if (video_id) {
    finalVideoSrc = window.swanAppFunctions.dataProvider.getDownloadURL() + "inline/" + video_id + 
    "?app=" + window.app_name + "&env=" + window.app_env;
  }

  const getMargin = () => {
    if (align === 'left') return '0 auto 0 0';
    if (align === 'right') return '0 0 0 auto';
    return '0 auto';
  };
  
  const handleDelete = () => {
    setTimeout(() => deleteNode(), 0);
  }

  return (
    <NodeViewWrapper
      ref={wrapperRef}
      className="video-player-component"
      style={{
        width: width,
        margin: getMargin(),
        position: 'relative',
      }}
      contentEditable={false}
      suppressContentEditableWarning={true}
    >
      <div 
        style={{
          border: selected && view.editable ? "2px solid #6C6C6C" : "none",
          borderRadius: '8px',
          overflow: 'hidden',
          position: 'relative'
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Player url={finalVideoSrc} containerRef={playerContainerRef} />

        {view.editable && isHovering && (
           <div
            style={{
              position: 'absolute', top: '8px', right: '8px', width: '24px',
              height: '24px', backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '50%', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', zIndex: 10,
            }}
            onClick={handleDelete}
          >
            <img 
              src={DELETE_ICON} 
              alt="Delete" 
              style={{ filter: 'invert(1)', width: '16px', height: '16px' }}
            />
          </div>
        )}
      </div>

      {selected && view.editable && (
        <>
          {dots.map((dot, i) => (
            <div 
              key={i} 
              style={{
                position: "absolute", width: dotSize, height: dotSize,
                border: "1.5px solid #6C6C6C", borderRadius: "50%",
                background: "#fff", boxSizing: "border-box", zIndex: 100,
                ...dot.style,
              }}
              onMouseDown={onDotMouseDown(i)}
            />
          ))}

          <div style={{
            position: "absolute", top: "-38px", left: "50%",
            transform: "translateX(-50%)", height: 28,
            background: "rgba(255,255,255,0.9)", borderRadius: 4,
            border: "2px solid #6C6C6C", display: "flex",
            alignItems: "center", padding: "0 10px", zIndex: 101,
          }}>
            <img
              src={ALIGN_LEFT} alt="Align left" style={{ width: 24, cursor: "pointer" }}
              onClick={() => setTimeout(() => updateAttributes({ align: 'left' }), 0)}
            />
            <img
              src={ALIGN_CENTER} alt="Align center" 
              style={{ width: 24, cursor: "pointer", margin: '0 10px' }}
              onClick={() => setTimeout(() => updateAttributes({ align: 'center' }), 0)}
            />
            <img
              src={ALIGN_RIGHT} alt="Align right" style={{ width: 24, cursor: "pointer" }}
              onClick={() => setTimeout(() => updateAttributes({ align: 'right' }), 0)}
            />
          </div>
        </>
      )}
    </NodeViewWrapper>
  );
};


export const SwanVideo = TiptapNode.create({
  name: 'swanVideo',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      video_id: {
        default: null,
      },
      width: {
        default: '560px',
      },
      align: {
        default: 'center',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'swan-video',
        getAttrs: dom => {
          const element = dom;
          return {
            src: element.getAttribute('data-src'),
            video_id: element.getAttribute('data-video-id'),
            width: element.getAttribute('data-width') || '560px',
            align: element.getAttribute('data-align') || 'center',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['swan-video', {
      'data-src': HTMLAttributes.src,
      'data-video-id': HTMLAttributes.video_id,
      'data-width': HTMLAttributes.width,
      'data-align': HTMLAttributes.align,
    }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoComponent);
  },
});