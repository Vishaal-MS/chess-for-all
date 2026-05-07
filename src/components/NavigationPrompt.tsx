import {useBlocker} from "react-router-dom";
import {useEffect} from "react";

interface useNavigationPromptProps {
    when: boolean;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}
export const useNavigationPrompt = ({ when, message, onConfirm, onCancel }: useNavigationPromptProps) => {
    const blocker = useBlocker(() => when);

    useEffect(() => {
        if (blocker.state === 'blocked') {
            const confirmed = window.confirm(message);
            if (confirmed) {
                onConfirm?.();
                blocker.proceed();
            } else {
                onCancel?.();
                blocker.reset();
            }
        }
    }, [blocker]);
};