import { Stepper as MuiStepper, Step, StepLabel, Card } from '@mui/material';

interface StepperProps {
    activeStep: number;
    steps: string[];
}

const Stepper = ({activeStep, steps}: StepperProps) => {
    return (
        <Card style={{marginTop: 10, position: 'sticky', top: 60, zIndex: 9999}}>
            <MuiStepper style={{padding: 10}} alternativeLabel activeStep={activeStep}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </MuiStepper>
        </Card>
    )
}

export default Stepper;