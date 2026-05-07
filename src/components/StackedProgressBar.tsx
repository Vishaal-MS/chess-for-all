import React from 'react';
import { Tooltip,LinearProgress, Box, Typography } from '@mui/material';

const StackedProgressBar = ({progressValues}) => {
    // Sort progressValues by the 'value' column (percentage)
    const sortedProgressValues = [...progressValues].sort((a, b) => b.label - a.label);
    const size = sortedProgressValues.length;
    const completedPercentage = 60; // 60% completed
    const inProgressPercentage = 30; // 30% in progress
    const notStartedPercentage = 10; // 10% not started
    let offSet = 0; let zIndex = size;
    return (
            <Box sx={{ position: 'relative' }}>
                {
                    progressValues.map((progressValue, index) => {
                        const style = {
                            position: 'absolute',
                            top: 0,
                            left: `${offSet}%`,
                            width: `${progressValue.percent}%`, height: 5,
                            zIndex: zIndex,
                        }
                        offSet += progressValue.percent; zIndex = zIndex - 1;
                        return (<Tooltip title={progressValue.label + ':' + progressValue.value} arrow><LinearProgress key={index}
                            variant="determinate"
                            value={100}
                            sx={{
                                ...style
                            }} color={progressValue.color}
                        /></Tooltip> );

                    })
                }
            </Box>);
}
                {/* Completed section */}
               {/* <LinearProgress
                    variant="determinate"
                    value={100}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: `${completedPercentage}%`, height: 5,
                        zIndex: 3,
                    }} color={'success'}
                />
                 In-progress section
                <LinearProgress
                    variant="determinate"
                    value={100}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: `${completedPercentage}%`,
                        width: `${inProgressPercentage}%`,height: 5,
                        zIndex: 2,
                    }} color={'warning'}
                />
                 Not started section
                <LinearProgress
                    variant="determinate"
                    value={100}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: `${completedPercentage + inProgressPercentage}%`,
                        width: `${notStartedPercentage}%`,height: 5,
                        zIndex: 1,
                    }} color={'error'}
                />*/}
          /*  </Box>

    );
};*/

export default StackedProgressBar;
