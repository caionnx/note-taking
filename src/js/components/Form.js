import { generateContentID, sanitizeHTML } from "../utils.js";
/*
 * Handle simple form validation
 * receive:
 *  <Object> config {
 *    <String> formQuerySelector,
 *    <Object> fieldsObject
 *  }
 * shouldInclude:
 *    <NodeElement> formConfig.rootNodeForValidation
 *    <Function> postSubmitValidAction
 */
class Form {
  constructor(config) {
    this.formConfig = config;
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  prepareValidationAndFields() {
    const formQuerySelector = this.formConfig.formQuerySelector;
    this.form = this.formConfig.rootNodeForValidation.querySelector(
      formQuerySelector
    );
    this.form.addEventListener("submit", this.handleSubmit);
    this.setFields();
  }

  setFields() {
    const fieldsConfig = this.formConfig.fieldsObject;
    this.fields = {};
    for (const fieldConfig in fieldsConfig) {
      if (fieldsConfig.hasOwnProperty(fieldConfig)) {
        const field = fieldsConfig[fieldConfig];
        field.name = fieldConfig;
        field.nodeElement = this.form.querySelector(field.selector);
        this.fields[fieldConfig] = field;
      }
    }
  }

  // Get value from each field and trigger invalid if necessary
  generateNewContent() {
    const content = { id: generateContentID() };
    for (const fieldConfig in this.fields) {
      if (!this.fields.hasOwnProperty(fieldConfig)) return;
      const field = this.fields[fieldConfig];
      if (field.test()) {
        content[field.name] = sanitizeHTML(field.value());
      } else {
        field.handleInvalidValue();
        field.setClearInvalidView();
      }
    }

    return content;
  }

  resetForm() {
    this.form.reset();
  }

  // Validate if content has all attributes
  validateSubmit(content) {
    const keys = Object.keys(this.fields);
    return keys.every(id => typeof content[id] !== "undefined");
  }

  handleSubmit(ev) {
    ev.preventDefault();
    const newContent = this.generateNewContent();
    if (this.validateSubmit(newContent)) {
      this.resetForm();
      this.postSubmitValidAction(newContent);
    } else {
      // Bring focus back so user knows what happen
      this.form.focus();
    }
  }
}

export default Form;
