import { useState } from 'react';
import PinModal from '../components/PinModal';

export default function usePinConfirm() {
  const [pinOpen, setPinOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // page calls this to say "I need a PIN before I continue"
  const requestPin = (action) => {
    setPendingAction(() => action);
    setPinOpen(true);
  };

  const handleSuccess = (pin) => {
    if (pendingAction) pendingAction(pin);
    setPendingAction(null);
  };

  const pinModal = (
    <PinModal
      open={pinOpen}
      onClose={() => {
        setPinOpen(false);
        setPendingAction(null);
      }}
      onSuccess={handleSuccess}
    />
  );

  return { requestPin, pinModal };
}