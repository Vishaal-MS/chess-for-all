import {Typography} from "@mui/material";
import Dropzone from "react-dropzone";
import {useNotify} from "react-admin";
import {useState} from "react";
import Papa from 'papaparse';


export const DragAndDropCsvFile = ({setFileData, requiredColumns}) => {
    const [fileName, setFileName] = useState('');
    const [errorMsg,setErrorMsg] = useState('');
    const notify = useNotify();

    const handleDataTrim = (data) => {
        return data.map(row => {
            const trimmedRow = {};
            for (const key in row) {
                if (Object.prototype.hasOwnProperty.call(row, key)) {
                    trimmedRow[key.trim()] = row[key].trim();
                }
            }
            return trimmedRow;
        });
    }

    const handleDrop = (acceptedFiles: any) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setFileName(file.name);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const diffCols = requiredColumns?.filter(col => !results.meta.fields.map((field) => field?.trim()).includes(col));
                if(diffCols.length === 0) {
                    setErrorMsg('');
                    const trimData = handleDataTrim(results.data);
                    if (results.data) {
                        setFileData(trimData);
                    } else {
                        notify(`Data not found in ${file.name}`, {type: "error"});
                    }
                } else {
                    setErrorMsg(`\`${file.name}\` does not contain these columns: ${diffCols.join(', ')}`)
                }
            },
            error: (err) => {
                console.error("Error parsing CSV:", err);
            }
        });
    };

    return(
        <>
            <Dropzone onDrop={handleDrop} accept={{ 'text/csv': ['.csv'] }}>
                {({ getRootProps, getInputProps, isDragActive }) => (
                    <div
                        {...getRootProps()}
                        style={{border: `2px dashed ${errorMsg ? '#d32f2f' :'#1976d2' }`, borderRadius: '1rem', padding: '1rem', textAlign: 'center',
                            backgroundColor: isDragActive ? '#e3f2fd' : '#fafafa', transition: 'background-color 0.3s ease', cursor: 'pointer'
                        }}
                    >
                        <input {...getInputProps()} />
                        <p>Drag & Drop CSV file here, or click to select files</p>
                    </div>
                )}
            </Dropzone>
            {errorMsg && <Typography variant="body2" sx={{ mt: 1, ml: 1, color: '#d32f2f' }}>{errorMsg}</Typography>}
            {(fileName && !errorMsg) && <Typography variant="body2" sx={{ mt: 1, ml: 1, color: '#5dafe4' }}>{fileName}</Typography>}
        </>
    )
}