import { Box, Chip } from "@mui/material";
import {
  sampleAnimatedTutorialInput,
  sampleExcerciseBlockInput,
  sampleGuidedExcerciseBlockInput, sampleMCQInput
} from "../../data/sampleAILessonBlockInputs.ts";

export const SampleAIInputs = ({setSample}) => {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          padding: '8px',
          gap: '8px',
          backgroundColor: (theme) => theme.palette.background.paper,
        }}
      >
      <Chip clickable label="Animated Tutorial" onClick={() => setSample(sampleAnimatedTutorialInput)}
            size={"small"} variant="outlined" color="primary" style={{ margin: '4px' }} />
        <Chip clickable label="Guided Exercise" onClick={() => setSample(sampleGuidedExcerciseBlockInput)}
              size={"small"} variant="outlined" color="primary" style={{ margin: '4px' }} />
        <Chip clickable label="Exercise" onClick={() => setSample(sampleExcerciseBlockInput)}
              size={"small"} variant="outlined" color="primary" style={{ margin: '4px' }} />
        <Chip clickable label="Multiple Choice Excercise" onClick={() => setSample(sampleMCQInput)}
              size={"small"} variant="outlined" color="primary" style={{ margin: '4px' }} />
      </Box>
      </>
  )
}