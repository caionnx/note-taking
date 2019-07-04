import Form from "./Form.js";
import { generateNodeElement } from "../utils.js";
import {
  NOTE_ELEMENTS_CLASS_SELECTORS,
  TEMPLATES,
  A11Y_FOCUSABLE_CLASS_SELECTORS
} from "../config.js";

/*
 * Renders a view for an specific event, either 'edit' or 'delete'
 * reveice: <Object> {
 *    <Object> formConfig: config for form validation,
 *    <String> view: type of template,
 *    <Object> noteData: { id, note, color },
 *    <NodeElement> originalView
 *  }
 */
class NoteEventView extends Form {
  constructor({ formConfig, view, noteData, originalView }) {
    super(formConfig);
    this.cancelEvent = this.cancelEvent.bind(this);
    this.rootNode = generateNodeElement(TEMPLATES.note[view](noteData));
    this.originalView = originalView;
    this.formConfig.rootNodeForValidation = this.rootNode;
    this.prepareValidationAndFields();
    this.bindCancelEvent(view);
  }

  cancelEvent() {
    const thisParentNode = this.rootNode.parentNode;
    const originalDisplayNode = this.originalView;
    // Replace this view with the previous element
    thisParentNode.replaceChild(originalDisplayNode, this.rootNode);
    // Focus back on previous element
    originalDisplayNode
      .querySelector("." + A11Y_FOCUSABLE_CLASS_SELECTORS.display)
      .focus();
  }

  bindCancelEvent(type) {
    const cancelButton = this.rootNode.querySelector(
      "." + NOTE_ELEMENTS_CLASS_SELECTORS.cancel[type]
    );
    cancelButton.addEventListener("click", this.cancelEvent);
  }
}

export default NoteEventView;
