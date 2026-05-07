import AssistantIcon from '@mui/icons-material/Assistant';
import YoutubeIcon from '@mui/icons-material/YouTube';
import WidgetsIcon from '@mui/icons-material/Widgets';
import { fileUploadPrompt } from '../../views/common/FileUploadDialog';
import PhotoIcon from '@mui/icons-material/Photo';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import InsertPageBreakIcon from '@mui/icons-material/InsertPageBreak';
import { addLoadingIndicator, uploadImage } from '../../utils';
import { Typography, Box } from "@mui/material";
import { clearPreviewBoard } from './ai_lesson_utils';
import { LessonBlockForm } from '../../views/curriculum/LessonBlockForm';
import { closeDialog, openDialog } from '@mahaswami/vc-frontend';
import { LessonBlockSelectors } from '../../views/curriculum/lessonBlocksSelector';

export const getSuggestionItems = (params) => {
    const hash = window.location.hash;
    const query = params.query;
    const commonSuggestionItems = [
        {
            icon: <AssistantIcon />,
            title: "AI Text",
            description: "Chess Trained Course Material Assistant",
            command: async ({ editor, range }) => {

                await chessAICommand(editor, range);

            }
        },
        {
            icon: <PhotoIcon />,
            title: "Upload Image",
            description: "Upload an image from your computer",
            command: async ({ editor, range }) => {
                const { files, isCanceled } = await fileUploadPrompt("Please upload an image", 
                    "Choose an Image To Upload", "Upload");
                if (isCanceled === true) {
                    removeSlash(range, editor);
                    return;
                }
                if (files && files.length > 0 && validateFile(files[0])) {
                    const file = files[0];
                    uploadImageFile(file, range, editor);
                }                
            }
        }, 
        {
            icon: <VideoCameraFrontIcon />,
            title: "Upload Video",
            description: "Upload an video from your computer",
            command: async ({ editor, range }) => {
                const { files, isCanceled } = await fileUploadPrompt("Please upload an video", "Choose an Video To Upload", "Upload");
                if (isCanceled === true) {
                    removeSlash(range, editor);
                    return;
                }
                if (files && files.length > 0 && validateFile(files[0])) {
                    const file = files[0];
                    uploadVideoFile(file, range, editor);
                }                
            }
        },         
        {
            title: "Embed Video",
            description: "Embed any video like Youtube, Vimeo etc.",
            icon: <YoutubeIcon />,
            command: ({ editor, range }) => {
              const videoLink = prompt("Please enter a URL like Youtube, Vimeo etc. to embed");
              if( videoLink === null || videoLink === undefined || videoLink.trim() === "") {
                removeSlash(range, editor)

                alert("Please enter a valid URL to embed video.");  
              }
              else {
                const output = `<swan-video src="${videoLink}"'></swan-video>`

                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .insertContent(output)
                    .run();
              }
            },
        },   
        {
            title: "Section Break",
            description: "Insert a section break to divide content",
            icon: <InsertPageBreakIcon />,
            command: ({ editor, range }) => {
                const output = '<section-break></section-break>';

                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .insertContent(output)
                    .run();
            }
        },
    ]
      .filter((item) => item.title.toLowerCase().startsWith(query.toLowerCase()))
      .slice(0, 10);
    let lessonSuggestionItems = [];
    lessonSuggestionItems.push({
            icon: <AssistantIcon />,
            title: "AI Lesson Block",
            description: "Generate a Lesson Block using AI",
            command: async ({ editor, range }) => {
                await chessAILessonBlockGenCommand(editor, range);
            }
        },
        {
            icon: <WidgetsIcon />,
            title: "Insert Lesson Block",
            description: "Insert a lesson block from blocks library",
            command: async ({ editor, range }) => {
                await insertBlockCommand(editor, range);
            }
        });
    for (const commonSuggestionItem of commonSuggestionItems) {
        lessonSuggestionItems.push(commonSuggestionItem)
    }
    if (hash.includes('lessons'))
        return lessonSuggestionItems;
    else
        return commonSuggestionItems;
};

  async function chessAICommand(editor: any, range: any) {
    let body = {};
    body.systemPrompt = "You are a helpful assistant to a chess coach. " +
        " You are helping them create a chess course. " +
        " all questions are in the context of Chess Only. Do not expect chess word to be explicitly referred in each prompt. " +
        "Do not add any prefix or suffix to the answer. " ;

    editor
        .chain()
        .focus()
        .deleteRange(range)
        .selectNodeBackward()
        .run();

    const { view, state } = editor;
    const { from, to } = view.state.selection;
    const text = state.doc.textBetween(from, to, ' ');
    //console.log("Selected text: ", text);
    body.prompt = text;
    body.model = 'gpt-4o-mini'
    let llmURL = window.data_service_map[window.data_service_name] + "/"
        + window.spreadsheetId + "/-1" + "/generic_ai";
    console.log("Sending prompt...");
    let result = await fetch(llmURL, {
        method: "POST",
        body: JSON.stringify(body),
    });
    const responseText = await result.json();
    let aiGenerated = undefined;
    try {
        aiGenerated = responseText.response;
    } catch (e) {
        console.error("Error in response: ", e);
        alert("Unable to generate text. Please try again.");
        return;
    }    
    console.log(aiGenerated);
    editor
        .chain()
        .focus()
        .deleteSelection()
        .insertContent(aiGenerated)
        .run();
}

async function insertBlockCommand(editor: any, range: any) {
    openDialog(<LessonBlockSelectDialog width="50vw" editor={editor} range={range} />,
        {onClose: () => { removeSlash(range, editor) }});
}

async function chessAILessonBlockGenCommand(editor: any, range: any) {
    openDialog(<LessonBlockGenDialog width="95vw" editor={editor} range={range} />, 
        {onClose: () => { removeSlash(range, editor) }})
}

const handleListItemClick = (block: any, editor: any, range: any) => {    
    console.log("handleListItemClick", block);
    clearPreviewBoard();
    const output = `<lesson-block lesson_block_id=${block.id}></lesson-block>`
    // NOTE: This inserted event will exec loadChessboards func.
    closeDialog();
    editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(output)
        .run();    
        document.dispatchEvent(new CustomEvent('lessonblock:inserted', {
            detail: { lesson_block_id: block.id }
        }))


};

export const LessonBlockSelectDialog = (props: any) => {
    
    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" align={"center"}>
              Choose Lesson Blocks
            </Typography>
            <LessonBlockSelectors 
                    onInsert={ (block: any) => handleListItemClick(block, props.editor, props.range)} 
                    /> 
        </Box>
    )
}        
export const LessonBlockGenDialog = (props: any) => {
    
    return (
        <Box>
            <Typography sx={{mt: -2, mb: 1}} variant="h6" align={"center"}>
              Generate Lesson Block Using AI
            </Typography>
            <LessonBlockForm onSaveBlock={ (block: any) => handleListItemClick(block, props.editor, props.range)} 
                    formMode={"AI_ON_THE_FLY"}/> 
        </Box>
    )
}                  

function removeSlash(range: any, editor: any) {
    editor
      .chain()
      .focus()
      .deleteRange(range)
      .run();
}

function uploadImageFile(file: any, range: any, editor: any) {
    try {
        let _URL = window.URL || window.webkitURL;
        let img = new Image(); 
        img.src = _URL.createObjectURL(file);
        img.onload = async function () {
            if (this.width > 5000 || this.height > 5000) {
                window.alert("Your images need to be less than 5000 pixels in height and width."); // display alert
            } else {
                const loadingIndicator = addLoadingIndicator();
                const resource = 'lessons';
                let response = await uploadImage(file, resource)
                console.log('Image uploaded successfully', response);
                let imageFileId = response; 
                const output = `<swan-image image_id=${imageFileId}></swan-image>`;

                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .insertContent(output)
                    .run();

                setTimeout(() => {
                    loadingIndicator.style.display = 'none';
                }, 200);
            }
        };
    } catch (error) {
        console.error('Error uploading image', error);
        if (error) {
            window.alert("There was a problem uploading your image, please try again.");
        }
    }
}    

function uploadVideoFile(file: any, range: any, editor: any) {
    try {
        let video = document.createElement('video');
        let URL = window.URL || window.webkitURL;
        video.src = URL.createObjectURL(file);
        video.onloadedmetadata =  async function () {
            if (this.videoWidth > 5000 || this.videoHeight > 5000) {
                window.alert("Your videos need to be less than 5000 pixels in height and width."); 
            }else {
                const loadingIndicator = addLoadingIndicator();
                const resource = 'lessons';
                let response = await uploadImage(file, resource);
                console.log('Video uploaded successfully', response);
                let videoFileId = response; 
                const output = `<swan-video video_id=${videoFileId}></swan-video>`;

                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .insertContent(output)
                    .run();

                setTimeout(() => {
                    loadingIndicator.style.display = 'none';
                }, 200);                
            }
        };
    } catch (error) {
        console.error('Error uploading video', error); // handle the error
        if (error) {
            window.alert("There was a problem uploading your video, please try again.");
        }
    }
}    

function validateFile(file: any) {
    let result = false;
    let filesize = ((file.size / 1024) / 1024).toFixed(4); // get the filesize in MB
    if ((file.type === "image/jpeg" || file.type === "image/png")) {
        if (filesize < 10) {
            result = true;
        } else {
            window.alert("Images need to be less than 10mb in size.");
        }
    }
    // Check for valid video file type and size (e.g., .mp4, .webm, .ogg)
    else if ((file.type === "video/mp4" || file.type === "video/webm" || file.type === "video/ogg")) { 
        
        if (filesize < 200) { // Temporarly allowing less then  50mb to 200mb for video uploading
            result = true;
        }  else {
            window.alert("Videos need to be less than 200mb in size.");
        }
    }
    else {
        window.alert("Invalid file type. Please upload an image or video.");
    }
    return result;
}