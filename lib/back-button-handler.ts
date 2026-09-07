'use client';

import { useEffect, useRef, useId } from 'react';
import { AppNavTab } from '@/types/navigation';

interface ModalStackItem {
  id: string;
  name?: string;
  onClose: () => void;
}

// Module-level singleton state for browser history & modal management
const modalStack: ModalStackItem[] = [];
const poppedModalIds = new Set<string>();
let programmaticBackCount = 0;
let tabNavigationHandler: ((tab: AppNavTab | null) => void) | null = null;
let isListenerInitialized = false;

/**
 * Central popstate event listener for the entire application.
 * Manages modal closes, drawer collapses, and tab navigation.
 */
function handlePopState(event: PopStateEvent) {
  // Case 1: PopState was triggered by programmatic history.back() (e.g. user clicked UI 'Batal' or 'X')
  if (programmaticBackCount > 0) {
    programmaticBackCount--;
    return;
  }

  // Case 2: A modal, drawer, or bottom sheet is currently open
  if (modalStack.length > 0) {
    const topModal = modalStack.pop();
    if (topModal) {
      // Mark this modal as closed by browser popstate so its useEffect won't trigger an extra history.back()
      poppedModalIds.add(topModal.id);
      try {
        topModal.onClose();
      } catch (err) {
        console.error(`[BackButton] Error closing modal ${topModal.name || topModal.id}:`, err);
      }
    }
    // Consumed by modal - do not switch tabs
    return;
  }

  // Case 3: No modals are open - navigate between tabs
  if (tabNavigationHandler) {
    const targetTab = (event.state && event.state.tab) ? (event.state.tab as AppNavTab) : 'dashboard';
    tabNavigationHandler(targetTab);
  }
}

/**
 * Initializes the popstate listener on the window object (runs once in browser).
 */
function ensurePopStateListener() {
  if (typeof window === 'undefined' || isListenerInitialized) return;
  window.addEventListener('popstate', handlePopState);
  isListenerInitialized = true;
}

/**
 * Register the global callback for tab navigation when the user presses back
 * and no modals are open.
 */
export function setTabNavigationHandler(handler: ((tab: AppNavTab | null) => void) | null) {
  tabNavigationHandler = handler;
  ensurePopStateListener();
}

/**
 * Push a new tab entry into the browser's history stack.
 */
export function pushTabHistory(tab: AppNavTab) {
  if (typeof window === 'undefined') return;
  const targetUrl = tab === 'dashboard' ? window.location.pathname : `#${tab}`;
  window.history.pushState({ type: 'tab', tab }, '', targetUrl);
}

/**
 * Replace the current history entry with a tab state (useful for initial page load).
 */
export function replaceTabHistory(tab: AppNavTab) {
  if (typeof window === 'undefined') return;
  const targetUrl = tab === 'dashboard' ? window.location.pathname : `#${tab}`;
  window.history.replaceState({ type: 'tab', tab }, '', targetUrl);
}

/**
 * React hook to bind any modal, drawer, bottom-sheet, or preview dialog
 * to the Android hardware back button & swipe back gestures.
 *
 * - When opened, pushes a dummy entry to window.history and adds to modalStack.
 * - When back is pressed, pops from modalStack and calls onClose().
 * - When closed via UI (e.g. 'Batal' button), triggers window.history.back() cleanly.
 */
export function useModalBackHandler(
  isOpen: boolean,
  onClose: () => void,
  modalName?: string
) {
  const generatedId = useId();
  const id = modalName ? `${modalName}-${generatedId}` : generatedId;
  const onCloseRef = useRef(onClose);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    ensurePopStateListener();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isOpen && !wasOpenRef.current) {
      // Modal just opened
      wasOpenRef.current = true;

      // Push history state so Android back button won't exit the page
      window.history.pushState(
        { type: 'modal', modalId: id, name: modalName },
        '',
        window.location.href
      );

      // Register onto the modal stack
      modalStack.push({
        id,
        name: modalName,
        onClose: () => onCloseRef.current(),
      });
    } else if (!isOpen && wasOpenRef.current) {
      // Modal just closed
      wasOpenRef.current = false;

      // Remove from modalStack if still present
      const idx = modalStack.findIndex((item) => item.id === id);
      if (idx !== -1) {
        modalStack.splice(idx, 1);
      }

      // Check if closed by browser back (popstate) or by UI action
      if (poppedModalIds.has(id)) {
        // Closed by popstate - browser history already popped
        poppedModalIds.delete(id);
      } else {
        // Closed by UI button (e.g. 'Batal' / 'X' / backdrop click)
        // We must pop the history state from the browser to keep history in sync
        programmaticBackCount++;
        window.history.back();

        // Safety timeout in case popstate does not fire
        setTimeout(() => {
          if (programmaticBackCount > 0) {
            programmaticBackCount--;
          }
        }, 500);
      }
    }
  }, [isOpen, id, modalName]);

  // Handle component unmounting while modal was open
  useEffect(() => {
    return () => {
      if (wasOpenRef.current) {
        wasOpenRef.current = false;
        const idx = modalStack.findIndex((item) => item.id === id);
        if (idx !== -1) {
          modalStack.splice(idx, 1);
        }
        if (poppedModalIds.has(id)) {
          poppedModalIds.delete(id);
        } else {
          programmaticBackCount++;
          window.history.back();
          setTimeout(() => {
            if (programmaticBackCount > 0) {
              programmaticBackCount--;
            }
          }, 500);
        }
      }
    };
  }, [id]);
}

/**
 * Returns true if any modal or bottom sheet is currently open.
 */
export function isAnyModalOpen(): boolean {
  return modalStack.length > 0;
}
