import * as React from 'react';
import ControlBar from 'src/commons/controlBar/ControlBar';
import { ControlBarTableOfContentsButton } from 'src/commons/controlBar/ControlBarTableOfContentsButton';

type ControlBarProps = OwnProps;

type OwnProps = {
  handleOpenToc: () => void;
};

const SicpControlBar: React.FC<ControlBarProps> = props => {
  const menuButton = React.useMemo(
    () => <ControlBarTableOfContentsButton key="toc" handleOpenToc={props.handleOpenToc}/>,
    [props.handleOpenToc]
  );

  const controlBarProps = {
    editorButtons: [menuButton],
    flowButtons: [],
    editingWorkspaceButtons: []
  };

  return <ControlBar {...controlBarProps} />;
};

export default SicpControlBar;
