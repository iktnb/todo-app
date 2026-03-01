export interface BoardHeaderCloudResetConfirmModalProps {
  isOpen: boolean;
  cloudResetPhrase: string;
  cloudResetConfirmInput: string;
  onCloudResetConfirmInputChange: (nextValue: string) => void;
  isCloudResetPhraseValid: boolean;
  isCloudResetPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}
