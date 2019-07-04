import AddNote from "./AddNote.js";
import Note from "./Note.js";
import {
  NOTE_FORM_AND_FIELDS,
  APP_ELEMENTS_SELECTORS,
  IS_HIDDEN_CLASS,
  A11Y_QTY_STATUS
} from "../config.js";

/*
 * Handle all the global state of notes, also side effects on note change
 * receive:
 *   <NodeElement> rootOfApp: {
 *     <NodeElement> listElement,
 *     <NodeElement>: emptyMessageElement,
 *     <NodeElement>: addNewNoteForm
 *   }
 */
class App {
  constructor(nodeElement) {
    this.pushNote = this.pushNote.bind(this);
    this.onNoteActionDispatch = this.onNoteActionDispatch.bind(this);
    this.rootNode = nodeElement;
    this.listNode = this.rootNode.querySelector(APP_ELEMENTS_SELECTORS.list);
    this.emptyMessageNode = this.rootNode.querySelector(
      APP_ELEMENTS_SELECTORS.emptyMessage
    );
    this.screenReaderMessageNode = this.rootNode.querySelector(
      APP_ELEMENTS_SELECTORS.srStatus
    );
    this.notes = {};
    this.isNotesVisible = false;
    this.setAddNoteForm();
  }

  // Initialize new notes form
  setAddNoteForm() {
    this.AddNoteForm = new AddNote(NOTE_FORM_AND_FIELDS.add, this.rootNode);
    this.AddNoteForm.postSubmitValidAction = this.pushNote;
  }

  toggleNodeClass(node, className) {
    node.classList.toggle(className);
  }

  // Add or remove hidden class from list and empty message element
  toggleMessageAndList() {
    this.toggleNodeClass(this.emptyMessageNode, IS_HIDDEN_CLASS);
    this.toggleNodeClass(this.listNode, IS_HIDDEN_CLASS);
  }

  // Update a node with role status
  updateScreenReaderOnlyMessage(notesQnty) {
    const message = A11Y_QTY_STATUS[notesQnty]
      ? A11Y_QTY_STATUS[notesQnty]()
      : A11Y_QTY_STATUS.multiple(notesQnty);
    this.screenReaderMessageNode.textContent = message;
  }

  // To be triggered after every add, edit and delete
  onNoteActionDispatch(noteID, action) {
    if (action === "delete") {
      // Bring focus back to a new note
      this.rootNode.querySelector(APP_ELEMENTS_SELECTORS.addNoteForm).focus();
      delete this.notes[noteID];
    }
    const notesCount = Object.entries(this.notes).length;
    this.updateScreenReaderOnlyMessage(notesCount);

    if (notesCount && !this.isNotesVisible) {
      this.toggleMessageAndList();
      this.isNotesVisible = true;
    } else if (!notesCount && this.isNotesVisible) {
      this.toggleMessageAndList();
      this.isNotesVisible = false;
    }
  }

  // Push note into app state and into HTML list
  pushNote(newNoteConfig) {
    const NoteComponent = new Note(newNoteConfig, this.onNoteActionDispatch);
    const noteID = NoteComponent.currentConfig.id;
    this.notes[noteID] = NoteComponent;
    this.listNode.insertAdjacentElement("beforeend", NoteComponent.nodeElement);
    this.onNoteActionDispatch(noteID, "add");
    this.listNode.focus();
  }
}

export default App;
