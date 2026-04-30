import { ElementType, useEffect } from "react";
import Typography, { TypographyProps } from "@mui/material/Typography";
import { useRecordContext } from "ra-core";

import { FieldProps } from "react-admin";
import { genericMemo } from "../../utils";
import {
  clearAnimation,
  clearBubblesAndCheckMark,
  clearChessBoards,
  enableRewindBackAndNextButtons,
  initAdditionalVisuals
} from "./ai_lesson_utils";
import { CBDiagram } from "./CBDiagram.tsx";
import { createHowlerInstance } from "../../helpers/sounds.ts";

const LessonBlockFieldImpl = <
    RecordType extends Record<string, any> = Record<string, any>,
>(
    props: TextFieldProps<RecordType>
) => {
    const { className, emptyText, ...rest } = props;
   
    const record = useRecordContext(props);

    useEffect(() => {
      //Sort of hack. But this is equal to fresh page load
      //logic by cbreplay.js
      //by default cbreplay only connects to these
      //servers if any embeddings are there
      if (!window.glApp.playerLobby) {
        window.glApp.playerLobby = new ServerPlayerLobby;
        window.glApp.aTBLobby = new ServerTeraBrainLobby;
        window.glApp.onlineLobby = new OnlineLobby;
      }
       
      var elements = document.getElementsByClassName("diagarea");
      while(elements.length > 0){
          elements[0].parentNode.removeChild(elements[0]);
      }

      window.glApp.panelMgr.init();
      window.glApp.panelMgr.createPanels();

      let soundURL = record.sound_attachment_file_id?.[0]?.src
      let sprite = JSON.parse(record.sound_sprites_json || "{}");
      const howlerInstance = createHowlerInstance(soundURL, sprite);
      initAdditionalVisuals([{ 
        moduleId: record.id,
        howler: howlerInstance,
        messageKeys: JSON.parse(record.sound_message_keys || "{}"),
        playTitle: true
      }]);

      window.glApp.panelMgr.enableShortcuts = false;

      //The Restart, Take Back and Make Move buttons are hidden by CBReplay.js
      //Enable them manually once the board loads after  a timeout

      setTimeout(() => {
        enableRewindBackAndNextButtons();
      }, 3000); // 2000 milliseconds = 2 seconds

      return () => {
      //  if(window.location.href.endsWith("/lesson_blocks")) {
            clearChessBoards();
            clearBubblesAndCheckMark();
            clearAnimation();
            howlerInstance.stop();
        }
     // }
      
    }, []);



    return (
        <Typography
          component="span"
          variant="body2"
          className={className}
        >

          <CBDiagram maxSize={props.maxSize} record={record} />

        </Typography>
    );
};

// what? TypeScript loses the displayName if we don't set it explicitly
LessonBlockFieldImpl.displayName = 'LessonBlockFieldImpl';

export const LessonBlockField = genericMemo(LessonBlockFieldImpl);

export interface TextFieldProps<
    RecordType extends Record<string, any> = Record<string, any>,
> extends FieldProps<RecordType>,
        Omit<TypographyProps, 'textAlign'> {
    // TypographyProps do not expose the component props, see https://github.com/mui/material-ui/issues/19512
    component?: ElementType<any>;
}
