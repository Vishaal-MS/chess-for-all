import { useRealtimeComms } from "@mahaswami/vc-frontend";
import { useCallback, useEffect } from "react";
import { NotificationType, useNotify, useRedirect, Button } from "react-admin";
import { getUserId } from "../../businessLogic";
import { SnackbarContent } from '@mui/material';

type ActionType = "offer_draw" | "abandand" | "accepted" | 
    "rejected" | "invitation" | "invitation_from_coach"

type UserType = { 
    user: { id: number, fullName: string, email: string } 
    fullName?: string;
}

type ContentType = {
    action: ActionType;
    challenger: UserType;
    challengee: UserType;
    game: any;
}

export const GameNotificationListener = () => {
    const notify = useNotify();
    const realtimeComms = useRealtimeComms();
    const redirect = useRedirect();

    const gameNotify = useCallback((type: NotificationType, message: string, gameId?: number) => {
        notify(
            <SnackbarContent
                message={message}
                action={
                    gameId && <Button
                        label="View"
                        onClick={() => {
                            if (gameId) {
                                redirect(`/games/${gameId}/play`)
                                notify(false, { autoHideDuration: 0 });
                            }
                        }}
                    />
                }
            />, { 
            type, 
            anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
            autoHideDuration: 30000
        })
    }, [notify])

    useEffect(() => {
        realtimeComms.subscribe("game/notifications", handleNotifications);
        return () => {
            realtimeComms.unsubscribe("game/notifications", handleNotifications);
        }
    }, [])

    const handleNotifications = useCallback((content: ContentType) => {
        const { action, challenger, challengee, game } = content;

        // Current user is a challenger 
        if (challenger?.user?.id === getUserId()) {
            switch (action) {
                case "accepted":
                    gameNotify("success", `${challengee.user.fullName} has Accepted your challenge`, game.id)
                    break;
                case "rejected":
                    gameNotify("warning", `${challengee.user.fullName} has Rejected your challenge`)
                    break;
                case "invitation_from_coach":
                    gameNotify("info", `Game invitation from Coach`, game.id);
                    break;
            }
        }

        // Current user is a Challengee 
        if (challengee?.user?.id === getUserId()) {
            switch (action) {
                case "accepted":
                    gameNotify("success", `${challenger.user.fullName} has Accepted your challenge`, game.id)
                    break;
                case "invitation":
                    gameNotify("info", `Game invitation from ${challenger.user.fullName}`, game.id);
                    break;
                case "invitation_from_coach":
                    gameNotify("info", `Game invitation from Coach`, game.id);
                    break;
            }
        }
    }, [realtimeComms, gameNotify])

    return false;
}