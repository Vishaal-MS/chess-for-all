import { RecordContextProvider, useGetOne, Loading } from "react-admin";
import { useParams, useSearchParams } from "react-router-dom";
import { ChessAIField } from "../../fields/ai_lesson/ChessAIField";

export const StudentAssignmentLive = () => {
    let [searchParams] = useSearchParams();
    const { id } = useParams();
    const assignmentId = searchParams.get("assignment");
    const { data: lesson, isLoading } = useGetOne("lessons", { id });

    if (isLoading) return <Loading/>

    return (
        <RecordContextProvider value={lesson}>
            <ChessAIField
                source="content"
                assignmentId={assignmentId}
                lessonId={lesson.id}
                sx={{ padding: "0.5rem" }}
            />
        </RecordContextProvider>
    );
};
