export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  isUnlocked: boolean;
}

export interface InstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
}
