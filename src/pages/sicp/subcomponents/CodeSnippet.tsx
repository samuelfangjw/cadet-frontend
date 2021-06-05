import { Pre } from '@blueprintjs/core';
import { HighlightRulesSelector, ModeSelector } from 'js-slang/dist/editors/ace/modes/source';
import { Resizable } from 're-resizable';
import * as React from 'react';
import AceEditor from 'react-ace';
import ControlBar from 'src/commons/controlBar/ControlBar';
import { ControlBarCloseButton } from 'src/commons/controlBar/ControlBarCloseButton';
import { ControlBarShowDependenciesButton } from 'src/commons/controlBar/ControlBarShowDependenciesButton';

import { CodeSnippetContext } from '../Sicp';
import SicpWorkspaceContainer from './SicpWorkspaceContainer';

export type CodeSnippetProps = OwnProps;
type OwnProps = {
  body: string;
  output: string;
  id: string;
  initialEditorValueHash: string;
  initialPrependHash?: string | undefined;
  initialFullProgramHash?: string | undefined;
};

const resizableProps = {
  enable: {
    top: false,
    right: false,
    bottom: true,
    left: false,
    topRight: false,
    bottomRight: false,
    bottomLeft: false,
    topLeft: false
  },
  defaultSize: {
    width: '100%',
    height: '400px'
  },
  minHeight: '250px',
  maxHeight: '2000px'
};

const CodeSnippet: React.FC<CodeSnippetProps> = props => {
  const { body, output, id } = props;
  const context = React.useContext(CodeSnippetContext);
  const [showPrepend, setShowPrepend] = React.useState(false);

  const handleShowDependencies = React.useCallback(() => {
    setShowPrepend(!showPrepend);
  }, [showPrepend]);

  const handleOpen = () => {
    context.setActive(id);
  };

  const handleClose = React.useCallback(() => {
    context.setActive('0');
  }, [context]);

  const WorkspaceProps = {
    initialEditorValueHash: showPrepend
      ? props.initialFullProgramHash
      : props.initialEditorValueHash,
    initialPrependHash: showPrepend ? undefined : props.initialPrependHash,
    isSicpEditor: true,

    handleCloseEditor: handleClose
  };

  HighlightRulesSelector(4);
  ModeSelector(4);

  const closeButton = React.useMemo(
    () => <ControlBarCloseButton key="close" handleClose={handleClose} />,
    [handleClose]
  );

  const showDependenciesButton = React.useMemo(
    () => (
      <ControlBarShowDependenciesButton
        key="dependencies"
        buttonText={showPrepend ? 'Hide Dependencies' : 'Show Dependencies'}
        handleShowDependencies={handleShowDependencies}
      />
    ),
    [handleShowDependencies, showPrepend]
  );

  const controlBarProps = {
    editorButtons: props.initialPrependHash ? [showDependenciesButton] : [],
    flowButtons: [],
    editingWorkspaceButtons: [closeButton]
  };

  // For view only code snippets
  const aceEditorProps = {
    className: 'react-ace',
    mode: 'source4defaultNONE',
    theme: 'source',
    fontSize: 20,
    highlightActiveLine: false,
    wrapEnabled: true,
    height: 'unset',
    width: '100%',
    showGutter: false,
    showPrintMargin: false,
    readOnly: true,
    maxLines: Infinity,
    value: body,
    setOptions: {
      fontFamily: "'Inconsolata', 'Consolas', monospace"
    }
  };

  return (
    <div className="sicp-code-snippet">
      {context.active === id ? (
        <>
          <ControlBar {...controlBarProps} />
          <Resizable {...resizableProps}>
            <div className="sicp-resizable">
              <SicpWorkspaceContainer {...WorkspaceProps} />
            </div>
          </Resizable>
        </>
      ) : (
        <>
          <div className="code-body" onClick={handleOpen}>
            <AceEditor {...aceEditorProps} />
          </div>
        </>
      )}
      {output && <Pre>{output}</Pre>}
    </div>
  );
};

export default CodeSnippet;
