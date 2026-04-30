import { Node as TiptapNode, mergeAttributes } from '@tiptap/core';

const ALIGN_LEFT_ICON = "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/format_align_left/default/20px.svg";
const ALIGN_CENTER_ICON = "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/format_align_center/default/20px.svg";
const ALIGN_RIGHT_ICON = "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/format_align_right/default/20px.svg";
const DELETE_ICON = "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/close/default/20px.svg";

export const SwanImage = TiptapNode.create({
  name: 'swan-image',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      image_id: { default: null },
      width: { default: '560px' },
      align: { default: 'center' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-swan-image]',
        getAttrs: dom => {
          const img = dom.querySelector('img');
          return {
            image_id: img?.getAttribute('data-image-id'),
            width: dom.style.width,
            align: dom.getAttribute('data-align'),
          };
        },
      },
      {
        tag: 'swan-image',
        getAttrs: dom => ({
          image_id: dom.getAttribute('image_id'),
        }),
      },
    ];
  },

  renderHTML({ node }) {
    const wrapperAttrs = mergeAttributes({
      'data-swan-image': true,
      'data-align': node.attrs.align,
      style: `width: ${node.attrs.width}; margin: ${
        node.attrs.align === 'left' ? '0 auto 0 0' :
        node.attrs.align === 'right' ? '0 0 0 auto' :
        '0 auto'
      };`,
    });
    
    const imgAttrs = { 'data-image-id': node.attrs.image_id };
    
    return ['div', wrapperAttrs, ['img', imgAttrs]];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const { view } = editor;
      let { width, align } = node.attrs;

      const dom = document.createElement('div');
      dom.setAttribute('data-swan-image', 'true');
      Object.assign(dom.style, {
        position: 'relative',
        border: '1px dashed transparent',
      });

      const img = document.createElement('img');
      Object.assign(img.style, {
        width: '100%',
        height: 'auto',
        display: 'block',
        cursor: 'pointer',
      });
      
      try {
        img.src =
          window.swanAppFunctions.dataProvider.getDownloadURL() + "inline/" + node.attrs.image_id +
          "?app=" + window.app_name + "&env=" + window.app_env;
      } catch (error) {
          dom.textContent = `Error: Could not load image data for ID ${node.attrs.image_id}.`;
          Object.assign(dom.style, {
            backgroundColor: '#fee',
            border: '1px solid #f55',
            color: '#d00',
            padding: '1rem',
            textAlign: 'center'
          });
          return { dom };
      }
      
      dom.appendChild(img);
      
      const updateStyles = () => {
        dom.style.width = width;
        dom.style.margin = align === 'left' ? '0 auto 0 0' :
                             align === 'right' ? '0 0 0 auto' :
                             '0 auto';
        dom.setAttribute('data-align', align);
      };

      updateStyles();

      const createResizeDots = () => {
        const isMobile = window.innerWidth < 768;
        const dotSize = isMobile ? 16 : 9;
        const dotPosition = isMobile ? -8 : -4;
        const positions = [
          { top: `${dotPosition}px`, left: `${dotPosition}px`, cursor: 'nwse-resize' },
          { top: `${dotPosition}px`, right: `${dotPosition}px`, cursor: 'nesw-resize' },
          { bottom: `${dotPosition}px`, left: `${dotPosition}px`, cursor: 'nesw-resize' },
          { bottom: `${dotPosition}px`, right: `${dotPosition}px`, cursor: 'nwse-resize' },
        ];

        positions.forEach((pos, i) => {
          const dot = document.createElement('div');
          dot.className = 'control-element';
          Object.assign(dot.style, {
              position: 'absolute',
              width: `${dotSize}px`,
              height: `${dotSize}px`,
              border: '1.5px solid #6C6C6C',
              borderRadius: '50%',
              background: '#fff',
              boxSizing: 'border-box',
              zIndex: '100',
              ...pos
          });

          dot.addEventListener('mousedown', e => {
            e.preventDefault();
            const startX = e.clientX;
            const startWidth = dom.offsetWidth;

            const onMouseMove = (moveEvent) => {
              const deltaX = moveEvent.clientX - startX;
              width = `${Math.max(50, startWidth + (i % 2 === 0 ? -deltaX : deltaX))}px`;
              dom.style.width = width;
            };
            const onMouseUp = () => {
              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
              view.dispatch(
                view.state.tr.setNodeMarkup(getPos(), null, { 
                  image_id: node.attrs.image_id, width, align 
                })
              );
            };
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          });
          dom.appendChild(dot);
        });
      };

      const createAlignmentToolbar = () => {
        const toolbar = document.createElement('div');
        toolbar.className = 'control-element';
        Object.assign(toolbar.style, {
          position: 'absolute',
          top: '-38px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '4px',
          border: '2px solid #6C6C6C',
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          zIndex: '101'
        });
        
        const icons = [ALIGN_LEFT_ICON, ALIGN_CENTER_ICON, ALIGN_RIGHT_ICON];
        const aligns = ['left', 'center', 'right'];

        icons.forEach((icon, i) => {
          const button = document.createElement('img');
          button.src = icon;
          button.style.width = '24px';
          button.style.cursor = 'pointer';
          button.style.margin = i === 1 ? '0 10px' : '0';
          button.addEventListener('mousedown', e => {
            e.preventDefault();
            align = aligns[i];
            updateStyles();
            view.dispatch(
              view.state.tr.setNodeMarkup(getPos(), null, { 
                image_id: node.attrs.image_id, width, align 
              })
            );
          });
          toolbar.appendChild(button);
        });
        dom.appendChild(toolbar);
      };

      const setSelected = (selected) => {
        dom.style.borderColor = selected ? '#6C6C6C' : 'transparent';
        dom.querySelectorAll('.control-element').forEach(el => el.remove());

        if (selected) {
          createResizeDots();
          createAlignmentToolbar();
        }
      };

      if (editor.isEditable) {
        const createDeleteButton = () => {
            const button = document.createElement('div');
            button.className = 'control-element delete-button';
            Object.assign(button.style, {
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '24px',
                height: '24px',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: '10'
            });
            button.innerHTML = `<img src="${DELETE_ICON}" style="filter: invert(1); width: 16px; height: 16px;">`;
            button.addEventListener('mousedown', (e) => {
              e.preventDefault();
              const pos = getPos();
              view.dispatch(view.state.tr.delete(pos, pos + node.nodeSize));
            });
            return button;
        };

        dom.addEventListener('mouseenter', () => {
            if (!dom.querySelector('.delete-button')) {
                dom.appendChild(createDeleteButton());
            }
        });
        dom.addEventListener('mouseleave', (e) => {
            if (e.relatedTarget && !dom.contains(e.relatedTarget as Node)) {
                dom.querySelector('.delete-button')?.remove();
            }
        });
        
        setSelected(editor.isActive('swan-image'));
      }

      return {
        dom,
        update: updatedNode => {
          if (updatedNode.type.name !== 'swan-image') return false;
          width = updatedNode.attrs.width;
          align = updatedNode.attrs.align;
          updateStyles();
          return true;
        },
        selectNode: () => {
          if (editor.isEditable) setSelected(true);
        },
        deselectNode: () => {
          if (editor.isEditable) setSelected(false);
        }
      };
    };
  },
});