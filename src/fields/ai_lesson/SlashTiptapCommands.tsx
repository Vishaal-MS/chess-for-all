import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";

export const Commands = Extension.create({
  name: "slashCommand",

  defaultOptions: {
    suggestion: {
      char: "/",
      startOfLine: false,
      command: ({ editor, range, props }) => {
        editor.isCommandSuccess = true;
        props.command({ editor, range });
      },
    },
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        render: renderItems,
      }),
    ];
  },
});

const CommandsList = forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => setSelectedIndex(0), [props.items]);

  const selectItem = (index) => {
    const item = props.items[index];
    if (item) {
      props.popup?.[0]?.hide();
      props.command(item);
    }
  };

  const onKeyDown = ({ event }) => {
    if (event.key === "ArrowUp") {
      setSelectedIndex(
        (selectedIndex + props.items.length - 1) % props.items.length
      );
      return true;
    }
    if (event.key === "ArrowDown") {
      setSelectedIndex((selectedIndex + 1) % props.items.length);
      return true;
    }
    if (event.key === "Enter") {
      selectItem(selectedIndex);
      return true;
    }
    return false;
  };

  useImperativeHandle(ref, () => ({ onKeyDown }));

  const itemStyle = (isSelected) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    backgroundColor: isSelected ? '#e8e8e8' : 'transparent',
    transition: 'background-color 0.2s ease',
  });
  const iconContainerStyle = { marginRight: '12px', display: 'flex', alignItems: 'center', color: '#444' };
  const textContainerStyle = { display: 'flex', flexDirection: 'column' };
  const titleStyle = { fontSize: '1.1em', fontWeight: '600', color: '#111' };
  const descriptionStyle = { fontSize: '0.9em', color: '#666', marginTop: '2px' };

  return (
    <div className="items" style={{ position: 'relative', borderRadius: '8px', padding: '0.2rem', background: 'white', color: 'rgba(0, 0, 0, 0.87)', overflow: 'hidden', fontSize: '0.9rem', boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.05), 0px 10px 20px rgba(0, 0, 0, 0.1)' }}>
      {props.items.length ? (
        props.items.map((item, index) => (
          <div key={index} onClick={() => selectItem(index)} style={itemStyle(index === selectedIndex)} className="suggestion-item">
            <div style={iconContainerStyle}>{item.icon}</div>
            <div style={textContainerStyle}>
              <span style={titleStyle}>{item.title}</span>
              <span style={descriptionStyle}>{item.description}</span>
            </div>
          </div>
        ))
      ) : (
        <div style={{ padding: '8px 12px' }}>No results</div>
      )}
    </div>
  );
});

export const renderItems = () => {
  let component;
  let popup;
  let editorInstance = null;

  return {
    onStart: (props) => {
      editorInstance = props.editor;
      editorInstance.isCommandSuccess = false;

      component = new ReactRenderer(CommandsList, {
        props,
        editor: editorInstance,
      });

      if (!props.clientRect) {
        return;
      }

      popup = tippy("body", {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "bottom-start",
      });

      component.updateProps({ ...props, popup });
    },

    onUpdate(props) {
      component.updateProps({ ...props, popup });

      if (!props.clientRect) {
        return;
      }

      popup?.[0]?.setProps({
        getReferenceClientRect: props.clientRect,
      });
    },

    onKeyDown(props) {
      if (props.event.key === "Escape") {
        if (!editorInstance) return true;

        editorInstance.isCommandSuccess = true;
        popup?.[0]?.hide();
        editorInstance.chain().focus().deleteRange(props.range).run();
        
        return true;
      }
      return component.ref?.onKeyDown(props);
    },

    onExit: (props) => {
      if (editorInstance && !editorInstance.isCommandSuccess) {
        editorInstance.chain().focus().deleteRange(props.range).run();
      }

      popup?.[0]?.destroy();
      component.destroy();
    },
  };
};