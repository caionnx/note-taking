import NoteEventView from "./NoteEventView.js";
import { generateNodeElement } from "../utils.js";
import {
  NOTE_FORM_AND_FIELDS,
  TEMPLATES,
  A11Y_FOCUSABLE_CLASS_SELECTORS,
  NOTE_ELEMENTS_CLASS_SELECTORS
} from "../config.js";

/*
 * Handle note view and additional actions for a single note
 * receive:
 *  <Object> ConfigOfNoteData,
 *  <Function> onChangeSideEffect
 */
class Note {
  constructor(config, onChangeSideEffect) {
    this.dispatchEditContent = this.dispatchEditContent.bind(this);
    this.dispatchDeleteContent = this.dispatchDeleteContent.bind(this);
    this.onChangeSideEffect = onChangeSideEffect;
    this.nodeElement = this.createNode(config, "display");
    this.currentConfig = config;
    this.dispatchActions = {
      edit: this.dispatchEditContent,
      delete: this.dispatchDeleteContent
    };
    this.additionalViews = {};
    this.bindButtonActions();
  }

  bindButtonActions() {
    const editButton = this.nodeElement.querySelector(
      "." + NOTE_ELEMENTS_CLASS_SELECTORS.editButton
    );
    const deleteButton = this.nodeElement.querySelector(
      "." + NOTE_ELEMENTS_CLASS_SELECTORS.deleteButton
    );
    editButton.addEventListener("click", () =>
      this.replaceWithAdditionalView("edit")
    );
    deleteButton.addEventListener("click", () =>
      this.replaceWithAdditionalView("delete")
    );
  }

  createNode(config) {
    return generateNodeElement(TEMPLATES.note.display(config));
  }

  // Replace this node with another view (Edit or Delete View)
  replaceWithAdditionalView(type) {
    const originalDisplayNode = this.nodeElement;
    const parentNode = this.nodeElement.parentNode;
    this.additionalViews[type] = new NoteEventView({
      formConfig: NOTE_FORM_AND_FIELDS[type],
      view: type,
      noteData: this.currentConfig,
      originalView: originalDisplayNode
    });
    // Add an event if the event is submitted and valid
    this.additionalViews[type].postSubmitValidAction = this.dispatchActions[
      type
    ];
    // Replace default View with AdditionalView, either edit or delete
    parentNode.replaceChild(
      this.additionalViews[type].rootNode,
      originalDisplayNode
    );
    // To focus not be lost in the page
    this.additionalViews[type].rootNode
      .querySelector("." + A11Y_FOCUSABLE_CLASS_SELECTORS[type])
      .focus();
  }

  dispatchEditContent(note) {
    const component = this.additionalViews.edit;
    const editParentNode = component.rootNode.parentNode;
    this.currentConfig = { ...note, id: this.currentConfig.id }; // Make sure to keep the same ID
    this.nodeElement = this.createNode(note, "display");
    this.bindButtonActions();
    // Replace Edit component with the new View
    editParentNode.replaceChild(this.nodeElement, component.rootNode);
    // The EditComponent for this Note is no longer needed, so can be removed
    this.additionalViews.edit = null;
    this.onChangeSideEffect(this.currentConfig.id, "edit");
    // Bring focus back to the new node
    this.nodeElement
      .querySelector("." + A11Y_FOCUSABLE_CLASS_SELECTORS.display)
      .focus();
  }

  dispatchDeleteContent() {
    const component = this.additionalViews.delete;
    const deleteNode = component.rootNode;
    const parentNode = deleteNode.parentNode;
    parentNode.removeChild(deleteNode);
    // The DeleteComponent for this Note is no longer needed, so can be removed
    this.additionalViews.delete = null;
    this.onChangeSideEffect(this.currentConfig.id, "delete");
  }
}

export default Note;
