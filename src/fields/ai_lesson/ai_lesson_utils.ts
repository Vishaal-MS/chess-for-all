//Lets parametrise so that this can be used outside of assignments (do not refer to assignments in this file)
import {AssignmentBlockStatus} from "../../helpers/constants.ts";
import {handleEnableGameSound, playVoiceOverClip} from "../../helpers/sounds.ts";
import {isRegularSchoolFlavored, isStudent} from "../../backend/common_logics.ts";

class CustomResultPostBack {
    constructor(updateFn?: UpdateFnType) {
        this.updateFn = updateFn;
    }

    async postSolved(userId, posId, points, mcq, answer) {
        console.log("postSolved", userId, posId, points, mcq, answer);
        const lesson_block_id = posId.split('-')[0];
        if(this.updateFn) {
	  // For PQA type assignment blocks status is Check Pending
          const status = answer ? AssignmentBlockStatus.CHECK_PENDING : AssignmentBlockStatus.COMPLETED;
          await this.updateFn(lesson_block_id, { status: status, mcq, answer})
        }
    }
    // NOTE: This is not used currently
    postWrong(userId, posId) {
        console.log("postWrong", userId, posId);
        if (userId && posId) {
            let url = `${this.url}users/wrong?userId=${userId}&posId=${posId}`;
            $.post(url);
            console.log(url);
        }
    }

    // for Animation Tutorial played and completed
    postPlayed(userId, posId) {
        console.log("postPlayed", userId, posId);
        const lesson_block_id = posId.split('-')[0];
        if(this.updateFn) {
          this.updateFn(lesson_block_id, { status: AssignmentBlockStatus.COMPLETED })
        }
    }

    async postMove(posId, fenPosition, mcq, numPly, pgn, isMate, isStaleMate, result) {
        const lesson_block_id = posId;
        console.log("postMove", posId, fenPosition, pgn);
        if ( this.updateFn ) {
            const trackDetails = { fenPosition, mcq, numPly, pgn, isMate, isStaleMate, result};
            await this.updateFn(lesson_block_id, trackDetails)
        }
    }

    async postRestart(posId) {
        console.log("postRestart", posId);
        const lesson_block_id = posId;
        if ( this.updateFn ) {
            const trackDetails = { action: "restart" };
            await this.updateFn(lesson_block_id, trackDetails)
        }
    }

    // NOTE: This is not used currently
    updateUserPoints(points) {
        if (!isNaN(points)) {
            $("#UserTotalPoints").text(points.toString());
        }
    }
}

type TrackDetailType = {
    status: string;
    fenPosition?: string;
    mcq?: number
}
type UpdateFnType = (id: number, trackDetail: TrackDetailType) => Promise<void>;
type RetrieveFnType = (id: number) => Promise<{ id, trackDetails: trackDetails }>;
type ModuleOptionType = {
    moduleId: number;
    howler: any;
    messageKeys: Record<string, string>;
    playTitle?: boolean;
}

export const loadChessBoards = (updateFn?: UpdateFnType, retrieveFn?: RetrieveFnType, realtimeOptions?: any, blockOptions?: ModuleOptionType[], allowRetry?: boolean) => {
    if (!window.glApp || !window.glApp.panelMgr) {
      return
    }
    console.log("loadChessBoards");
    //Sort of hack. But this is equal to fresh page load
    //logic by cbreplay.js
    //by default cbreplay only connects to these
    //servers if any embeddings are there

    if (!window.glApp.playerLobby) {
        window.glApp.playerLobby = new ServerPlayerLobby;
        window.glApp.aTBLobby = new ServerTeraBrainLobby;
        window.glApp.onlineLobby = new OnlineLobby;
        window.playchessUser = 'Guest';
    }
    if (updateFn) {
        window.glApp.resultPostBack = new CustomResultPostBack(updateFn);
    } else {
        window.glApp.resultPostBack = new CustomResultPostBack(); // fallback with no updateFn
    }

    var elements = document.getElementsByClassName("diagarea");
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }

    // window.glApp.panelMgr.recreate();
    window.glApp.panelMgr.init();
    window.glApp.panelMgr.createPanels();
    // Bypassing the block options into modules for global usage eg: module.options.allowRetry
    window.glApp.panelMgr.modules = window.glApp.panelMgr.modules.map(module => {
      if (blockOptions) {
        module.options = blockOptions;
        module.allowRetry = allowRetry;
      }
      return module;
    })
    initAdditionalVisuals(blockOptions, allowRetry);

    // track updates
    if (updateFn) {
        trackProgress();
    }
    if (retrieveFn && realtimeOptions) {
        displayProgress(retrieveFn, realtimeOptions, allowRetry);
    } else if (retrieveFn) {
        displayProgress(retrieveFn, null, allowRetry)
    }

    window.glApp.panelMgr.enableShortcuts = false

    // This function used for Enable the game sound
    handleEnableGameSound();

  //The Restart, Take Back and Make Move buttons are hidden by CBReplay.js
  //Enable them manually once the board loads after  a timeout

  setTimeout(() => {
    enableRewindBackAndNextButtons(allowRetry);

  }, 3000); // 2000 milliseconds = 2 seconds

}

export const initAdditionalVisuals = (blockOptions?: any, allowRetry?: boolean) => {
  if (allowRetry == false) {
    const helpButtons = document.querySelectorAll('[id^="d-btnHint-"]');
    helpButtons.forEach(button => {
      button.style.display = 'none';
    });
  }
  let panelMgr = window.glApp.panelMgr;
  // Disable Piece Move for Animated Tutorial and Track Restart count
  // fnAnimRewind will call on both rewind and restart of exercise block
  panelMgr.fnAnimRewind = async function(a) {
    this.modules[a].animationController &&
      (this.modules[a].getKernel().Vp.restart(),
      this.modules[a].animationController.rewind(!0));
    if (panelMgr.needsDiagramAnimButtons(a)) {
      this.modules[a].getKernel().boardWin.allowInput = false
    } else {
      // Exercise block track restart count
      await window.glApp.resultPostBack.postRestart(panelMgr.modules[a].posId);
    }
  }
  window.glApp.panelMgr.modules.forEach((module: any, index: number) => {
    let boardWin = module.getKernel().boardWin;
    let panelMgr = window.glApp.panelMgr;
    const miniPlayMode = module.getKernel().Vp;

    // Block Options added.
    const moduleOption = blockOptions?.find(block => block.moduleId == module.posId) as ModuleOptionType;

    const cbdiagramDiv = module.pluginDiv;
    const dataset = cbdiagramDiv.dataset;
    const hasQuestionBox = dataset.showquestion;

      if (hasQuestionBox) {
          createQuestionAndAnswer(module, index, cbdiagramDiv);
      }
    // Disable Piece Move for Animated Tutorial
    if (panelMgr.needsDiagramAnimButtons(index)) {
      boardWin.allowInput = false;
      panelMgr.fnAnimRewind = function(a) {
        this.modules[a].animationController &&
          (this.modules[a].getKernel().Vp.restart(),
          this.modules[a].animationController.rewind(!0),
          this.modules[a].getKernel().boardWin.allowInput = false);
      }
    }
    if (moduleOption?.howler && moduleOption?.playTitle) {
      playVoiceOverClip(moduleOption?.howler, "title");
    }
    // Custom addBubble function
    boardWin.addBubble = (text: any, square: number, width: number, emojiURL: string) => {
      boardWin.messageWin && (boardWin.messageWin.destroy(), delete boardWin.messageWin);
      const howler = moduleOption?.howler;
      // Play Voice over message
      if (moduleOption) {
        const { howler, messageKeys } = moduleOption
        let clipName = "";
        for (const clipText in messageKeys) {
            // Check for case sensitive message text to prevent duplicate.
            // Removed the nmoves before getting the message key. always consider {NMoves} moves
            let compareText = "";
            if (typeof text == "string") {
              compareText = text.replace(/\d+\s+?moves/, " moves").trim()
            } else {
              // For animated tutorial the text will be an array with 1 message
              compareText = text[0].replace(/\d+\s+?moves/, " moves").trim()
            }
            if (clipText.toLowerCase() == compareText.toLowerCase()) {
                clipName = messageKeys[clipText];
                break;
            }
        }
        playVoiceOverClip(howler, clipName);
      }
      boardWin.messageWin = new BoardBubble(text, square, width, emojiURL);
      boardWin.messageWin.setVisible(!0);
      boardWin.messageWin.onResize(boardWin);
      // On message destroy stop the voiceover.
      boardWin.messageWin.destroy = () => {
        boardWin.messageWin.background.destroy();
        howler?.stop();
      }
      // On Click of the bubble remove the remove the bubble
      boardWin.messageWin.background.elDOM.onclick = () => {
        boardWin.messageWin.setVisible(!1);
        howler?.stop();
      };
    }
    // handle hide board if noboard is true
    if (module.pluginDiv.dataset.noboard == "true") {
      module.boardArea.setVisible(false); // To hide the board
      const classesToHide = ["diagarea", "diagButtons", "diaNota", "diaEng"];
      for (const cls of classesToHide) {
        const elementsToHide = module.pluginDiv.querySelectorAll(`.${cls}`);
        elementsToHide.forEach(el => {
          if (cls === "diagarea") {
              (el as HTMLElement).style.height = "0rem"; // To remove board empty space
              el.style.overflow = "hidden";
          } else {
              (el as HTMLElement).style.display = "none"; // To hide the buttons
          }
        });
      }
    }
    if (module.pluginDiv.dataset.setuppos == "true") {
      setupPosition(module);
    }
    // To add timeout for goals and help we customized miniplaymode methods
    // showGoalMsg, launchClearhints and showDiagramHelp
    // This may be an hack later need to verify once.
    module.getKernel().Vp.showGoalMsg = (msg: string, delay: number, icon: any) => {
      msg = miniPlayMode.replaceVariables(msg);
      var d = msg.split("$") as any;
      let timeout = delay;
      // Get the timeout in d and put in timeout can be in any index
      const timeoutIndex = d.findIndex(x => /^\d+(\.\d+)?s$/.test(x));
      if (timeoutIndex !== -1) {
        timeout = parseFloat(d[timeoutIndex]) * 1000;
        d.splice(timeoutIndex, 1);
      }
      if (1 == d.length) {
          msg = d[0]
      } else if (1 < d.length) {
        msg = d[0];
        var e = d[1];
      }
      miniPlayMode.clearBoardMsgTimer.stop();
      d = -1;
      e &&
        ((d = e.match(/([wb][KQBRNP])/g)),
        null != d
          ? ((e = "w" == d[0][0] ? 0 : 1),
            (d = miniPlayMode.kernel
              .getCurPos()
              .getPiecePos(Piece.fromString(d[0][1]), e)))
          : (d = CBSquare.fromString(e)));
      miniPlayMode.boardWin.addBubble(msg, d, 320, icon);
      timeout && miniPlayMode.clearBoardMsgTimer.runOnce(timeout);
    };

    module.getKernel().Vp.launchClearHints = (timeout: number) => {
      miniPlayMode.clearHintsTimer && miniPlayMode.clearHintsTimer.stop();
      miniPlayMode.clearHintsTimer = new Timer(
        function () {
          miniPlayMode.kernel.boardWin.clearAll();
        }.bind(miniPlayMode)
      );
      if (timeout) {
        miniPlayMode.clearHintsTimer.runOnce(timeout);
      } else {
        miniPlayMode.clearHintsTimer.runOnce(4e3);
      }
    }
    module.getKernel().Vp.showDiagramHelp = (a) => {
      miniPlayMode.kernel.boardWin &&
        (0 < miniPlayMode.kernel.game.getMainLine().length || !a || miniPlayMode.hintCnt
          ? (miniPlayMode.kernel.boardWin.clearAll(), miniPlayMode.markHint())
          : a &&
            (miniPlayMode.hintEngine || miniPlayMode.initHintEngine(),
            (a = DiagramAnimationController.parseDiagramHelp(a)),
            (a.text = a.text.split("$")),
            miniPlayMode.boardWin && miniPlayMode.boardWin.addBubble(a.text[0], a.sq, 400, a.icon),
            a.attrs && miniPlayMode.boardWin && miniPlayMode.boardWin.addAttributes(a.attrs),
            miniPlayMode.hintCnt++),
        miniPlayMode.launchClearHints(a.text.length > 1 ? (parseFloat(a.text[1]) * 1e3) : 4e3));
    }
  })
}

const setupPosition = (module: any) => {
    if (!module) return;
    const kernel = module.getKernel();
    const animController = module.animationController;

    // Switch to setup position mode
    kernel.startPosInputMode();
    const posInput = kernel.posInput;

    // Handle animation controller + visuals
    if (animController) {
      animController.clearColors();
      animController.boardWin.destroyMessage();

      posInput.clearBaggageAttributes = () => {}; // Assembly block doesn’t support _game → empty function

      animController.boardWin = posInput; // Replace default board with posInput board
      animController.drawInvariants(); // Redraw visuals using posInput board
    }

    // hide unnecessary buttons;
    const posInputButtons = module.getKernel().posInput.buttons;
    posInputButtons.hideCancelDoneButtons();
    const buttonsToRemove = [
      "b00Check", "w00Check", "w000Check", "b000Check", "blackCheck", "epSel", "initBtn"
    ];
    buttonsToRemove.forEach(btn => {
      posInputButtons[btn].elDOM.style.display = "none"
    })
    const clearBtnEl = posInputButtons["clearBtn"].elDOM;
    clearBtnEl.style.color = "black";
    clearBtnEl.title = "Clear Board";
    posInputButtons["squareBtn"].elDOM.title = "Remove Piece"
    if (module?.allowRetry == false) {
      posInputButtons["squareBtn"].elDOM.style.display = "none";
      posInputButtons["clearBtn"].elDOM.style.display = "none";
    }
    let postMoveTimeoutId: any;
    module.getKernel().posInput.addOnBoardChangedListener(async () => {
      checkCustomGoals(module)
      clearTimeout(postMoveTimeoutId);
      postMoveTimeoutId = setTimeout(async () => {
        await window.glApp.resultPostBack.postMove(module.posId, posInput.createPosition().toNormalizedFEN());
      }, 300)
    })
}

const checkCustomGoals = (module: any) => {
  const miniPlayMode = module.getKernel().Vp;
  const animController = module.animationController;
  const goals = miniPlayMode.goals;
  var goal = null;
    if (goals)
      for (var b = 0; b < goals.length; b++) {
        goal = goals[b];
        var c = isCustomGoalMet(goal, module)
        if (c && animController) animController.boardWin.destroyMessage();
        goal = miniPlayMode.onGoalMetResult(goal, c);
        if (null != goal) break;
      }
    return goal;
}

const isCustomGoalMet = (goal: any, module: any) => {
  switch (goal.command) {
    default:
      return !1;
    case "assembly":
      return checkAssembly(goal, module);
  }
}

const checkAssembly = (goal: any, module: any) => {
  if (!goal.params) return;
  const goalParams = goal.params[0]; // e.g. "fen[8,8,8,8,8,8,8,7p]" or "piece[wk1,wp3]"
  const fenGoalParams = goalParams.match(/^fen\[(.+?)\]$/);
  const piecesGoalParams = goalParams.match(/^piece\[(.+?)\]$/);

  const currentFen = module.getKernel().posInput.createPosition().toNormalizedFEN();

  if (fenGoalParams) {
    const expectedFen = fenGoalParams[1].replaceAll(",", "/") + " w - -";
    return expectedFen === currentFen
  };

  if (piecesGoalParams) {
    const neededPieces = piecesGoalParams[1].split(","); // e.g. ["wk1","wp3"]
    const boardPart = currentFen.split(" ")[0]; // only piece placement section

    // Fill the pieceMap with the current pieces in the fen.
    const pieceMap: Record<string, number> = {};
    for (const char of boardPart.replace(/\d/g, "").replace(/\//g, "")) {
      const side = char === char.toUpperCase() ? "w" : "b";
      const type = char.toLowerCase();
      const key = side + type;
      pieceMap[key] = (pieceMap[key] || 0) + 1;
    }

    for (const req of neededPieces) {
      const match = req.match(/([wb])([kqrbnp])(\d+)/);
      if (!match) continue;
      const [, side, type, countStr] = match;
      const requiredCount = parseInt(countStr);
      const actualCount = pieceMap[side + type] || 0;
      // if Any one piece count not matched return goal not met false
      if (actualCount !== requiredCount) {
        return false;
      }
    }
    return true;
  }

  return false;
};


const trackProgress = () => {
    setupMoveListener()
    setupCheckEvent();
}

export const createQuestionAndAnswer = (module: any, index: number, cbdiagramDiv: any) => {
    const panelMgr = window.glApp.panelMgr;
    let blockPosId = module.posId;
    const dataset = cbdiagramDiv.dataset;
    // If it is a pgn module.posId will not present we need to take it from data-posid
    if (!blockPosId) {
        blockPosId = dataset.posid;
    }
    const {numlines, numwords} = dataset;
    const qaParentEl = panelMgr.createDiv("belowDiag");
    qaParentEl.id = `belowDiag${index}`;
    const footerWrapper = document.createElement('div');
    footerWrapper.className = 'qa-footer-wrapper';

    const questionEl = panelMgr.createEl("label", "label-question", index);
    questionEl.innerText = dataset.question;

    const answerEl = panelMgr.createEl("textarea", "textarea-answer", index);
    // Prevents the text from being pasted
    answerEl.addEventListener('paste', (event) => {
        event.preventDefault();
    });
    answerEl.placeholder = "Type your answer here..."

    const answerStatsEl = panelMgr.createEl("div", "answer-stats", index);
    const words = `Words: (0${numwords ? "/" + numwords : ""})`;
    const lines = `Lines: (0${numlines ? "/" + numlines : ""})`;
    answerStatsEl.textContent = `${words} | ${lines}`;


    const qaCommentWrapperEl = panelMgr.createEl("div", "qa-comment-wrapper", index);
    const qaCommentHeaderEl = panelMgr.createEl("label", "qa-comment-header", index);
    qaCommentHeaderEl.innerText = isRegularSchoolFlavored() ? "Teacher Comments" : "Coach Comments";
    const qaCommentEl = panelMgr.createEl("textarea", "qa-textarea-comment", index);
    qaCommentWrapperEl.hidden = true;
    qaCommentEl.disabled = true;

    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'input-answer-actions';
    buttonWrapper.style.display = 'none';

    const updateButtons = () => {
        const value = answerEl.value.trim();
        // word and line count
        const { isWordCountValid, isLineCountValid, statsText} = getAnswerStats(value, parseInt(numwords, 10), parseInt(numlines, 10));
        buttonWrapper.style.display = isWordCountValid && isLineCountValid && value.length > 0 ? 'block' : 'none';
        answerStatsEl.textContent = statsText;
    };

    const clearBtn = panelMgr.createEl('button', "clear-answer-btn", index);
    clearBtn.textContent = '✘';
    clearBtn.onclick = () => {
        answerEl.value = '';
        answerEl.focus();
        updateButtons();
    };

    const submitBtn = panelMgr.createEl('button', "submit-answer-btn", index);
    submitBtn.textContent = '✔';
    submitBtn.onclick = async () => {
        const value = answerEl.value;
        module.getKernel().Vp.addCheckMark();
        const expectedWords = parseInt(numwords, 10) || 0;
        const expectedLines = parseInt(numlines, 10) || 0;
        const {isWordCountValid, isLineCountValid} = getAnswerStats(value, expectedWords, expectedLines);

        if (!isWordCountValid || !isLineCountValid) {
            console.log('Please meet the minimum requirements');
            return;
        }
        await window.glApp.resultPostBack.postSolved(0, blockPosId, null, null, value.trim());
        buttonWrapper.style.display = "none";
    };

    answerEl.addEventListener('input', updateButtons);

    // Append to DOM
    buttonWrapper.appendChild(answerEl);
    buttonWrapper.appendChild(clearBtn);
    buttonWrapper.appendChild(submitBtn);
    footerWrapper.appendChild(answerStatsEl);
    footerWrapper.appendChild(buttonWrapper);
    qaParentEl.appendChild(questionEl);
    qaParentEl.appendChild(answerEl);
    qaParentEl.appendChild(footerWrapper);
    qaCommentWrapperEl.appendChild(qaCommentHeaderEl);
    qaCommentWrapperEl.appendChild(qaCommentEl);
    qaParentEl.appendChild(qaCommentWrapperEl);
    cbdiagramDiv.appendChild(qaParentEl);
};

const getAnswerStats = (value, expectedWords = 0, expectedLines = 0) => {
    const trimmed = value.trim();
    const wordCount = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const lineCount = trimmed ? trimmed.split('\n').length : 0;
    const isWordCountValid = wordCount >= (expectedWords || 0);
    const isLineCountValid = lineCount >= (expectedLines || 0);

    const words = `Words: (${wordCount}${expectedWords ? "/" + expectedWords : ""})`;
    const lines = `Lines: (${lineCount}${expectedLines ? "/" + expectedLines : ""})`;

    return {
        wordCount,
        lineCount,
        isWordCountValid,
        isLineCountValid,
        statsText: `${words} | ${lines}`
    };
}

const updateAnswer = (isAnswerDisabled: boolean, answer: string, index: number) => {
    let ansTextareaEl = $("#textarea-answer" + index);
    let ansStatsEl = $("#answer-stats" + index);
    if (ansTextareaEl.length) {
        ansTextareaEl.val(answer);
        ansTextareaEl.prop("disabled", isAnswerDisabled);
    }
    if (ansStatsEl.length) {
        const statsText = ansStatsEl.text().trim();
        const trimmed = answer.trim();
        const wordCount = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
        const lineCount = trimmed ? trimmed.split('\n').length : 0;
        const updatedStats = statsText
            .replace(/Words:\s*\(\d+/, `Words: (${wordCount}`)
            .replace(/Lines:\s*\(\d+/, `Lines: (${lineCount}`);

        ansStatsEl.text(updatedStats);
    }
};

const showComment = (comment: string, index: number) => {
    let qaCommentWrapperEl = $("#qa-comment-wrapper" + index);
    let qaCommentEl = $("#qa-textarea-comment" + index);
    qaCommentWrapperEl.show();
    qaCommentEl.val(comment);
};

export const setupCheckEvent = () => {
    const panelMgr = window.glApp.panelMgr;
    window.glApp.panelMgr.onChoiceClick = async (moduleIndex, selectedChoiceIndex) => {
        if (panelMgr.modules[moduleIndex].diagramChoice) {
            var c = panelMgr.modules[moduleIndex].diagramChoice.attrs;
            (c && c.length) ||
            (c = panelMgr.modules[moduleIndex].diagramChoice.entries[selectedChoiceIndex].attrs);
            panelMgr.modules[moduleIndex].diagramChoice.entries[selectedChoiceIndex].correct
                ?   ($("#diaChoiceFeedback" + moduleIndex).css("color", "green"),
                    window.playchessUser &&
                        !panelMgr.modules[moduleIndex].diagramChoice.entries[selectedChoiceIndex].done &&
                            glApp.resultPostBack.postSolved(
                                window.playchessUser,
                                panelMgr.modules[moduleIndex].posId || "noid",
                                1,
                                selectedChoiceIndex
                            ),
                        (panelMgr.modules[moduleIndex].diagramChoice.entries[selectedChoiceIndex].done = !0),
                        panelMgr.modules[moduleIndex].getKernel().Vp.addCheckMark())
                :   ($("#diaChoiceFeedback" + moduleIndex).css("color", "red"),
                        glApp.resultPostBack.postMove(panelMgr.modules[moduleIndex].posId, null, selectedChoiceIndex),
                        panelMgr.modules[moduleIndex].getKernel().boardWin.destroySideIcon());
                    $("#diaChoiceFeedback" + moduleIndex).text(
                        panelMgr.modules[moduleIndex].diagramChoice.entries[selectedChoiceIndex].feedback
                    );
            panelMgr.modules[moduleIndex].getKernel().boardWin.addAttributes([]);
            panelMgr.modules[moduleIndex].getKernel().Vp.showChoiceFeedback(c);
        }
        for (c = 0; c < panelMgr.modules[moduleIndex].diagramChoice.entries.length; c++)
            c != selectedChoiceIndex &&
                $(String.f("#checkChoice{0}-{1}", moduleIndex, c)).prop("checked", !1),
                panelMgr.modules[moduleIndex].allowRetry == false &&
                $(String.f("#checkChoice{0}-{1}", moduleIndex, c)).prop("disabled", !0);
    }
}

export const setupMoveListener = () => {
    const modules = window.glApp.panelMgr.modules;
    modules.forEach((module) => {
        const lesson_block_id = module.posId;
        const kernelGame = module.getKernel?.()?.game;
        if (kernelGame?.addOnMoveListener) {
            kernelGame.addOnMoveListener(async (game: any) => {
                const result = GameKernel.staticCheckTechnicalResult(game);
                game.hdr.setResult(result); // Set the game result in game header for 
                const curPosFEN = game.getCurPos().toFEN();
                const curPosNumPly = game.getCurPos().numPly;
                const isMate = game.getLastMove()?.isAMate;
                const isStaleMate = game.getCurPos()?.isStaleMate();
                const pgn = PGNWriter.toPGN(game);
                await window.glApp.resultPostBack.postMove(lesson_block_id, curPosFEN, null, curPosNumPly, pgn, isMate, isStaleMate, result)
            });
        }
    });
};

const applyBorder = (element, color, triggerAnimation) => {
    if (!element) return;
    element.style.border = `1px solid ${color}`;
    if (triggerAnimation) {
        element.style.setProperty('--pulse-color', color);
        element.classList.remove('pulse-shadow');
        void element.offsetWidth; // reset animation
        element.classList.add('pulse-shadow');
    }
};

const displayProgress = async (retrieveFn?: RetrieveFnType, realtimeOptions?: any, allowRetry?: boolean) => {
    const modules = window.glApp.panelMgr.modules;

     const viewProgress = (triggerAnimation?: boolean, block?: any) => {
        // Re-fetch and visualize on real-time update
         const lessonBlockId = block?.lesson_block_id;
        modules.forEach(async (module: any, index: number) => {
            const trackDetails = await retrieveFn(module.posId, block);
            if (!trackDetails) return;
            const canTriggerBlink = triggerAnimation && lessonBlockId && lessonBlockId == module.posId;
            // display border based on status
            // in_progress="orange", in_correct && in_progress & mcq = "red" and completed = "green"
            if (trackDetails.status == AssignmentBlockStatus.COMPLETED) {
                applyBorder(module.pluginDiv, "green", canTriggerBlink)
            } else if (trackDetails.status == AssignmentBlockStatus.IN_PROGRESS) {
                if (trackDetails.mcq) {
                    applyBorder(module.pluginDiv, "red", canTriggerBlink)
                } else {
                    applyBorder(module.pluginDiv, "orange", canTriggerBlink)
                }
            } else if (trackDetails.status == AssignmentBlockStatus.IN_CORRECT) {
                applyBorder(module.pluginDiv, "red", canTriggerBlink);
            } else if (trackDetails.status == AssignmentBlockStatus.CHECK_PENDING) {
                if (isStudent()) {
                    applyBorder(module.pluginDiv, "green", canTriggerBlink);
                } else {
                    applyBorder(module.pluginDiv, "lightGray", canTriggerBlink);
                }
            }

            // update the track details of checkbox if mcq, chess board if exercise
            if (trackDetails.mcq != null) {
                for (var c = 0; c < module.diagramChoice?.entries.length; c++) {
                    const checkbox = document.getElementById(`checkChoice${index}-${c}`);
                    checkbox.checked = (c === trackDetails.mcq);
                    if (allowRetry == false) {
                        checkbox.disabled = true;
                    }
                }
            }
            if (trackDetails.fen_position) {
                const curPos = new Position(trackDetails.fen_position);
                module.getKernel().game.assign(new Game(curPos));
                if (module.getKernel().posInput) {
                    // !0 = true to remove the legal check.
                    module.getKernel().posInput.setBoard(curPos.board, !0);
                }
            }
            if (trackDetails.retry_count) {
                const retryCountElement = module.pluginDiv.querySelector('.retry-count');
                if (retryCountElement) {
                    retryCountElement.textContent = `Retry: ${trackDetails.retry_count}`;
                } else {
                    const newRetryCountElement = document.createElement('div');
                    newRetryCountElement.className = 'retry-count';
                    newRetryCountElement.textContent = `Retry: ${trackDetails.retry_count}`;
                    const belowDiagElement = module.pluginDiv.querySelector('.belowDiag')
                    belowDiagElement.appendChild(newRetryCountElement);
                }
            }
            // Updating PQA answer
            if (trackDetails?.answer) {
                updateAnswer(trackDetails.isAnswerDisabled, trackDetails.answer, index);
            }
            // Show comment
            if (trackDetails?.comment) {
                showComment(trackDetails.comment, index);
            }

            if (trackDetails.pgn) {
                const pgnGame = PGN.parseGame(trackDetails.pgn)
                if (trackDetails.isMyTurn) {
                  pgnGame.setCurLineIndex(pgnGame.mainLine.length - 1)
                } else {
                  pgnGame.setCurLineIndex(pgnGame.mainLine.length)
                }
                module.getKernel().game.assign(pgnGame);
                module.getKernel().game.gotoLast();
            }
            if (trackDetails.allowInput != null) {
                module.getKernel().boardWin.allowInput = trackDetails.allowInput;
            }
        });
    };

    viewProgress();

    if (realtimeOptions?.tracker && realtimeOptions?.topic) {
        const topic = realtimeOptions.topic;  // Generic naming
        const subscribeCallback = (content) => {
            const { block } = content;
            viewProgress(true, block);
        }
        realtimeOptions.tracker.subscribe(topic, subscribeCallback);
    }
};


export const clearChessBoards = () => {
  try {
    if (!window.glApp || !window.glApp.panelMgr || !window.glApp.panelMgr.modules) {
      return ;
    }

    for (let i = 0; i < window.glApp.panelMgr.modules.length; i++) {
      const module = window.glApp.panelMgr.modules[i];
      if (module && module.animationController) {
        module.animationController.rewind();
        //module.getKernel().Vp.restart();
        //module.closeAllBoards();
      }
    }
    clearBubblesAndCheckMark();
  } catch (error) {
    console.error("Error clearing chess boards:", error);
  }
    
}

export const clearBubblesAndCheckMark = () => {
  let elements = document.getElementsByClassName("cbBoardBubble");
  while(elements.length > 0){
    elements[0].parentNode.removeChild(elements[0]);
  }

  elements = document.getElementsByClassName("cbBoardCheckMark");
  while(elements.length > 0){
    elements[0].parentNode.removeChild(elements[0]);
  }
}

export const clearAnimation = () => {
  //Stop the Animation when moving out by clearing the timer
  // Set a fake timeout to get the highest timeout id
  var highestTimeoutId = setTimeout(";");
  for (var i = 0; i < highestTimeoutId; i++) {
    clearTimeout(i);
  }
}

export function enableRewindBackAndNextButtons(allowRetry: boolean) {
  // Enable all buttons with IDs starting with 'd-btnRepeat-'
  const repeatButtons = document.querySelectorAll('[id^="d-btnRepeat-"]');
  repeatButtons.forEach(button => {
    //Check any  grandparent div with class name 'cbdiagram' has property data-showRewind
    const cbdiagram = button.closest('.cbdiagram');
    if (cbdiagram && cbdiagram.hasAttribute('data-showrewind')) {
      button.style.display = 'block';
        //Get the integer id from the button id
        const id = button.id.split('-')[2];
        //Get the Retract and Exec buttons with same id and enable them
        const retractButton = document.getElementById(`d-btnRetract-${id}`);
        retractButton.style.display = 'block';
        const execButton = document.getElementById(`d-btnExec-${id}`);
        execButton.style.display = 'block';
      if (allowRetry == false) {
        button.style.display = 'none';
        retractButton.style.display = 'none';
        execButton.style.display = 'none';
      }
    }
  });

}

// Set expectedIds after loading content
export function collectExpectedIds(editor) {
  const json = editor.getJSON();
  const ids = new Set();
  function traverse(node) {
    if (node.type === 'lessonBlock' && node.attrs?.lesson_block_id) {
      ids.add(node.attrs.lesson_block_id);
    }
    if (node.content) {
      node.content.forEach(traverse);
    }
  }

  traverse(json);
  // console.log('Collected IDs:', ids);
  return ids;
}

export const clearPreviewBoard = () => {
  // Remove Tick Marks added by CBReplay if any
  var checkMarks = document.getElementsByClassName("cbBoardCheckMark");
  while(checkMarks.length > 0){
    checkMarks[0].parentNode.removeChild(checkMarks[0]);
  }

  //Remove the Bubbles added during Animation
  var bubbles = document.getElementsByClassName("cbBoardBubble");
  while(bubbles.length > 0){
    bubbles[0].parentNode.removeChild(bubbles[0]);
  }

  //Stop the Animation when moving out by clearing the timer
  // Set a fake timeout to get the highest timeout id
  var highestTimeoutId = setTimeout(";");
  for (var i = 0 ; i < highestTimeoutId ; i++) {
    clearTimeout(i);
  }
}
