import React,{useEffect, useState} from 'react';
export const CBDiagram = (props: { record: RecordType | undefined, maxSize?: string }) => {
  const maxSize = props?.maxSize;
  const record = props.record;
  const[isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    //This is to make cbreplay rerender the new pgn
    if (window.glApp && window.glApp.panelMgr.pluginDivPgn) {
       window.glApp.panelMgr.pluginDivPgn[0] = record?.pgn;
    }   
     const timer = setTimeout(() => {
         setIsLoaded(true);
      }, 1000);
      return () => clearTimeout(timer);
  },[]);
  const playProps = () => {
    const result = {} as any;
    if (record.is_game_engine_active) {
      result["data-play"] = "1000";
    }
    if (record.is_hide_board || record.block_type === "pqa") {
      result["data-noboard"] = "true";
    }
    if (record.additional_visuals || record.animated_tutorial) {
      result["data-anim"] = "";
      record.additional_visuals && (result["data-anim"] = record.additional_visuals);
      record.animated_tutorial && (result["data-anim"] += record.animated_tutorial);
    }
    if (record.starting_board) {
      result["data-fen"] = record.starting_board;
    }
    if (record.help) {
      result["data-help"] = record.help;
    }
    if (record.solution) {
      result["data-solution"] = record.solution;
    }
    if (record.goals) {
      result["data-goals"] = record.goals;
    }
    if (record.game_engine_guidance) {
      result["data-pst"] = record.game_engine_guidance;
    }
    if (record.block_type === "mcq") {
      //Construct the data-choices attribute
      //from the choices fields - choice_title, choice_hint, choice_1_text,choice_1_feedback,choice_1_correct,
      //choice_2_text,choice_2_feedback,choice_2_correct,choice_3_text,choice_3_feedback,choice_3_correct
      //data-choice format is like this "data-choice": "{\"attrs\":[],\"entries\":[{\"attrs\":[],\"text\":\"Yes. The king and both rooks are on their starting squares.\",\"feedback\":\"Right, but that is not enough here.\",\"correct\":false},{\"attrs\":[],\"text\":\"No, the rook on d8 is threatening d1.\",\"feedback\":\"But the Rd8 would not prevent kingside castling.\",\"correct\":false},{\"attrs\":[],\"text\":\"No, the king is in check.\",\"feedback\":\"Exactly. The bishop on b4 is giving check.\",\"correct\":true}],\"title\":\"Can White castle?\",\"hint\":null}",
      //So we need to create a JSON object with the keys - attrs, entries, title, hint
      //entries is an array of objects with keys - attrs, text, feedback, correct
      const choices = {
        attrs: [],
        entries: [],
        title: record.choice_title,
        hint: record.choice_hint
      };
      for (let i = 1; i <= 3; i++) {
        //Check if choice is present before adding to entries
        if (!record[`choice_${i}_text`]) {
          continue;
        }
        const choice = {
          attrs: [],
          text: record[`choice_${i}_text`],
          feedback: record[`choice_${i}_feedback`],
          correct: record[`is_choice_${i}_correct`]
        };
        choices.entries.push(choice);
      }
      result["data-choice"] = JSON.stringify(choices);
    }
    //Check the Block Type and add the data-showRewind attribute
    //TODO - Need to revisit this logic.
    if (record.block_type === "mcq" || (record.animated_tutorial && record.animated_tutorial.startsWith("beginloop")) || record.goals) {
      result["data-showrewind"] = "true";
    }
    if (record.goals && record.goals.includes("assembly")) {
      result["data-setuppos"] = "true";
      // Remove additional visuals and rewind buttons
      delete result["data-showrewind"];
    }

    if (record.block_type === "pqa") {
      if (record.question) {
        result["data-showquestion"] = "true";
        result["data-question"] = record.question;
      }
      if (record.number_of_lines && record.number_of_words) {
        result["data-numlines"] = record.number_of_lines;
        result["data-numwords"] = record.number_of_words;
      }
    }

    return result;
  };

const gameProps = () => { 
  if (record.block_type === 'nota') {
    let result = {} as any;
    if (record.bot_difficulty) {
      result["data-play"] = record.bot_difficulty;
    }
    if (record.hideButtons == true) {
      result["data-buttons"] = "0";
    }
    return result;
  }
};

  return (Object.keys(record).length === 0 ?
    (<div style={{opacity: 0.3}} className="cbdiagram"
        data-size={maxSize ? maxSize : "70%/max=400"}
        data-fen="8/8/8/8/8/8/8/8 w - - 0 1"
        data-buttons="0"
    ></div>)
   : record.block_type === 'pgn' ?
   (<div className="cbreplay"  style={{visibility: isLoaded ? "visible" : "hidden"}}>
        {record.pgn}
   </div>) :  record.block_type === 'nota' ?
   (<div className="cbdiagram"
              data-size={maxSize ? maxSize : "100%/max=550"}
              data-title={record.board_title}
              data-fen={record.starting_board}
              data-buttons="replayonly"
              data-showrewind="true"
              data-bigcoords="true"
              data-visuals="opposition;check;mate"
              data-moves={record.moves}
              {...gameProps()}
   ></div>) :
   (<div className="cbdiagram"
              data-size={maxSize ? maxSize : "100%/max=550"}
              data-title={record.board_title}
              data-legend={record.board_subtitle}
              data-buttons="replayonly"
              data-bigcoords="true"
              data-visuals="opposition;check;mate"
              data-posid={record.id} //TODO: This is for results and should be dynamic
              {...playProps()}
  ></div>))
};
