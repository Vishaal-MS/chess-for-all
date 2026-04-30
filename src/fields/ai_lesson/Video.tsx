import { Node } from '@tiptap/core';

const Video = Node.create({
    name: 'video',
    group: 'block',
    content: 'inline*',
    defining: true,
    draggable: true,

    parseHTML() {
        return [{ tag: 'video' }];
    },

  /*  renderHTML({ node }) {
        return ['video', { src: node.attrs.src, controls: true,
            style: `max-width: 100%; width: ${node.attrs.width || '100%'};`}];
    },*/

    renderHTML({ node }) {
        // Video wrapped in a resizable container
        return [
            'div',
            {
                class: 'video-container',
                style: `max-width: 100%; width: ${node.attrs.width || '100%'}; height: ${node.attrs.height || 'auto'};`,
            },
            [
                'video',
                {
                    src: node.attrs.src,
                    controls: true,
                    style: `max-width: 100%; width: 100%; height: 100%;`,
                },
            ],
        ];
    },

    addAttributes() {
        return {
            src: {
                default: null,
            },
            width: {
                default: '100%',
            },
            height: {
                default: 'auto',
            },
        };
    },

    addNodeView() {
        return ({ node, editor }) => {
            const videoWrapper = document.createElement('div');
            videoWrapper.classList.add('video-container');
            videoWrapper.style.width = node.attrs.width || '100%';
            videoWrapper.style.height = node.attrs.height || 'auto';

            const videoElement = document.createElement('video');
            videoElement.src = node.attrs.src;
            videoElement.controls = true;
            videoElement.style.width = '100%';
            videoElement.style.height = '100%';

            // Append video element inside wrapper
            videoWrapper.appendChild(videoElement);

            // Add resize handles (e.g., bottom-right corner)
            const resizeHandle = document.createElement('div');
            resizeHandle.classList.add('resize-handle');
            videoWrapper.appendChild(resizeHandle);

            // Enable resizing logic (using mouse events)
            let isResizing = false;

            resizeHandle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                isResizing = true;

                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = videoWrapper.offsetWidth;
                const startHeight = videoWrapper.offsetHeight;

                const onMouseMove = (moveEvent) => {
                    if (!isResizing) return;

                    const width = startWidth + moveEvent.clientX - startX;
                    const height = startHeight + moveEvent.clientY - startY;

                    // Update video wrapper size
                    videoWrapper.style.width = `${width}px`;
                    videoWrapper.style.height = `${height}px`;

                    videoElement.style.width = `${width}px`;
                    videoElement.style.height = `${height}px`;


                    // Optionally update the node's attributes (this can be added if you want to persist the size change)
                    editor.commands.updateAttributes(node, {
                        width: `${width}px`,
                        height: `${height}px`,
                    });
                };

                const onMouseUp = () => {
                    isResizing = false;
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                };

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });

            return {
                dom: videoWrapper,
            };
        };
    },
});
export default Video;