import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import * as React from 'react';

export function noop() {}

class MonacoEditor extends React.Component {
  static defaultProps = {
    width: "100%",
    height: "100%",
    value: null,
    defaultValue: "",
    language: "javascript",
    theme: null,
    options: {},
    overrideServices: {},
    editorWillMount: noop,
    editorDidMount: noop,
    editorWillUnmount: noop,
    onChange: noop,
    className: null,
  };

  editor;

  containerElement;

  _subscription;

  __prevent_trigger_change_event;

  constructor(props) {
    super(props);
    this.containerElement = undefined;
  }

  componentDidMount() {
    this.initMonaco();
  }

  componentDidUpdate(prevProps) {
    const { value, language, theme, height, options, width, className } =
      this.props;

    const { editor } = this;
    const model = editor.getModel();

    if (this.props.value != null && this.props.value !== model.getValue()) {
      this.__prevent_trigger_change_event = true;
      this.editor.pushUndoStop();
      // pushEditOperations says it expects a cursorComputer, but doesn't seem to need one.
      // @ts-expect-error
      model.pushEditOperations(
        [],
        [
          {
            range: model.getFullModelRange(),
            text: value,
          },
        ]
      );
      this.editor.pushUndoStop();
      this.__prevent_trigger_change_event = false;
    }
    if (prevProps.language !== language) {
      monaco.editor.setModelLanguage(model, language);
    }
    if (prevProps.theme !== theme) {
      monaco.editor.setTheme(theme);
    }
    if (editor && (width !== prevProps.width || height !== prevProps.height)) {
      editor.layout();
    }
    if (prevProps.options !== options) {
      // Don't pass in the model on update because monaco crashes if we pass the model
      // a second time. See https://github.com/microsoft/monaco-editor/issues/2027
      const { model: _model, ...optionsWithoutModel } = options;
      editor.updateOptions({
        ...(className ? { extraEditorClassName: className } : {}),
        ...optionsWithoutModel,
      });
    }
  }

  componentWillUnmount() {
    this.destroyMonaco();
  }

  assignRef = (component) => {
    this.containerElement = component;
  };

  destroyMonaco() {
    if (this.editor) {
      this.editorWillUnmount(this.editor);
      this.editor.dispose();
      const model = this.editor.getModel();
      if (model) {
        model.dispose();
      }
    }
    if (this._subscription) {
      this._subscription.dispose();
    }
  }

  initMonaco() {
    const value =
      this.props.value != null ? this.props.value : this.props.defaultValue;
    const { language, theme, overrideServices, className } = this.props;
    if (this.containerElement) {
      // Before initializing monaco editor
      const options = { ...this.props.options, ...this.editorWillMount() };
      this.editor = monaco.editor.create(
        this.containerElement,
        {
          value,
          language,
          ...(className ? { extraEditorClassName: className } : {}),
          ...options,
          ...(theme ? { theme } : {}),
        },
        overrideServices
      );
      // After initializing monaco editor
      this.editorDidMount(this.editor);
    }
  }

  editorWillMount() {
    const { editorWillMount } = this.props;
    const options = editorWillMount(monaco);
    return options || {};
  }

  editorDidMount(editor) {
    this.props.editorDidMount(editor, monaco);

    this._subscription = editor.onDidChangeModelContent((event) => {
      if (!this.__prevent_trigger_change_event) {
        this.props.onChange(editor.getValue(), event);
      }
    });
  }

  editorWillUnmount(editor) {
    const { editorWillUnmount } = this.props;
    editorWillUnmount(editor, monaco);
  }

  render() {
    const { width, height } = this.props;
    const fixedWidth = '800px';
    const fixedHeight = '600px';
    const style = {
      width: fixedWidth,
      height: fixedHeight,
    };

    return (
      <div
        ref={this.assignRef}
        style={style}
        className="react-monaco-editor-container"
      />
    );
  }
}

export default MonacoEditor;