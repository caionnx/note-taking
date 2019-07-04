import clonedeep from "lodash.clonedeep";
import { debounce } from "./utils.js";

// ClassName to allow focus change on different events
export const A11Y_FOCUSABLE_CLASS_SELECTORS = {
  display: "js-note-focus-name",
  edit: "js-note-focus-edit-label",
  delete: "js-note-focus-delete-question"
};

// Elements class to be used in templates and core functionality
export const NOTE_ELEMENTS_CLASS_SELECTORS = {
  editButton: "js-note-edit",
  deleteButton: "js-note-delete",
  cancel: {
    edit: "js-note-cancel-edit",
    delete: "js-note-cancel-delete"
  }
};

const SVG = {
  edit: `
  <svg class="note-item__icon" xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 0 24 24" width="22px">
    <path d="M21.635,6.366c-0.467-0.772-1.043-1.528-1.748-2.229c-0.713-0.708-1.482-1.288-2.269-1.754L19,1C19,1,21,1,22,2S23,5,23,5  L21.635,6.366z M10,18H6v-4l0.48-0.48c0.813,0.385,1.621,0.926,2.348,1.652c0.728,0.729,1.268,1.535,1.652,2.348L10,18z M20.48,7.52  l-8.846,8.845c-0.467-0.771-1.043-1.529-1.748-2.229c-0.712-0.709-1.482-1.288-2.269-1.754L16.48,3.52  c0.813,0.383,1.621,0.924,2.348,1.651C19.557,5.899,20.097,6.707,20.48,7.52z M4,4v16h16v-7l3-3.038V21c0,1.105-0.896,2-2,2H3  c-1.104,0-2-0.895-2-2V3c0-1.104,0.896-2,2-2h11.01l-3.001,3H4z"/>
  </svg>
  `,
  delete: `
  <svg class="note-item__icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 50 50" width="24px">
    <path d="M25,15.801l-6.543-6.543c-2.198-2.198-5.41-2.199-7.607-0.001l-1.592,1.592  c-2.198,2.198-2.197,5.41,0.001,7.607L15.802,25l-6.543,6.543c-2.198,2.197-2.199,5.41-0.001,7.607l1.592,1.592  c2.198,2.197,5.41,2.196,7.607-0.001L25,34.197l6.543,6.544c2.197,2.197,5.409,2.198,7.607,0.001l1.592-1.592  c2.198-2.197,2.196-5.41-0.001-7.607L34.198,25l6.544-6.543c2.197-2.198,2.199-5.41,0.001-7.607l-1.592-1.592  c-2.198-2.198-5.41-2.197-7.607,0.001L25,15.801z"/>
  </svg>
  `
};

// String templates for elements of page
export const TEMPLATES = {
  note: {
    display: ({ id, note, color }) => `
      <li id="${id}" class="note-item note-item--with-fade note-item--${color}">
        <span
          class="no-outline ${A11Y_FOCUSABLE_CLASS_SELECTORS.display}"
          tabindex="-1">
          ${note}
        </span>
        <div class="note-item__actions">
          <button
            title="Edit"
            class="button button--small button--incolor js-note-edit">
            ${SVG.edit}
          </button>
          <button
            title="Delete"
            class="button button--small button--incolor js-note-delete">
            ${SVG.delete}
          </button>
        </div>
      </li>
    `,
    colorSelect: color => {
      let optionsHTML = "";
      const options = [
        { value: "red", display: "Red" },
        { value: "blue", display: "Blue" },
        { value: "orange", display: "Orange" },
        { value: "grey", display: "Grey" }
      ];

      options.forEach(
        ({ value, display }) =>
          (optionsHTML += `
            <option 
              ${color === value ? 'selected="true"' : ""}
               value="${value}">
              ${display}
            </option>`)
      );

      return `
        <select class="js-note-color" title="Select a color for the note. This field is required.">
          <option value="invalid">Select a color</option>
          ${optionsHTML}
        </select>
      `;
    },
    edit: function({ id, note, color }) {
      return `
      <li id="${id}" class="note-item note-item--${color}">
        <form class="note-form" tabindex="-1">
          <div class="note-form__container">
            <label
              class="no-outline ${A11Y_FOCUSABLE_CLASS_SELECTORS.edit}"
              tabindex="-1"
              for="note-${id}-value">
              Edit the note
            </label>
          </div>
          <div class="note-form__container">  
            <input id="note-${id}-value" class="js-note-value" type="text" value="${note}" />
          </div>
          <div class="note-form__container">
            ${this.colorSelect(color)}
          </div>
          <div class="note-form__container note-form__container--evenly">
            <button class="button button--bordered button--incolor" type="submit">Confirm</button>
            <button class="button button--bordered button--incolor js-note-cancel-edit" type="button">Cancel</button>
          </div>
        </form>
      </li>`;
    },
    delete: ({ id, note, color }) => `
      <li id="${id}" class="note-item note-item--${color}">
        <form class="note-form">
          <div class="note-form__container">
            <legend 
              class="no-outline ${A11Y_FOCUSABLE_CLASS_SELECTORS.delete}"
              tabindex="-1">
              Are you sure you want to delete "${note}"?
            </legend>
          </div>
          <div class="note-form__container note-form__container--evenly">
            <button class="button button--bordered button--incolor" type="submit">Yes</button>
            <button class="button button--bordered button--incolor js-note-cancel-delete" type="button">No</button>
          </div>
        </form>
      </li>
    `
  }
};

/*
 * Describe the fields requireds for a note,
 * function for validation and handle invalid values
 * and function to handle error messages
 */
const DEFAULT_NOTE_FORM_AND_FIELDS = {
  formQuerySelector: "form",
  fieldsObject: {
    note: {
      value: function() {
        return this.nodeElement.value;
      },
      selector: ".js-note-value",
      test: function() {
        return this.value().trim() !== "";
      },
      handleInvalidValue: function() {
        if (this.hasErrorAlert) return;
        this.nodeElement.classList.add("input-has-error");
        this.nodeElement.insertAdjacentHTML(
          "afterend",
          '<span class="text-has-error">This field is required.</span>'
        );
        this.hasErrorAlert = true;
      },
      setClearInvalidView: function() {
        const node = this.nodeElement;
        const textError = node.nextSibling;
        const clear = debounce(() => {
          node.classList.remove("input-has-error");
          if (textError && textError.parentNode)
            textError.parentNode.removeChild(textError);
          node.removeEventListener("input", clear);
          this.hasErrorAlert = false;
        }, 250);
        node.addEventListener("input", clear);
      }
    },
    color: {
      value: function() {
        return this.nodeElement[this.nodeElement.selectedIndex].value;
      },
      selector: ".js-note-color",
      test: function() {
        return this.value() !== "invalid";
      },
      handleInvalidValue: function() {
        if (this.hasErrorAlert) return;
        this.nodeElement.classList.add("input-has-error");
        this.nodeElement.insertAdjacentHTML(
          "afterend",
          '<span class="text-has-error">Please, select a color for the note.</span>'
        );
        this.hasErrorAlert = true;
      },
      setClearInvalidView: function() {
        const node = this.nodeElement;
        const textError = node.nextSibling;
        const clear = () => {
          node.classList.remove("input-has-error");
          if (textError && textError.parentNode)
            textError.parentNode.removeChild(textError);
          node.removeEventListener("input", clear);
          this.hasErrorAlert = false;
        };
        node.addEventListener("input", clear);
      }
    }
  }
};

// Config of forms for each scenario: Add, Edit, Delete
export const NOTE_FORM_AND_FIELDS = {
  add: {
    ...clonedeep(DEFAULT_NOTE_FORM_AND_FIELDS),
    formQuerySelector: "#new-note"
  },
  edit: { ...clonedeep(DEFAULT_NOTE_FORM_AND_FIELDS) },
  delete: {
    ...clonedeep(DEFAULT_NOTE_FORM_AND_FIELDS),
    fieldsObject: {} // To delete there is no fields to fill
  }
};

export const APP_ELEMENTS_SELECTORS = {
  list: "#list",
  addNoteForm: "#new-note",
  emptyMessage: "#empty-list",
  srStatus: "#sr-status"
};

export const IS_HIDDEN_CLASS = "is-hidden";

// Return a message for A11Y role status
export const A11Y_QTY_STATUS = {
  0: () => "",
  1: () => "You have 1 note.",
  multiple: qty => `You have ${qty} notes.`
};
