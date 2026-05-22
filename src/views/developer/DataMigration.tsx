import { useState } from "react";
import {currentTenantId} from "../../backend/common_logics.ts";
import {Box, Card, CardContent, Typography} from "@mui/material";
import {Button, useNotify} from "react-admin";
import { remoteLog } from "@mahaswami/vc-frontend";

export const DataMigration = () => {

    const dataProvider = window.swanAppFunctions.dataProvider;
    const [events, setEvents] = useState([]);
    const [curriculumValue, setCurriculumValue] = useState("");
    const notify = useNotify();

    const handleFileUpload = (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            if (typeof content === "string") {
                const eventBlocks = content.split(/(?=\[Event )/);
                const match = content.match(/\[Curriculum\s+"([^"]+)"]/);
                if (match && match[1]) {
                    setCurriculumValue(match[1]);
                } else {
                    notify("Unable To Find The Curriculum",{type: "error"})
                    const inputElement = document.querySelector('input[type="file"]');
                    inputElement.value = '';
                    return;
                }


                const seenEventNames = new Set();

                let processedEvents = eventBlocks.map((block, index) => {
                    let eventName = extractTagValue(block, "Event");
                    const white =  extractTagValue(block, "White");
                    const black = extractTagValue(block, "Black");

                    if (seenEventNames.has(eventName)) {
                        eventName = eventName + " " + white + " vs " + black;
                    }
                    seenEventNames.add(eventName);

                    return {
                        eventName: eventName,
                        content: block,
                    }
                });
                processedEvents = processedEvents.filter(item => item.eventName !== '')
                setEvents(processedEvents);
            }
        };
        reader.readAsText(file);
    };

    const extractTagValue = (text, tag) => {
        const regex = new RegExp(`\\[${tag} "([^"]*)"]`);
        const match = text.match(regex);
        return match ? match[1] : "";
    };

    const generateExcel = async () => {

        setTimeout(async () => {
            const curruculumData = {
                name: curriculumValue,
                tenant_id: currentTenantId()
            }
            const {data: curriculum} = await dataProvider.create('curriculum', {data: curruculumData})

            const subscribableData = {
                name: curriculum.name,
                curriculum_id: curriculum.id,
                published_date: new Date(),
                is_active: true,
                royalty_amount: 0,
                publisher_tenant_id: currentTenantId(),
                rating: 4
            }

            const {data: subscribable} = await dataProvider.create('subscribables', {data: subscribableData})

            const lessonBlocks = [];

            for (const data of events) {
                try {
                    const { data: lessonBlock } = await dataProvider.create("lesson_blocks", {
                        data: {
                            name: data.eventName,
                            block_type: "pgn",
                            tenant_id: currentTenantId(),
                            pgn: data.content,
                        },
                    });
                    lessonBlocks.push(lessonBlock);
                } catch (error) {
                    console.error(`Error creating lesson block`, error);
                    remoteLog("Error on DataMigration lesson_blocks create: ", error);
                }
            }

            const lessons = [];

            for (const lessonBlock of lessonBlocks) {
                try {
                    const { data: lesson } = await dataProvider.create("lessons", {
                        data: {
                            name: lessonBlock.name,
                            content: `<lesson-block lesson_block_id="${lessonBlock.id}"></lesson-block>`,
                            language: "EN",
                            tenant_id: currentTenantId(),
                        },
                    });
                    lesson.lesson_block_id = lessonBlock.id;
                    lessons.push(lesson);
                } catch (error) {
                    console.error(`Error creating lessons`, error);
                    remoteLog("Error on DataMigration lessons create: ", error);
                }
            }

            for (const lesson of lessons){
                try {
                    await dataProvider.create('lesson_block_mapping', {
                        data: {
                            lesson_id: lesson.id,
                            lesson_block_id: lesson.lesson_block_id,
                            tenant_id: currentTenantId(),
                        }
                    });
                } catch (error) {
                    console.error(`Error creating lesson_block_mapping`, error);
                    remoteLog("Error on DataMigration lesson_block_mapping create: ", error);
                }
            }

            for (const lesson of lessons){
                try {
                    await dataProvider.create('curriculum_lessons', {
                        data: {
                            curriculum_id: curriculum.id,
                            lesson_id: lesson.id,
                            tenant_id: currentTenantId()
                        }
                    });
                } catch (error) {
                    console.error(`Error creating curriculum_lessons`, error);
                    remoteLog("Error on DataMigration curriculum_lessons create: ", error);
                }
            }
        }, 500);
        notify('started to process file, will be completed in a few minutes')
    };

    return (
        <Card sx={{mx: "auto", mt: 4, p: 2, boxShadow: 3, width: '100%' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Data Migration
                </Typography>
                <Typography variant="h8" gutterBottom>
                    <p>
                        1. upload only .txt file
                    </p>
                    <p>
                        2. File context should be a bellow format
                    </p>
                    <p>
                        [Curriculum "100 Golden Games"] <br/>
                        [Event "Brussel"]<br/>
                        [Site "Brussel"] <br/>
                        [Date "1991.08.??"] <br/>
                        [EventDate "?"] <br/>
                        [Round "9"] <br/>
                        [Result "0-1"] <br/>
                        [White "Vassily Ivanchuk"] <br/>
                        [Black "Artur Yusupov"] <br/>
                        [ECO "E67"] <br/>
                        [WhiteElo "?"] <br/>
                        [BlackElo "?"] <br/>
                        [PlyCount "78"] <br/> <br/>

                        1.c4 e5 2.g3 d6 3.Bg2 g6 4.d4 Nd7 5.Nc3 Bg7 6.Nf3 Ngf6 7.O-O <br/>
                        O-O 8.Qc2 Re8 9.Rd1 c6 10.b3 Qe7 11.Ba3 e4 12.Ng5 e3 13.f4 Nf8 <br/>
                        14.b4 Bf5 15.Qb3 h6 16.Nf3 Ng4 17.b5 g5 18.bxc6 bxc6 19.Ne5 <br/>
                        gxf4 20.Nxc6 Qg5 21.Bxd6 Ng6 22.Nd5 Qh5 23.h4 Nxh4 24.gxh4 <br/>
                        Qxh4 25.Nde7+ Kh8 26.Nxf5 Qh2+ 27.Kf1 Re6 28.Qb7 Rg6 29.Qxa8+ <br/>
                        Kh7 30.Qg8+ Kxg8 31.Nce7+ Kh7 32.Nxg6 fxg6 33.Nxg7 Nf2 34.Bxf4 <br/>
                        Qxf4 35.Ne6 Qh2 36.Rdb1 Nh3 37.Rb7+ Kg8 38.Rb8+ Qxb8 39.Bxh3 <br/>
                        Qg3 0-1
                    </p>
                </Typography>
                <Box>
                    <input
                        type="file"
                        accept=".txt"
                        onChange={handleFileUpload}
                        style={{ marginBottom: "16px", display: "block" }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={generateExcel}
                        disabled={!events.length}
                    >
                        Import Data
                    </Button>
                </Box>
            </CardContent>
        </Card>
    )
}