import {useState} from "react";
import {Button, useNotify} from "react-admin";
import {Box, CircularProgress} from "@mui/material";
import { remoteLog } from "@mahaswami/vc-frontend";

export const LessonBlockTagIdsUpdate = () => {
    const [loading, setLoading] = useState(false);

    const notify = useNotify();

    const handleUpdate = async (updateFor) => {
        setLoading(true);
        try {
            const dataProvider = window.swanAppFunctions.dataProvider;
            const { data: ccaiLessonBlocks } = await dataProvider.getList('lesson_blocks', {
                pagination: {page: 1, perPage: 10000},
                filter: {tenant_id: 16},
                sort: {field: "id", order: "ASC"}
            })

            const {data: lessonBlockMappings} = await dataProvider.getList("lesson_block_mapping", {
                pagination: {page: 1, perPage: 100000},
                filter: {tenant_id: 16},
                sort: {field: "id", order: "ASC"}
            });

            const {data: lessons} = await dataProvider.getList("lessons", {
                pagination: {page: 1, perPage: 100000},
                filter: {tenant_id: 16},
                sort: {field: "id", order: "ASC"}
            })

            console.log("Total Lesson Block Mappings: ", lessonBlockMappings.length);

            console.log("Total CCAI Lesson Blocks: ", ccaiLessonBlocks.length);

            if (updateFor === "ccai") {
                const updatedTagIdCCAIList = [];
                const nonUpdatedTagIdCCAIList = [];
                const unableToFindLessonForCCAILessonBlocK = [];

                for (const ccaiLessonBlock of ccaiLessonBlocks) {
                    const lessonMappings = lessonBlockMappings.filter(lbm => lbm.lesson_block_id === ccaiLessonBlock.id);
                    if (lessonMappings.length > 0) {
                        const lessonId = lessonMappings[0].lesson_id;
                        const lesson = lessons.find(l => l.id === lessonId);
                        if (lesson?.tag_ids) {
                            await dataProvider.update("lesson_blocks", {
                                id: ccaiLessonBlock.id,
                                data: {
                                    tag_ids: lesson.tag_ids,
                                }
                            });
                            updatedTagIdCCAIList.push(ccaiLessonBlock);
                        } else {
                            nonUpdatedTagIdCCAIList.push(ccaiLessonBlock);
                        }
                    } else {
                        unableToFindLessonForCCAILessonBlocK.push(ccaiLessonBlock);
                    }
                }
                console.log("Total Updated Tag ID CCAI List: ", updatedTagIdCCAIList.length);
                console.log("Total Non Updated Tag ID CCAI List: ", nonUpdatedTagIdCCAIList);
                console.log("Total Unable To Find Lesson For CCAI List: ", unableToFindLessonForCCAILessonBlocK);
            }

            if (updateFor === "snippet") {
                const {data: snippetLessonBlocks} = await dataProvider.getList("lesson_blocks", {
                    pagination: {page: 1, perPage: 10000},
                    filter: {tenant_id: 66},
                    sort: {field: "id", order: "ASC"}
                })

                console.log("Total Snippet Lesson Blocks: ", snippetLessonBlocks.length);


                const snippetLessonBlocksAfterExclude = snippetLessonBlocks.filter(
                    (block: any) => (!block.name.includes("STARTER") && !block.name.includes("IGNORE") && !block.name.includes("OWN"))
                )

                console.log("Total Snippet Lesson Blocks After Exclude: ", snippetLessonBlocksAfterExclude.length);

                const updatedTagIdSnippetLBList = [];
                const nonUpdatedTagIdSnippetLBList = [];
                const unableToFindLessonForSnippetLBList = [];

                for (const snippetLessonBlock of snippetLessonBlocksAfterExclude) {
                    const ccaiLessonBlock = ccaiLessonBlocks.find(clb=> clb.id == snippetLessonBlock.ccai_pub_id);
                    const lessonId = lessonBlockMappings.find(lbm => lbm.lesson_block_id === ccaiLessonBlock?.id)?.lesson_id;
                    if (lessonId) {
                        const lesson = lessons.find(l => l.id === lessonId);
                        if (lesson?.tag_ids) {
                            await dataProvider.update("lesson_blocks", {
                                id: snippetLessonBlock.id,
                                data: {
                                    tag_ids: lesson.tag_ids,
                                }
                            });
                            updatedTagIdSnippetLBList.push(ccaiLessonBlock);
                        } else {
                            nonUpdatedTagIdSnippetLBList.push(ccaiLessonBlock);
                        }
                    } else {
                        unableToFindLessonForSnippetLBList.push(snippetLessonBlock);
                    }
                }
                console.log("Total Updated Tag ID SNIPPET List: ", updatedTagIdSnippetLBList.length);
                console.log("Total Non Updated Tag ID SNIPPET List: ", nonUpdatedTagIdSnippetLBList);
                console.log("Total Unable To Find Lesson For Snippet List: ", unableToFindLessonForSnippetLBList);
            }

        } catch (error: any) {
            console.error(error);
            notify(`Snippet Tenant Tag IDs Updation failed: ${error.message}`, {type: "error"});
            remoteLog("Error on LessonBlockTagIdsUpdate handleUpdate method: ", error);
        } finally {
            setLoading(false)
        }
    };


    return (
        <Box sx={{m: 2}}>
            <Button
                label="Update Snippet Tenant Tag IDs"
                onClick={() => handleUpdate('snippet')}
                disabled={loading}
            /> <br/> <br/>
            <Button
                label="Update CCAI Tenant Tag IDs"
                onClick={() => handleUpdate('ccai')}
                disabled={loading}
            />
            {loading && <CircularProgress size={24} sx={{ml: 2}}/>}
        </Box>
    );
};
