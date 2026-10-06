import { Check } from 'lucide-react';
export default function BookingSteps({ steps = [], currentStep = 0 }) {
  return <div className="step-track" aria-label="Booking progress">{steps.map((label,index)=><div className={`step-item ${index===currentStep?'current':''} ${index<currentStep?'done':''}`} key={label} aria-current={index===currentStep?'step':undefined}><span className="step-circle">{index<currentStep?<Check size={15}/>:index+1}</span><span>{label}</span></div>)}</div>;
}
