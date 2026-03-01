import type { SomedayItem } from "../someday-item";

export interface BoardHeaderSomedayModalProps {
  isOpen: boolean;
  somedayItems: SomedayItem[];
  onMoveToInbox: (itemId: string) => void;
  onClose: () => void;
}
