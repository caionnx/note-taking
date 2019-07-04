import Form from "./Form";

class AddNote extends Form {
  constructor(formConfig, formContainer) {
    super(formConfig);
    this.rootNode = formContainer;
    this.formConfig.rootNodeForValidation = this.rootNode;
    this.prepareValidationAndFields();
  }
}

export default AddNote;
