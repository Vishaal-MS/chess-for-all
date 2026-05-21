import { createContext, useContext } from "react";

type ReportStateType = {
    showBackBtn?: boolean;
}

type ReportContextType = {
    state: ReportStateType | Record<string, any>;
    toggleShowBack: (canShowBack?: boolean, updateState?: any) => void;
    backToPrevious: () => void;
    setPreviousState: (newState: any) => void;
}

const ReportContext = createContext<ReportContextType | null>(null);

const useReport = () => {
    const reportContext = useContext(ReportContext);
    if (!reportContext) {
        throw new Error("Please use useReport inside of ReportContextProvider");
    }
    return reportContext;
}

export { ReportContext, useReport };