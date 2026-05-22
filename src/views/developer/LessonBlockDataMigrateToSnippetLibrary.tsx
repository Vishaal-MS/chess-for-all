import {useState} from "react";
import {Grid, Card, CardContent, CircularProgress} from "@mui/material";
import {Button} from "react-admin";
import {currentTenantId} from "../../backend/common_logics.ts";
import { remoteLog } from "@mahaswami/vc-frontend";

export const LessonBlockDataMigrateToSnippetLibrary = () => {
    // This tenant ID only allows for the migration of lesson blocks to the snippets library.
    const tenantId = currentTenantId();
    const [loading, setLoading] = useState(false);

    const getLessonBlockName = (lessonBlock: any) => {
        return lessonBlock.name.match(/^STARTER-(\d+):\s*(.*)$/);
    };

    const handleMigrate = async () => {
        try {
            setLoading(true);
            const dataProvider = window.swanAppFunctions.dataProvider;
            const {data: lessonBlocks} = await dataProvider.getList("lesson_blocks", {
                pagination: {page: 1, perPage: 10000},
                filter: {tenant_id: tenantId},
                sort: {field: "name", order: "ASC"}
            });

            const includedLessonBlocks = lessonBlocks.filter((lb: any) => lb.name.includes("STARTER")).sort((a: any, b: any) => a.id - b.id);
            const excludedLessonBlocks = lessonBlocks.filter((lb: any) => !lb.name.includes("STARTER") && !lb.name.includes("IGNORE") && !lb.name.includes("OWN"));

            const nameReplacedLessonBlocks = [];
            console.log("Started Finding Original LessonBlock: ");
            for (const excludedLessonBlock of excludedLessonBlocks) {
                if (excludedLessonBlock?.ccai_pub_id) {
                    const {data: originalBlock} = await dataProvider.getOne('lesson_blocks', {id: excludedLessonBlock.ccai_pub_id});
                    if (originalBlock) {
                        excludedLessonBlock.name = originalBlock.name;
                        nameReplacedLessonBlocks.push(originalBlock);
                    }
                }
            }
            console.log("Name Replaced Lesson Blocks: ", nameReplacedLessonBlocks.length);

            const newLessonBlocks = [...includedLessonBlocks, ...excludedLessonBlocks];

            const {data: snippetLibrary} = await dataProvider.getList("snippets_library", {
                pagination: {page: 1, perPage: 10000},
                meta: {scopingEscapeHatch: true}
            });

            console.log("Exist Snippets Library Records: ", snippetLibrary.length);

            if (snippetLibrary.length !== 0) {
                const deletedIds = [];
                for (const sl of snippetLibrary) {
                    dataProvider.delete("snippets_library", {id: sl.id});
                    deletedIds.push(sl.id);
                }
                for (const deletedId of deletedIds) {
                    const index = snippetLibrary.findIndex(item => item.id === deletedId);
                    if (index !== -1) {
                        snippetLibrary.splice(index, 1);
                    }
                }
            }

            if (snippetLibrary.length === 0) {

                const migrated = [];

                for (const lessonBlock of newLessonBlocks) {
                    const lessonBlocksName = getLessonBlockName(lessonBlock);
                    let slTitle;
                    let positionNumber;
                    let isAdvanced;
                    let isStarter;

                    if (lessonBlocksName) {
                        positionNumber = lessonBlocksName[1];
                        slTitle = lessonBlocksName[2];
                        isAdvanced = false;
                    } else {
                        slTitle = lessonBlock.name;
                        positionNumber = null;
                        isAdvanced = true;
                    }

                    const {data: createdSnippet} = await dataProvider.create("snippets_library",
                        {
                            data: {
                                ...lessonBlock,
                                type: lessonBlock.block_type.split("_").map((word: any) => word.charAt(0).toUpperCase() + word.slice(1)).join(" "),
                                title: slTitle,
                                content: lessonBlock.block_description,
                                position_number: positionNumber,
                                is_advanced: isAdvanced,
                                is_active: true,
                            },
                        });
                    migrated.push(createdSnippet);
                }

                console.log("Total migrated lesson blocks: ", migrated.length);
            }
        } catch (error) {
            console.error("Migration error:", error);
            remoteLog("Error on LessonBlockDataMigrateToSnippetLibrary handleMigrate method: ", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card sx={{paddingTop: "0.5rem", marginTop: "0.5rem"}}>
            <CardContent>
                <Grid container>
                    <Grid item>
                        <Button
                            onClick={handleMigrate}
                            label="Lesson Blocks Migrate to Snippets Library"
                            disabled={loading}
                        />
                    </Grid>
                    {loading && <CircularProgress size={24} sx={{ml: 2}}/>}
                </Grid>
            </CardContent>
        </Card>
    );
};
