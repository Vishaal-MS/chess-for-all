
import { getUserId } from "../../businessLogic";
import { useEffect, useState } from "react";
import { Confirm, useRecordContext } from "react-admin";
import { GAME_ACTIONS, GAME_STATUS } from "../../helpers/constants";
import { useGamePlay } from "./GamePlayView";
import { useNavigate } from "react-router-dom";

export const InvitationDialog = () => {
    const [state, setState] = useState<any>({
        showInvitation: false,
        students: []
    })
    const game = useRecordContext();
    const navigate = useNavigate();
    const {sendEvent} = useGamePlay();

    useEffect(() => {
        const showAlertToChallenge = async () => {
            try {
                const dataProvider = window.swanAppFunctions.dataProvider;
                const { data: students } = await dataProvider.getMany("students", {
                    ids: [game?.player1_student_id, game?.player2_student_id],
                    meta: {prefetch: ["users"]}
                })
                const player1 = students.find(student => student.id == game?.player1_student_id);
                const player2 = students.find(student => student.id == game?.player2_student_id);
                const canShowInvitation = player2?.user.id == getUserId(); // show invitation only for player 2
                setState({
                    showInvitation: canShowInvitation,
                    students: [player1, player2]
                });
            } catch (error) {
                console.error("Error: ", error)
            }
        }
        if (game?.status == GAME_STATUS.INVITED) {
            showAlertToChallenge();
        }
    }, [game])

    const { showInvitation, students } = state
    const [challengerStudent, challengeeStudent] = students;
    const handleAccept = async () => {    
        setState(prevState => ({
            ...prevState,
            showInvitation: false,
        }));
        await sendEvent({ action: GAME_ACTIONS.INVITATION_ACCEPTED, game, students });
    }
    const handleReject = async (event, reason) => {
        if (reason == "backdropClick") {
            return; // disable click outside close dialog
        }
        await sendEvent({ action: GAME_ACTIONS.INVITATION_REJECTED, game, students });
        navigate(-1)
    }   

    return (
        <Confirm                
            title={"Game Invitation"}
            isOpen={showInvitation}
            onConfirm={handleAccept}
            onClose={handleReject}
            content={`You have been invited to a game by ${challengerStudent?.user.fullName}. Do you want to accept?`}
            confirm="Accept"
            cancel="Reject"
        />
    )
}