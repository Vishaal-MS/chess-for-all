import {getStudentId, isStudent} from "../../backend/common_logics.ts";

export const validateGameCreation = (values: any) => {
    const errors: Record<string, string> = {};

    if (!values.is_player1_external && !values.player1_student_id) {
        errors.player1_student_id = "Player 1 is required";
    }
    if (values.is_player1_external && !values.player1_name) {
        errors.player1_name = "Player 1 name is required";
    }

    if (!values.is_player2_external && !values.player2_student_id) {
        errors.player2_student_id = "Player 2 is required";
    }
    if (values.is_player2_external && !values.player2_name) {
        errors.player2_name = "Player 2 name is required";
    }

    // cannot have same players
    if (
        values.player1_student_id &&
        values.player2_student_id &&
        values.player1_student_id === values.player2_student_id
    ) {
        errors.player2_student_id = "Player 1 and Player 2 cannot be the same";
    }

    // check student participation
    if (isStudent()) {
        const selectedPlayers = [
            values.player1_student_id,
            values.player2_student_id
        ].filter(Boolean);

        if (!selectedPlayers.includes(getStudentId())) {
            errors.player2_student_id = "You must be one of the players";
            errors.player1_student_id = "You must be one of the players";
            errors.player1_name = "You must be one of the players";
            errors.player2_name = "You must be one of the players";
        }
    }

    if (!values?.result) {
        errors.result = "Result is required";
    }

    if (!values?.time_control_id) {
        errors.time_control_id = "Time control is required";
    }

    return errors;
};
