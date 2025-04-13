import { BusinessWidget } from '../types/business';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Layout, Layouts } from 'react-grid-layout'; // Import Layout and Layouts types

const WIDGETS_STORAGE_KEY = 'businessCenterWidgets';
const LAYOUT_STORAGE_KEY = 'businessCenterLayout';

/**
 * Retrieves widgets from localStorage.
 * @returns An array of BusinessWidget objects or an empty array.
 */
export const getWidgetsFromStorage = (): BusinessWidget[] => {
  try {
    const storedWidgets = localStorage.getItem(WIDGETS_STORAGE_KEY);
    return storedWidgets ? JSON.parse(storedWidgets) : [];
  } catch (error) {
    console.error("Error reading widgets from localStorage:", error);
    return [];
  }
};

/**
 * Saves an array of widgets to localStorage.
 * @param widgets - The array of BusinessWidget objects to save.
 */
export const saveWidgetsToStorage = (widgets: BusinessWidget[]): void => {
  try {
    localStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(widgets));
  } catch (error) {
    console.error("Error saving widgets to localStorage:", error);
  }
};

/**
 * Adds a new widget to localStorage.
 * @param widget - The BusinessWidget object to add.
 */
export const addWidgetToStorage = (widget: BusinessWidget): void => {
  const currentWidgets = getWidgetsFromStorage();
  saveWidgetsToStorage([...currentWidgets, widget]);
};

/**
 * Removes a widget from localStorage by its ID.
 * @param widgetId - The ID of the widget to remove.
 */
export const removeWidgetFromStorage = (widgetId: string): void => {
  const currentWidgets = getWidgetsFromStorage();
  saveWidgetsToStorage(currentWidgets.filter(w => w.id !== widgetId));
};

/**
 * Updates a specific widget in localStorage.
 * @param updatedWidget - The updated BusinessWidget object.
 */
export const updateWidgetInStorage = (updatedWidget: BusinessWidget): void => {
    const currentWidgets = getWidgetsFromStorage();
    saveWidgetsToStorage(currentWidgets.map(w => w.id === updatedWidget.id ? updatedWidget : w));
};


/**
 * Retrieves layout from localStorage.
 * @returns The layout array or null.
*/
export const getLayoutFromStorage = (): Layouts | null => {
    try {
        const storedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);
        return storedLayout ? JSON.parse(storedLayout) : null; // Should parse into { lg: [...], md: [...], ... }
    } catch (error) {
        console.error("Error reading layout from localStorage:", error);
        return null;
    }
};

/**
 * Saves layout to localStorage.
 * @param layout - The layout array to save.
 */
export const saveLayoutToStorage = (layouts: Layouts): void => { // Accept Layouts object
    try {
        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layouts)); // Corrected variable name
    } catch (error) {
        console.error("Error saving layout to localStorage:", error);
    }
};