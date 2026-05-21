import { Button,  Loading } from "react-admin";
import { Card, CardContent } from "@mui/material";
import { getLocalStorage, remoteLog, setLocalStorage } from "@mahaswami/vc-frontend";
import { useState, useEffect } from "react";

export function TroubleshootBlockMapMissing() {

    const [state, setState] = useState({
        loading: true,
        missingLessonBlockMappings: undefined,
    });

    useEffect(() => {
       const fetchData = async () => {
        try {
           const dataProvider = window.swanAppFunctions.dataProvider;
           const { data: lessons } = await dataProvider.getList("lessons", {
               pagination: { page: 1, perPage: 10000 },
               meta: {scopingEscapeHatch: true}
           });
           const { data: existingMappings } = await dataProvider.getList(
               "lesson_block_mapping",
               {
                   pagination: { page: 1, perPage: 10000 },
                   meta: {scopingEscapeHatch: true}
               },
           );
           const mappingResults: any[] = [];

           for (const lesson of lessons) {
               const { id: lessonId, content, tenant_id: tenantId } = lesson;
               const matches = [
                   ...content.matchAll(/lesson_block_id="(\d+)"/g),
               ];
               const lessonBlockIds = matches.map((match) => match[1]);

               for (const lessonBlockId of lessonBlockIds) {
                   const foundMapping = existingMappings.find(
                       (mapping: any) =>
                           mapping.lesson_id == lessonId &&
                           mapping.lesson_block_id == lessonBlockId
                   );
                   if (!foundMapping) {
                       mappingResults.push({
                           id: `${lessonId}-${lessonBlockId}`,
                           lesson_id: lessonId,
                           lesson_block_id: lessonBlockId,
                           tenant_id: tenantId,
                       });
                   }
               }
           }
           console.log(mappingResults);
           setState({ loading: false, missingLessonBlockMappings: mappingResults })
        } catch (error) {
            remoteLog("Error on TroubleshootBlockMapMissing fetchData method: ", error);
        }
       }
       fetchData()
    }, []);

    if (state.loading )
        return <Loading />;

    const { missingLessonBlockMappings } = state;

    const handleUpdate = async () => {
        const dataProvider = window.swanAppFunctions.dataProvider;
        missingLessonBlockMappings?.map(async (missingLessonBlockMapping) => {
            const preservedTenant = getLocalStorage("tenant_id");
            setLocalStorage("tenant_id", missingLessonBlockMapping.tenant_id);
            try {
                await dataProvider.create("lesson_block_mapping", {
                    data: {
                        lesson_id: missingLessonBlockMapping.lesson_id,
                        lesson_block_id: missingLessonBlockMapping.lesson_block_id,
                    },
                });
            } catch (error) {
                remoteLog("Error on TroubleshootBlockMapMissing handleUpdate method: ", error);
            } finally {
                setLocalStorage("tenant_id", preservedTenant);
            }
        });
    };

    return (
        <Card>
            <CardContent sx={{ paddingTop: "5rem" }}>
                <Button
                    onClick={handleUpdate}
                    label="Update Missing Lesson Block Mapping"
                />
                <table>
                    {missingLessonBlockMappings.map(block =>
                        <tr>
                            <td>{block.lesson_id}</td>
                            <td>{block.lesson_block_id}</td>
                            <td>{block.tenant_id}</td>
                        </tr>
                    )}
                </table>
            </CardContent>
        </Card>
    );
}

/* 8866	257	151	16
   8867	256	305	16
   8868	257	153	16
   8869	256	304	16
   8870	256	307	16
   8871	256	301	16																						 */
