import { Accessibility, Activity, Armchair, AudioLines, Bike, Brain, Dumbbell, Footprints, Hand, Heart, Music2, PersonStanding, Scale, Sparkles, StretchHorizontal, Wind } from "lucide-react";

export const goals = [
  { name: "Walking", Icon: Footprints }, { name: "Balance", Icon: Scale },
  { name: "Strength", Icon: Dumbbell }, { name: "Posture", Icon: PersonStanding },
  { name: "Flexibility", Icon: StretchHorizontal }, { name: "Daily Movement", Icon: Accessibility },
  { name: "Hand Coordination", Icon: Hand }, { name: "Voice", Icon: AudioLines },
] as const;

export const mindActivities = [
  { name: "Yoga", Icon: PersonStanding, purpose: "Gentle yoga can be part of an exercise and wellness routine.", options: ["Beginner", "Seated", "Gentle", "Balance-focused", "Flexibility-focused", "Relaxation"] },
  { name: "Tai Chi", Icon: Activity, purpose: "Slow, flowing movements can support mindful movement and balance practice.", options: ["Beginner", "Seated", "Gentle"] },
  { name: "Dance", Icon: Music2, purpose: "Dance combines enjoyable movement, rhythm, and coordination.", options: ["Seated", "Gentle", "Standing"] },
  { name: "Stretching", Icon: StretchHorizontal, purpose: "Gentle stretching can help you explore comfortable movement.", options: ["Seated", "Gentle", "Flexibility-focused"] },
  { name: "Breathing", Icon: Wind, purpose: "Slow breathing offers a quiet pause and supports relaxation.", options: ["1 minute", "5 minutes", "10 minutes"] },
  { name: "Meditation", Icon: Brain, purpose: "A short meditation can create a calm moment in your day.", options: ["5 minutes", "10 minutes", "20 minutes"] },
  { name: "Relaxation", Icon: Heart, purpose: "A guided pause can help you settle after activity or a busy day.", options: ["Seated", "Lying down", "Quiet time"] },
  { name: "Music", Icon: Music2, purpose: "Music can be an optional companion for movement or relaxation.", options: ["Calming", "Upbeat", "My favorites"] },
] as const;

export const symptomCategories = ["Tremor", "Movement speed", "Stiffness", "Walking", "Balance", "Turning", "Freezing", "Hand coordination", "Dexterity", "Voice and speech", "Facial movement", "Daily activities", "Sleep", "Fatigue", "Mood"];

export const durations = [5, 10, 20, 30] as const;

export const sessionSteps = (goal: string, minutes: number) => [
  { title: "Warm up", detail: `${Math.max(1, Math.round(minutes * .2))} minutes of comfortable breathing and easy movement.` },
  { title: `${goal} practice`, detail: `${Math.max(2, Math.round(minutes * .5))} minutes at a pace that feels safe for you.` },
  { title: goal === "Walking" ? "Balance pause" : "Everyday movement", detail: `${Math.max(1, Math.round(minutes * .2))} minutes near a stable support.` },
  { title: "Cool down", detail: `${Math.max(1, Math.round(minutes * .1))} minute of slower movement and breathing.` },
];

export const treatmentTopics = [
  { title: "Medication", text: "Medicines may help manage symptoms. Choices and timing are personal and require a qualified healthcare professional." },
  { title: "Physical Therapy", text: "A physical therapist can assess movement and develop an individualized plan for strength, walking, and balance." },
  { title: "Occupational Therapy", text: "An occupational therapist can suggest strategies and equipment for safer, easier daily activities." },
  { title: "Speech Therapy", text: "A speech-language pathologist can assess voice, speech, communication, and swallowing." },
  { title: "Exercise", text: "Regular, ability-appropriate activity can support general health, mobility, and confidence." },
  { title: "Surgical Options", text: "Some people may be evaluated for procedures by a specialist when other approaches are not enough." },
  { title: "Lifestyle & Wellness", text: "Sleep, nutrition, social connection, and enjoyable activity can support overall wellbeing." },
  { title: "Clinical Trials", text: "Research studies test new approaches. A healthcare professional can help you consider potential benefits and risks." },
] as const;

export const activityIcon = { Walking: Footprints, Yoga: PersonStanding, Voice: AudioLines, Relaxation: Heart, Exercise: Dumbbell, Dance: Bike, Wellness: Sparkles };